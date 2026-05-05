import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── 타입 정의 ──────────────────────────────────────────────
interface TeeTimeSlot {
  time: string
  price: number
  is_hot_deal: boolean
}

interface CoursePayload {
  name: string
  status: 'green' | 'red' | 'yellow' | 'orange' | 'black'
  slots: TeeTimeSlot[]
  lowest_price: number | null
  discount_pct: number
  consecutive_slots: string[][]
  raw_json?: Record<string, unknown>
}

interface CrawlImportPayload {
  crawl_date: string   // "2025-07-08"
  courses: CoursePayload[]
}

// ── 코스 이름 매칭 (DB name vs 에이전트 name) ──────────────
function nameMatches(dbName: string, agentName: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9가-힣]/g, ' ').replace(/\s+/g, ' ').trim()
  const a = normalize(dbName)
  const b = normalize(agentName)
  return a === b || a.includes(b) || b.includes(a)
}

// ── 서비스 롤 Supabase 클라이언트 ─────────────────────────
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

// ── Bearer 토큰 인증 ───────────────────────────────────────
function verifyAuth(request: NextRequest): boolean {
  const secret = process.env.API_SECRET_KEY
  if (!secret) return false
  const auth = request.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}`
}

// ══════════════════════════════════════════════════════════
// POST /api/crawl-import
// ══════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  // 1. 인증
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. 페이로드 파싱
  let payload: CrawlImportPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { crawl_date, courses } = payload
  if (!crawl_date || !Array.isArray(courses)) {
    return NextResponse.json({ error: 'Missing crawl_date or courses' }, { status: 400 })
  }

  // 날짜 형식 검증 YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(crawl_date)) {
    return NextResponse.json({ error: 'crawl_date must be YYYY-MM-DD' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // 3. DB에서 전체 코스 목록 조회
  const { data: dbCourses, error: coursesErr } = await supabase
    .from('courses')
    .select('id, name, slug')

  if (coursesErr || !dbCourses) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }

  // 4. 각 코스 upsert
  let imported = 0
  let skipped = 0
  const notFound: string[] = []

  for (const c of courses) {
    // 이름으로 DB 코스 찾기
    const dbCourse = dbCourses.find(d => nameMatches(d.name, c.name))
    if (!dbCourse) {
      notFound.push(c.name)
      skipped++
      continue
    }

    const { error: upsertErr } = await supabase
      .from('crawl_results')
      .upsert(
        {
          crawl_date,
          course_id: dbCourse.id,
          status: c.status,
          slots: c.slots,
          lowest_price: c.lowest_price,
          discount_pct: c.discount_pct ?? 0,
          consecutive_slots: c.consecutive_slots ?? [],
          raw_json: c.raw_json ?? null,
        },
        { onConflict: 'crawl_date,course_id' }
      )

    if (upsertErr) {
      console.error(`Upsert error for ${c.name}:`, upsertErr.message)
      skipped++
    } else {
      imported++
    }
  }

  // 5. weekly_polls 자동 생성 (해당 날짜에 없으면)
  let pollCreated = false
  const targetDate = new Date(crawl_date + 'T12:00:00')
  // week_start = 해당 주 월요일 (화요일 - 1일)
  const weekStart = new Date(targetDate)
  weekStart.setDate(weekStart.getDate() - 1)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: existingPoll } = await supabase
    .from('weekly_polls')
    .select('id')
    .eq('week_start', weekStartStr)
    .single()

  if (!existingPoll) {
    const dateLabel = targetDate.toLocaleDateString('ko-KR', {
      month: 'long', day: 'numeric', weekday: 'short',
    })
    const { error: pollErr } = await supabase
      .from('weekly_polls')
      .insert({
        week_start: weekStartStr,
        title: `${dateLabel} 골프장 투표`,
        target_date: crawl_date,
        status: 'open',
        // 마감: 전날(월요일) 오후 9시
        deadline: `${weekStartStr}T21:00:00+09:00`,
      })

    if (!pollErr) pollCreated = true
  }

  return NextResponse.json({
    success: true,
    crawl_date,
    imported,
    skipped,
    not_found: notFound,
    poll_created: pollCreated,
  })
}

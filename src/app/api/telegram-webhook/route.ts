import { NextRequest, NextResponse } from 'next/server'
import { sendTelegram } from '@/lib/telegram'

const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET
const ALLOWED_CHAT_ID = process.env.ALLOWED_TELEGRAM_CHAT_ID
const GITHUB_PAT_WORKFLOW = process.env.GITHUB_PAT_WORKFLOW

const GH_REPO = 'Touch-Moon/golf-agent'
const GH_WORKFLOW = 'scrape.yml'

interface TelegramMessage {
  chat?: { id: number }
  text?: string
}

interface TelegramUpdate {
  message?: TelegramMessage
  edited_message?: TelegramMessage
}

async function triggerWorkflow(): Promise<{ ok: boolean; status: number; detail?: string }> {
  if (!GITHUB_PAT_WORKFLOW) {
    return { ok: false, status: 0, detail: 'GITHUB_PAT_WORKFLOW not configured' }
  }
  const resp = await fetch(
    `https://api.github.com/repos/${GH_REPO}/actions/workflows/${GH_WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_PAT_WORKFLOW}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
    },
  )
  if (resp.status === 204) return { ok: true, status: 204 }
  const detail = await resp.text().catch(() => '')
  return { ok: false, status: resp.status, detail: detail.slice(0, 200) }
}

export async function POST(request: NextRequest) {
  // 1) Telegram webhook secret 검증 (Telegram이 setWebhook 시 등록한 secret을 매 호출에 헤더로 보냄)
  if (TELEGRAM_WEBHOOK_SECRET) {
    const provided = request.headers.get('x-telegram-bot-api-secret-token') ?? ''
    if (provided !== TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // 2) Body 파싱 (실패해도 200 응답 — Telegram이 retry 안 하도록)
  let update: TelegramUpdate
  try {
    update = (await request.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ ok: true })
  }

  const message = update.message ?? update.edited_message
  if (!message?.chat?.id) {
    return NextResponse.json({ ok: true })
  }

  const chatId = String(message.chat.id)
  const text = (message.text ?? '').trim()

  // 3) /id — 새 채팅방을 화이트리스트에 등록하기 전, chat_id를 확인하기 위한 용도.
  //    화이트리스트 체크보다 먼저 처리해서 등록 안 된 방에서도 동작해야 함.
  if (text.startsWith('/id')) {
    await sendTelegram(chatId, `🆔 이 채팅방 ID: \`${chatId}\``)
    return NextResponse.json({ ok: true })
  }

  // 4) chat ID whitelist (silent ignore)
  if (ALLOWED_CHAT_ID && chatId !== ALLOWED_CHAT_ID) {
    return NextResponse.json({ ok: true })
  }

  // 5) Command 분기
  if (text.startsWith('/scrape')) {
    const result = await triggerWorkflow()
    if (result.ok) {
      await sendTelegram(
        chatId,
        '🚀 *크롤링 시작*\n약 6~10분 후 결과 메시지 + 사이트 자동 갱신.',
      )
    } else {
      await sendTelegram(
        chatId,
        `⚠️ 크롤링 시작 실패 (HTTP ${result.status})\n\`${result.detail ?? ''}\``,
      )
    }
  } else if (text.startsWith('/status')) {
    await sendTelegram(chatId, '✅ 봇 살아있어요. `/scrape` 로 즉시 크롤링.')
  } else if (text.startsWith('/help') || text.startsWith('/start')) {
    const help = [
      '*Golf Agent 명령어*',
      '`/scrape` — 즉시 크롤링 시작 (토요일 자동 실행 외에도 수동 실행)',
      '`/status` — 봇 상태 확인',
      '`/id` — 이 채팅방 ID 확인 (새 방 등록 시 사용)',
      '`/help` — 이 도움말',
      '',
      '🌐 https://good-morning-golf.vercel.app/',
    ].join('\n')
    await sendTelegram(chatId, help)
  }
  // 그 외 메시지는 silent ignore

  // Telegram에는 항상 200을 빠르게 반환 (3초 timeout, retry 방지)
  return NextResponse.json({ ok: true })
}

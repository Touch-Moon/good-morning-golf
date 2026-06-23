// 홈 데이터 로더 (서버 전용)
// 전략: 정적 latest.json 을 기반으로 두고, DB에서
//   ① 활성 manual 코스를 추가  ② 비활성 코스를 숨김  ③ override 병합
// DB 읽기 실패 시 정적 데이터만으로 안전하게 동작(폴백).
import { getLatestRun, type CourseResult, type CrawlRun, type Slot } from "./data";
import { mergeOverrides } from "./overrides";
import { supabaseAdmin } from "./supabase";
import type { Course } from "./courses";

// courses 테이블 직접 조회 (저트래픽 + courses 17행이라 캐시 불필요, 어드민 수정 즉시 반영)
async function getDbCourses(): Promise<Course[]> {
  const { data, error } = await supabaseAdmin.from("courses").select("*");
  if (error || !data) return [];
  return data as Course[];
}

function manualToResult(co: Course): CourseResult {
  const slots: Slot[] = (co.manual_slots ?? [])
    .map((m) => ({ time: m.time, price: m.price, is_hot_deal: m.is_hot_deal }))
    .sort((a, b) => a.time.localeCompare(b.time));
  return {
    name: co.name,
    source: "manual",
    status: slots.length > 0 ? "green" : "red",
    slots,
    fallback_price: co.fallback_price,
    distance_km: co.distance_km,
    phone: co.phone,
    booking_url: co.booking_url,
    cart_mandatory: !!co.cart_mandatory,
    consecutive_slots: [],
    earliest_slot: slots[0]?.time ?? null,
    earliest_2team: null,
  };
}

export async function getHomeRun(): Promise<CrawlRun> {
  const run = getLatestRun(); // 정적 base (정렬됨)

  let dbCourses: Course[] = [];
  try {
    dbCourses = await getDbCourses();
  } catch {
    dbCourses = [];
  }

  const baseNames = new Set(run.results.map((c) => c.name));
  const inactiveNames = new Set(
    dbCourses.filter((c) => c.is_active === false).map((c) => c.name)
  );
  const manualCourses = dbCourses
    .filter((c) => c.is_active !== false && c.adapter === "manual" && !baseNames.has(c.name))
    .map(manualToResult);

  let results = [...run.results, ...manualCourses].filter(
    (c) => !inactiveNames.has(c.name)
  );

  results = await mergeOverrides(results);

  return { target_date: run.target_date, results };
}

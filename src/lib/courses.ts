// 클라이언트/서버 공용 — Supabase 클라이언트(서버 전용 service key)를 import하지 않는다.
// (use client 컴포넌트가 안전하게 import 가능)

export type ManualSlot = {
  time: string; // "07:00" 24h
  price: number | null; // CAD/인
  is_hot_deal: boolean;
  spots_available: number | null;
};

// adapter: 시간을 어떻게 얻나 (manual = 수동 입력, 그 외 = 크롤 어댑터)
export const COURSE_ADAPTERS = [
  "manual",
  "teeon",
  "teeitup",
  "prophetservices",
  "chronogolf",
  "cps_golf",
  "clubhouse_online",
  "teeon_portal",
  "golfnow",
] as const;
export type CourseAdapter = (typeof COURSE_ADAPTERS)[number];

export type Course = {
  id: number;
  name: string;
  slug: string;
  source_type: string; // 'individual' | 'golfnow' (legacy 그룹핑)
  adapter: string | null; // CourseAdapter
  source_ref: Record<string, unknown> | null; // {course_code} | {facility_id,slug} | {}
  booking_url: string | null; // 바로가기 (코스당 1개)
  homepage: string | null;
  phone: string | null;
  distance_km: number | null;
  holes: number | null;
  fallback_price: number | null;
  cart_mandatory: boolean | null;
  default_players: number;
  is_active: boolean;
  sort_order: number;
  manual_slots: ManualSlot[];
  notes: string | null;
};

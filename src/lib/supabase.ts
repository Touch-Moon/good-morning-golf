import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client (anon key) — for reading overrides & announcements on homepage
export const supabase = createClient(url, anonKey);

// Admin client (service role) — bypasses RLS, server-side only
export const supabaseAdmin = createClient(url, serviceKey);

export type CourseOverride = {
  id: string;
  course_name: string;
  price_override: number | null;
  status_override: string | null;
  cart_policy_override: "mandatory" | "optional" | "included" | null;
  exclude_hotdeals: boolean;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
};

export type Announcement = {
  id: string;
  message: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

// ── Course (WS-A) ─────────────────────────────────────────────
export type ManualSlot = {
  time: string;            // "07:00" 24h
  price: number | null;    // CAD/인
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
  source_type: string;           // 'individual' | 'golfnow' (legacy 그룹핑)
  adapter: string | null;        // CourseAdapter
  source_ref: Record<string, unknown> | null; // {course_code} | {facility_id,slug} | {}
  booking_url: string | null;    // 바로가기 (코스당 1개)
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

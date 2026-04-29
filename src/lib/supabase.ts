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
  cart_mandatory_override: boolean | null;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
};

export type Announcement = {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

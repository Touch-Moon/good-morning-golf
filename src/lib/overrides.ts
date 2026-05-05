import { supabase } from "./supabase";
import type { CourseResult, Status } from "./data";
import type { CourseOverride, Announcement } from "./supabase";

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1)
    .single();
  return data ?? null;
}

export async function mergeOverrides(courses: CourseResult[]): Promise<CourseResult[]> {
  const { data } = await supabase
    .from("course_overrides")
    .select("*")
    .eq("is_active", true);

  if (!data || data.length === 0) return courses;

  const map = new Map<string, CourseOverride>(
    (data as CourseOverride[]).map((o) => [o.course_name, o])
  );

  return courses.map((c) => {
    const ov = map.get(c.name);
    if (!ov) return c;

    const overridden: CourseResult = { ...c };

    if (ov.status_override) {
      overridden.status = ov.status_override as Status;
    }
    if (ov.cart_policy_override != null) {
      overridden.cart_policy = ov.cart_policy_override;
    }
    // Price override: inject as a synthetic slot so lowestPrice() picks it up
    if (ov.price_override != null) {
      overridden.slots = [
        { time: "06:00", price: ov.price_override, is_hot_deal: false },
        ...c.slots,
      ];
    }

    return overridden;
  });
}

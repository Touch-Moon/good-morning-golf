"use server";

import { revalidatePath } from "next/cache";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

// ─── Courses (WS-A: 등록/수정/삭제) ──────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildSourceRef(adapter: string, fd: FormData): Record<string, unknown> {
  const courseCode = (fd.get("ref_course_code") as string)?.trim();
  const facilityId = (fd.get("ref_facility_id") as string)?.trim();
  const gnSlug = (fd.get("ref_slug") as string)?.trim();
  if (adapter === "golfnow") {
    const ref: Record<string, unknown> = {};
    if (facilityId) ref.facility_id = facilityId;
    if (gnSlug) ref.slug = gnSlug;
    return ref;
  }
  if (adapter === "teeon" || adapter === "teeon_portal") {
    return courseCode ? { course_code: courseCode } : {};
  }
  return {};
}

function readCourseFields(fd: FormData) {
  const name = (fd.get("name") as string)?.trim();
  if (!name) throw new Error("코스 이름은 필수입니다.");
  const adapter = ((fd.get("adapter") as string) || "manual").trim();
  const slugRaw = (fd.get("slug") as string)?.trim();
  const distanceRaw = (fd.get("distance_km") as string)?.trim();
  const playersRaw = (fd.get("default_players") as string)?.trim();
  const sortRaw = (fd.get("sort_order") as string)?.trim();

  return {
    name,
    slug: slugRaw ? slugify(slugRaw) : slugify(name),
    adapter,
    source_type: adapter === "golfnow" ? "golfnow" : "individual",
    source_ref: buildSourceRef(adapter, fd),
    booking_url: ((fd.get("booking_url") as string) || "").trim() || null,
    phone: ((fd.get("phone") as string) || "").trim() || null,
    distance_km: distanceRaw ? parseInt(distanceRaw, 10) : null,
    cart_mandatory: fd.get("cart_mandatory") === "true",
    default_players: playersRaw ? parseInt(playersRaw, 10) : 4,
    is_active: fd.get("is_active") !== "false",
    sort_order: sortRaw ? parseInt(sortRaw, 10) : 0,
    notes: ((fd.get("notes") as string) || "").trim() || null,
  };
}

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const fields = readCourseFields(formData);
  const { error } = await supabaseAdmin.from("courses").insert(fields);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

export async function updateCourse(formData: FormData) {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (!id) throw new Error("코스 id가 없습니다.");
  const fields = readCourseFields(formData);
  const { error } = await supabaseAdmin.from("courses").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

export async function deleteCourse(id: number) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

export async function toggleCourseActive(id: number, isActive: boolean) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("courses")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// ─── Course Overrides ─────────────────────────────────────────────────────────

export async function upsertCourseOverride(formData: FormData) {
  const courseName = formData.get("course_name") as string;
  const priceRaw = formData.get("price_override") as string;
  const statusRaw = formData.get("status_override") as string;
  const cartRaw = formData.get("cart_policy_override") as string;
  const notes = formData.get("notes") as string;
  const isActive = formData.get("is_active") === "true";
  const excludeHotdeals = formData.get("exclude_hotdeals") === "true";

  const price = priceRaw ? parseFloat(priceRaw) : null;
  const status = statusRaw || null;
  const cartPolicy = cartRaw || null;

  const { error } = await supabase
    .from("course_overrides")
    .upsert(
      {
        course_name: courseName,
        price_override: price,
        status_override: status,
        cart_policy_override: cartPolicy,
        exclude_hotdeals: excludeHotdeals,
        notes: notes || null,
        is_active: isActive,
      },
      { onConflict: "course_name" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

export async function toggleOverrideActive(courseName: string, isActive: boolean) {
  const { error } = await supabase
    .from("course_overrides")
    .update({ is_active: isActive })
    .eq("course_name", courseName);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

export async function deleteOverride(courseName: string) {
  const { error } = await supabase
    .from("course_overrides")
    .delete()
    .eq("course_name", courseName);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function upsertAnnouncement(formData: FormData) {
  const id = formData.get("id") as string | null;
  const message = formData.get("message") as string;
  const isActive = formData.get("is_active") === "true";
  const expiresAt = (formData.get("expires_at") as string | null) || null;

  const payload = { message, is_active: isActive, expires_at: expiresAt };

  if (id) {
    const { error } = await supabase
      .from("announcements")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("announcements")
      .insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function setAnnouncementActive(id: string, isActive: boolean) {
  // Deactivate all first (only one active at a time)
  if (isActive) {
    await supabase.from("announcements").update({ is_active: false }).neq("id", id);
  }
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

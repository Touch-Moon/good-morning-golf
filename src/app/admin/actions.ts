"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

// ─── Course Overrides ─────────────────────────────────────────────────────────

export async function upsertCourseOverride(formData: FormData) {
  const courseName = formData.get("course_name") as string;
  const priceRaw = formData.get("price_override") as string;
  const statusRaw = formData.get("status_override") as string;
  const cartRaw = formData.get("cart_mandatory_override") as string;
  const notes = formData.get("notes") as string;
  const isActive = formData.get("is_active") === "true";

  const price = priceRaw ? parseFloat(priceRaw) : null;
  const status = statusRaw || null;
  const cart = cartRaw === "" ? null : cartRaw === "true";

  const { error } = await supabaseAdmin
    .from("course_overrides")
    .upsert(
      {
        course_name: courseName,
        price_override: price,
        status_override: status,
        cart_mandatory_override: cart,
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
  const { error } = await supabaseAdmin
    .from("course_overrides")
    .update({ is_active: isActive })
    .eq("course_name", courseName);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/");
}

export async function deleteOverride(courseName: string) {
  const { error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin
      .from("announcements")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from("announcements")
      .insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabaseAdmin
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
    await supabaseAdmin.from("announcements").update({ is_active: false }).neq("id", id);
  }
  const { error } = await supabaseAdmin
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

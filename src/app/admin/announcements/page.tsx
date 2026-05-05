import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/supabase";
import type { Announcement } from "@/lib/supabase";
import { getLatestRun } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { AnnouncementEditor } from "./AnnouncementEditor";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const run = getLatestRun();
  const courses = run.results.map((c) => ({
    name: c.name,
    slots: c.slots.map((s) => s.time).sort(),
  }));

  return (
    <AdminShell>
      <h1 className={s.title}>공지사항 관리</h1>
      <p className={s.desc}>활성화된 공지는 홈 페이지 타이틀과 코스 목록 사이에 표시됩니다. 하나만 활성화 가능합니다.</p>
      <AnnouncementEditor
        announcements={(announcements ?? []) as Announcement[]}
        courses={courses}
        targetDate={run.target_date}
      />
    </AdminShell>
  );
}

import { AdminShell } from "@/components/AdminShell";
import { supabaseAdmin } from "@/lib/supabase";
import { getLatestRun } from "@/lib/data";
import type { CourseOverride } from "@/lib/supabase";
import { CourseOverrideRow } from "./CourseOverrideRow";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const run = getLatestRun();
  const { data: overrides } = await supabaseAdmin
    .from("course_overrides")
    .select("*")
    .order("course_name");

  const overrideMap = new Map<string, CourseOverride>(
    (overrides ?? []).map((o: CourseOverride) => [o.course_name, o])
  );

  return (
    <AdminShell>
      <h1 className={s.title}>코스 관리</h1>
      <p className={s.desc}>스크래핑 데이터를 수동으로 수정하거나 override를 켜고 끌 수 있습니다.</p>
      <div className={s.list}>
        {run.results.map((course) => (
          <CourseOverrideRow
            key={course.name}
            course={course}
            override={overrideMap.get(course.name) ?? null}
          />
        ))}
      </div>
    </AdminShell>
  );
}

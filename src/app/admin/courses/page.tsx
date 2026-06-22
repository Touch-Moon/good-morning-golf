import { AdminShell } from "@/components/AdminShell";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getLatestRun } from "@/lib/data";
import type { CourseOverride, Course } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { CourseOverrideRow } from "./CourseOverrideRow";
import { CourseManager } from "./CourseManager";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const run = getLatestRun();

  const { data: courseRows } = await supabaseAdmin
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  const courses = (courseRows ?? []) as Course[];

  const { data: overrides } = await supabase
    .from("course_overrides")
    .select("*")
    .order("course_name");

  const overrideMap = new Map<string, CourseOverride>(
    (overrides ?? []).map((o: CourseOverride) => [o.course_name, o])
  );

  return (
    <AdminShell>
      <h1 className={s.title}>코스 관리</h1>
      <p className={s.desc}>코스를 등록·수정·삭제하고, 스크래핑 데이터를 override할 수 있습니다.</p>

      <CourseManager courses={courses} />

      <h2 className={s.subtitle}>스크래핑 데이터 override</h2>
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

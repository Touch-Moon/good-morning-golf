import { AdminShell } from "@/components/AdminShell";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getLatestRun } from "@/lib/data";
import type { CourseOverride, Course } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { CourseOverrideRow } from "./CourseOverrideRow";
import { CourseManager } from "./CourseManager";
import { getLocale } from "@/lib/i18n-server";
import { dict } from "@/lib/i18n";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const run = getLatestRun();
  const t = dict[await getLocale()].admin.courses;

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
      <h1 className={s.title}>{t.pageTitle}</h1>
      <p className={s.desc}>{t.pageDesc}</p>

      <CourseManager courses={courses} />

      <h2 className={s.subtitle}>{t.overrideTitle}</h2>
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

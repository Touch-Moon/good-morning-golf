import { CourseList } from "@/components/CourseList";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { getHomeRun } from "@/lib/home-data";
import { getActiveAnnouncement } from "@/lib/overrides";
import { getLocale } from "@/lib/i18n-server";
import { dict, formatDateLocalized } from "@/lib/i18n";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

const HIDDEN_COURSES = ["Rossmere Country Club", "Lorette Golf Course"];

export default async function Home() {
  const locale = await getLocale();
  const t = dict[locale];
  const [run, announcement] = await Promise.all([
    getHomeRun(),
    getActiveAnnouncement(),
  ]);
  const mergedCourses = run.results;

  const visibleCourses = mergedCourses.filter(
    (c) => !HIDDEN_COURSES.includes(c.name)
  );

  const greenCount = visibleCourses.filter((r) => r.status === "green").length;

  return (
    <main className={s.main}>
      <header className={s.header}>
        <h1 className={s.title}>{formatDateLocalized(run.target_date, locale)}</h1>
        <p className={s.subtitle}>
          {t.main.courses(visibleCourses.length)} ·{" "}
          <span className={s.available}>{t.main.available(greenCount)}</span>
        </p>
      </header>

      {announcement && (
        <div className={s.announcement}>
          <AnnouncementBanner announcement={announcement} bordered maskNames />
        </div>
      )}

      <CourseList
        courses={visibleCourses}
        highlightCourse={
          announcement?.message
            .split("\n")
            .find((l) => l.startsWith("장소: "))
            ?.slice(4).trim() ?? null
        }
        highlightTimes={
          announcement?.message
            .split("\n")
            .find((l) => l.startsWith("시간: "))
            ?.slice(4).trim()
            .split(", ") ?? []
        }
      />

      <footer className={s.footer}>
        <p>{t.main.footer}</p>
      </footer>
    </main>
  );
}

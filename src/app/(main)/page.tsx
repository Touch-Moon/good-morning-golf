import { CourseList } from "@/components/CourseList";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { formatDate, getLatestRun } from "@/lib/data";
import { mergeOverrides, getActiveAnnouncement } from "@/lib/overrides";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function Home() {
  const run = getLatestRun();
  const [mergedCourses, announcement] = await Promise.all([
    mergeOverrides(run.results),
    getActiveAnnouncement(),
  ]);

  const greenCount = mergedCourses.filter((r) => r.status === "green").length;

  return (
    <main className={s.main}>
      <header className={s.header}>
        <h1 className={s.title}>{formatDate(run.target_date)}</h1>
        <p className={s.subtitle}>
          전체 {mergedCourses.length}개 코스 ·{" "}
          <span className={s.available}>{greenCount}개 예약 가능</span>
        </p>
      </header>

      {announcement && (
        <div className={s.announcement}>
          <AnnouncementBanner announcement={announcement} bordered />
        </div>
      )}

      <CourseList
        courses={mergedCourses}
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
        <p>매주 갱신 · Winnipeg 인근 골프 코스</p>
      </footer>
    </main>
  );
}

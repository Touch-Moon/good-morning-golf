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
        <p className={s.eyebrow}>이번 주 토요일 티타임</p>
        <h1 className={s.title}>{formatDate(run.target_date)}</h1>
        <p className={s.subtitle}>
          전체 {mergedCourses.length}개 코스 ·{" "}
          <span className={s.available}>{greenCount}개 예약 가능</span>
        </p>
      </header>

      {announcement && <AnnouncementBanner announcement={announcement} />}

      <CourseList courses={mergedCourses} />

      <footer className={s.footer}>
        <p>매주 갱신 · Winnipeg 인근 골프 코스</p>
      </footer>
    </main>
  );
}

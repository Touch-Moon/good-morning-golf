import { CourseList } from "@/components/CourseList";
import { formatDate, getLatestRun } from "@/lib/data";
import s from "./page.module.scss";

export default function Home() {
  const run = getLatestRun();
  const greenCount = run.results.filter((r) => r.status === "green").length;

  return (
    <main className={s.main}>
      <header className={s.header}>
        <p className={s.eyebrow}>이번 주 토요일 티타임</p>
        <h1 className={s.title}>{formatDate(run.target_date)}</h1>
        <p className={s.subtitle}>
          전체 {run.results.length}개 코스 ·{" "}
          <span className={s.available}>{greenCount}개 예약 가능</span>
        </p>
      </header>

      <CourseList courses={run.results} />

      <footer className={s.footer}>
        <p>매주 갱신 · Winnipeg 인근 골프 코스</p>
      </footer>
    </main>
  );
}

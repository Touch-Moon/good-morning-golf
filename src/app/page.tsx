import { CourseList } from "@/components/CourseList";
import { formatDate, getLatestRun } from "@/lib/data";

export default function Home() {
  const run = getLatestRun();
  const greenCount = run.results.filter((r) => r.status === "green").length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          이번 주 토요일 티타임
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {formatDate(run.target_date)}
        </h1>
        <p className="mt-2 text-sm text-muted">
          전체 {run.results.length}개 코스 ·{" "}
          <span className="text-success">{greenCount}개 예약 가능</span>
        </p>
      </header>

      <CourseList courses={run.results} />

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        <p>매주 갱신 · Winnipeg 인근 골프 코스</p>
      </footer>
    </main>
  );
}

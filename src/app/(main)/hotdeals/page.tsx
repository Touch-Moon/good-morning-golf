import { CourseList } from "@/components/CourseList";
import { formatDate, getLatestRun, hotDealCourses } from "@/lib/data";
import { mergeOverrides } from "@/lib/overrides";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function HotDealsPage() {
  const run = getLatestRun();
  const mergedCourses = await mergeOverrides(run.results);
  const deals = hotDealCourses(mergedCourses);

  return (
    <main className={s.main}>
      <header className={s.header}>
        <h1 className={s.title}>핫딜</h1>
        <p className={s.subtitle}>
          {formatDate(run.target_date)} ·{" "}
          {deals.length > 0 ? (
            <span className={s.count}>{deals.length}개 코스에서 할인 발견</span>
          ) : (
            "현재 등록된 핫딜 없음"
          )}
        </p>
      </header>

      {deals.length > 0 ? (
        <CourseList courses={deals} />
      ) : (
        <div className={s.empty}>
          <div className={s["empty-icon"]}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C12 2 7 7.5 7 12a5 5 0 0010 0c0-4.5-5-10-5-10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 17a2 2 0 000-4c-.7 0-1.3.36-1.65.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className={s["empty-text"]}>이번 주 핫딜이 없습니다.</p>
          <p className={s["empty-sub"]}>GolfNow 특가 및 최저가 슬롯이 등록되면 여기에 표시됩니다.</p>
        </div>
      )}

      <footer className={s.footer}>
        <p>GolfNow 및 개별 코스 웹사이트 기준 · 매주 갱신</p>
      </footer>
    </main>
  );
}

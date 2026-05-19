import { CourseList } from "@/components/CourseList";
import { getLatestRun, hotDealCourses } from "@/lib/data";
import { mergeOverrides } from "@/lib/overrides";
import { getLocale } from "@/lib/i18n-server";
import { dict, formatDateLocalized } from "@/lib/i18n";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function HotDealsPage() {
  const locale = await getLocale();
  const t = dict[locale];
  const run = getLatestRun();
  const mergedCourses = await mergeOverrides(run.results);
  const deals = hotDealCourses(mergedCourses);

  return (
    <main className={s.main}>
      <header className={s.header}>
        <h1 className={s.title}>{t.hotdeals.title}</h1>
        <p className={s.subtitle}>
          {formatDateLocalized(run.target_date, locale)} ·{" "}
          {deals.length > 0 ? (
            <span className={s.count}>{t.hotdeals.countFound(deals.length)}</span>
          ) : (
            t.hotdeals.noneActive
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
          <p className={s["empty-text"]}>{t.hotdeals.emptyTitle}</p>
          <p className={s["empty-sub"]}>{t.hotdeals.emptySub}</p>
        </div>
      )}

      <footer className={s.footer}>
        <p>{t.hotdeals.footer}</p>
      </footer>
    </main>
  );
}

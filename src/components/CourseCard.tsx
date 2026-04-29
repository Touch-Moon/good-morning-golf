import { type CourseResult, formatTime, lowestPrice } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

const SLOTS_MAX = 8;

export function CourseCard({ course }: { course: CourseResult }) {
  const price = lowestPrice(course);
  const sortedSlots = [...course.slots].sort((a, b) => a.time.localeCompare(b.time));
  const shown = sortedSlots.slice(0, SLOTS_MAX);
  const remaining = sortedSlots.length - shown.length;

  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-surface-elevated">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight text-foreground">
            {course.name}
          </h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted">
            {course.distance_km != null && <span>~{course.distance_km}km</span>}
            {course.cart_mandatory && (
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                Cart 필수
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={course.status} />
      </header>

      {course.status === "green" && shown.length > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
            티타임
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shown.map((s) => (
              <span
                key={s.time}
                className="rounded-md bg-surface-elevated px-2 py-1 font-mono text-xs text-foreground"
              >
                {formatTime(s.time)}
              </span>
            ))}
            {remaining > 0 && (
              <span className="rounded-md bg-surface-elevated/60 px-2 py-1 font-mono text-xs text-muted">
                +{remaining}
              </span>
            )}
          </div>
        </div>
      )}

      {(price != null || course.fallback_price != null) && (
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-xs text-muted">최저가</span>
          {price != null ? (
            <span className="text-lg font-semibold tabular-nums text-foreground">
              ${price.toFixed(0)}
              <span className="ml-1 text-xs font-normal text-muted">/인</span>
            </span>
          ) : (
            <span className="text-sm tabular-nums text-muted">
              ~${course.fallback_price}
              <span className="ml-1 text-xs">/인 (참고가)</span>
            </span>
          )}
        </div>
      )}

      <footer className="flex flex-wrap gap-2">
        {course.booking_url && (
          <a
            href={course.booking_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-hover"
          >
            온라인 예약
          </a>
        )}
        {course.phone && (
          <a
            href={`tel:${course.phone.replace(/[^0-9+]/g, "")}`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-muted"
          >
            {course.phone}
          </a>
        )}
      </footer>
    </article>
  );
}

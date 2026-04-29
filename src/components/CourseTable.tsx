import { type CourseResult, formatTime, lowestPrice } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

const SLOTS_MAX_INLINE = 6;

export function CourseTable({ courses }: { courses: CourseResult[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted">
            <th className="px-4 py-3 font-medium">코스</th>
            <th className="px-3 py-3 font-medium">상태</th>
            <th className="px-3 py-3 text-right font-medium">거리</th>
            <th className="px-3 py-3 font-medium">최초 티타임</th>
            <th className="px-3 py-3 font-medium">슬롯</th>
            <th className="px-3 py-3 text-right font-medium">최저가</th>
            <th className="px-4 py-3 text-right font-medium">예약</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => {
            const price = lowestPrice(c);
            const sortedSlots = [...c.slots].sort((a, b) =>
              a.time.localeCompare(b.time),
            );
            const shown = sortedSlots.slice(0, SLOTS_MAX_INLINE);
            const remaining = sortedSlots.length - shown.length;

            return (
              <tr
                key={c.name}
                className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-surface-elevated/40"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{c.name}</div>
                  {c.cart_mandatory && (
                    <div className="mt-1 inline-block rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      Cart 필수
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted">
                  {c.distance_km != null ? `${c.distance_km}km` : "—"}
                </td>
                <td className="px-3 py-3 font-mono text-xs">
                  {c.earliest_slot ? (
                    <span className="text-foreground">
                      {formatTime(c.earliest_slot)}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {shown.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {shown.map((s) => (
                        <span
                          key={s.time}
                          className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                        >
                          {formatTime(s.time)}
                        </span>
                      ))}
                      {remaining > 0 && (
                        <span className="rounded bg-surface-elevated/60 px-1.5 py-0.5 font-mono text-[11px] text-muted">
                          +{remaining}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {price != null ? (
                    <span className="font-semibold text-foreground">
                      ${price.toFixed(0)}
                    </span>
                  ) : c.fallback_price != null ? (
                    <span className="text-muted">~${c.fallback_price}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {c.booking_url && (
                    <a
                      href={c.booking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary-hover"
                    >
                      예약
                    </a>
                  )}
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                      className="ml-1.5 inline-flex items-center justify-center rounded-md bg-[#D1FA66] px-3 py-1.5 text-xs font-medium text-[#101B2B] transition-colors hover:bg-[#bfe04f]"
                    >
                      📞
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

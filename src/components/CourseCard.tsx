import { type CourseResult, formatTime, lowestPrice, priceRange, discountTimes, resolveCartPolicy, CART_POLICY_LABELS } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";
import s from "./CourseCard.module.scss";

const SLOTS_MAX_CARD = 8;
const SLOTS_MAX_LIST = 6;

function formatPriceRange(range: { min: number; max: number }): string {
  if (range.min === range.max) return `$${Math.round(range.min)}`;
  return `$${Math.round(range.min)}~$${Math.round(range.max)}`;
}

export function CourseCard({
  course,
  mode = "card",
  highlight = false,
  highlightTimes = [],
}: {
  course: CourseResult;
  mode?: "card" | "list";
  highlight?: boolean;
  highlightTimes?: string[];
}) {
  const price = lowestPrice(course);
  const range = priceRange(course);
  const discountSet = discountTimes(course.slots);
  const cartPolicy = resolveCartPolicy(course);
  const cartLabel = cartPolicy ? CART_POLICY_LABELS[cartPolicy] : null;
  const hasSlots = course.slots.length > 0;
  const sortedSlots = [...course.slots].sort((a, b) => a.time.localeCompare(b.time));
  const max = mode === "card" ? SLOTS_MAX_CARD : SLOTS_MAX_LIST;
  const shown = sortedSlots.slice(0, max);
  const remaining = sortedSlots.length - shown.length;

  if (mode === "list") {
    return (
      <article
        className={s["list-item"]}
        style={highlight ? { borderColor: "#d1fa66" } : undefined}
      >
        <div className={s["list-row"]}>
          <div className={s["list-left"]}>
            <div className={s["list-header"]}>
              <h2 className={s["course-name"]}>{course.name}</h2>
              <div className={s["status-badge-container"]}>
                <StatusBadge status={course.status} />
                {cartLabel && (
                  <span className={s["meta-tag"]}>{cartLabel}</span>
                )}
                {course.distance_km != null && (
                  <span className={s.distance}>~{course.distance_km}km</span>
                )}
              </div>
            </div>
            {shown.length > 0 && (
              <div className={s.slots}>
                {shown.map((sl) => {
                  const isDiscount = discountSet.has(sl.time);
                  const isHighlighted = highlightTimes.includes(formatTime(sl.time));
                  return (
                    <span
                      key={sl.time}
                      className={[s["slot-tag"], isDiscount ? s["slot-discount"] : ""].filter(Boolean).join(" ")}
                      style={isHighlighted ? { borderWidth: "1px", borderStyle: "solid", borderColor: "#d1fa66", background: "#d1fa66", color: "#101b2b" } : undefined}
                    >
                      <span className={s["slot-time"]}>{formatTime(sl.time)}</span>
                      {sl.price !== null && (
                        <span className={s["slot-price"]}>${Math.round(sl.price)}</span>
                      )}
                    </span>
                  );
                })}
                {remaining > 0 && (
                  <span className={s["slot-more"]}>+{remaining}</span>
                )}
              </div>
            )}
          </div>

          <div className={s["list-right"]}>
            {range != null ? (
              <span className={s.price}>
                {formatPriceRange(range)}
                <span className={s["price-unit"]}>/인</span>
              </span>
            ) : price != null ? (
              <span className={s.price}>
                ${price.toFixed(0)}
                <span className={s["price-unit"]}>/인</span>
              </span>
            ) : hasSlots ? (
              <span className={s["price-inquiry"]}>문의</span>
            ) : null}
            <div className={s["btn-group"]}>
              {course.booking_url && (
                <a href={course.booking_url} target="_blank" rel="noreferrer" className={s["btn-book"]}>
                  예약
                </a>
              )}
              {course.phone && (
                <a href={`tel:${course.phone.replace(/[^0-9+]/g, "")}`} className={s["btn-phone"]}>
                  📞
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={s["card-item"]}>
      <header className={s["card-header"]}>
        <div>
          <h2 className={s["card-name"]}>{course.name}</h2>
          <div className={s["card-meta"]}>
            {course.distance_km != null && <span>~{course.distance_km}km</span>}
            {cartLabel && (
              <span className={s["meta-tag"]}>{cartLabel}</span>
            )}
          </div>
        </div>
        <StatusBadge status={course.status} />
      </header>

      {shown.length > 0 && (
        <div className={s["card-slots-section"]}>
          <div className={s["card-slots-label"]}>티타임</div>
          <div className={s["card-slots-list"]}>
            {shown.map((sl) => {
              const isDiscount = discountSet.has(sl.time);
              return (
                <span
                  key={sl.time}
                  className={[s["card-slot-tag"], isDiscount ? s["slot-discount"] : ""].filter(Boolean).join(" ")}
                >
                  <span className={s["slot-time"]}>{formatTime(sl.time)}</span>
                  {sl.price !== null && (
                    <span className={s["slot-price"]}>${Math.round(sl.price)}</span>
                  )}
                </span>
              );
            })}
            {remaining > 0 && (
              <span className={s["card-slot-more"]}>+{remaining}</span>
            )}
          </div>
        </div>
      )}

      {(range != null || price != null || hasSlots) && (
        <div className={s["card-price-section"]}>
          <span className={s["card-price-label"]}>
            {range && range.min !== range.max ? "가격대" : "최저가"}
          </span>
          {range != null ? (
            <span className={s["card-price"]}>
              {formatPriceRange(range)}
              <span className={s["card-price-unit"]}>/인</span>
            </span>
          ) : price != null ? (
            <span className={s["card-price"]}>
              ${price.toFixed(0)}
              <span className={s["card-price-unit"]}>/인</span>
            </span>
          ) : (
            <span className={s["price-inquiry"]}>문의</span>
          )}
        </div>
      )}

      <footer className={s["card-footer"]}>
        {course.booking_url && (
          <a href={course.booking_url} target="_blank" rel="noreferrer" className={s["btn-book-card"]}>
            온라인 예약
          </a>
        )}
        {course.phone && (
          <a href={`tel:${course.phone.replace(/[^0-9+]/g, "")}`} className={s["btn-phone-card"]}>
            {course.phone}
          </a>
        )}
      </footer>
    </article>
  );
}

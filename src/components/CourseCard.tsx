import { type CourseResult, formatTime, lowestPrice } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";
import s from "./CourseCard.module.scss";

const SLOTS_MAX_CARD = 8;
const SLOTS_MAX_LIST = 6;

export function CourseCard({
  course,
  mode = "card",
}: {
  course: CourseResult;
  mode?: "card" | "list";
}) {
  const price = lowestPrice(course);
  const sortedSlots = [...course.slots].sort((a, b) => a.time.localeCompare(b.time));
  const max = mode === "card" ? SLOTS_MAX_CARD : SLOTS_MAX_LIST;
  const shown = sortedSlots.slice(0, max);
  const remaining = sortedSlots.length - shown.length;

  if (mode === "list") {
    return (
      <article className={s["list-item"]}>
        <div className={s["list-row"]}>
          <div className={s["list-left"]}>
            <div className={s["list-header"]}>
              <h2 className={s["course-name"]}>{course.name}</h2>
              <div className={s["status-badge-container"]}>
                <StatusBadge status={course.status} />
                {course.cart_mandatory && (
                  <span className={s["meta-tag"]}>Cart 필수</span>
                )}
                {course.distance_km != null && (
                  <span className={s.distance}>~{course.distance_km}km</span>
                )}
              </div>
            </div>
            {shown.length > 0 && (
              <div className={s.slots}>
                {shown.map((sl) => (
                  <span key={sl.time} className={s["slot-tag"]}>
                    {formatTime(sl.time)}
                  </span>
                ))}
                {remaining > 0 && (
                  <span className={s["slot-more"]}>+{remaining}</span>
                )}
              </div>
            )}
          </div>

          <div className={s["list-right"]}>
            {price != null ? (
              <span className={s.price}>
                ${price.toFixed(0)}
                <span className={s["price-unit"]}>/인</span>
              </span>
            ) : course.fallback_price != null ? (
              <span className={s["price-fallback"]}>~${course.fallback_price}</span>
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
            {course.cart_mandatory && (
              <span className={s["meta-tag"]}>Cart 필수</span>
            )}
          </div>
        </div>
        <StatusBadge status={course.status} />
      </header>

      {shown.length > 0 && (
        <div className={s["card-slots-section"]}>
          <div className={s["card-slots-label"]}>티타임</div>
          <div className={s["card-slots-list"]}>
            {shown.map((sl) => (
              <span key={sl.time} className={s["card-slot-tag"]}>
                {formatTime(sl.time)}
              </span>
            ))}
            {remaining > 0 && (
              <span className={s["card-slot-more"]}>+{remaining}</span>
            )}
          </div>
        </div>
      )}

      {(price != null || course.fallback_price != null) && (
        <div className={s["card-price-section"]}>
          <span className={s["card-price-label"]}>최저가</span>
          {price != null ? (
            <span className={s["card-price"]}>
              ${price.toFixed(0)}
              <span className={s["card-price-unit"]}>/인</span>
            </span>
          ) : (
            <span className={s["card-price-fallback"]}>
              ~${course.fallback_price}
              <span> /인 (참고가)</span>
            </span>
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

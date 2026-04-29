import type { Status } from "@/lib/data";
import s from "./StatusBadge.module.scss";

const STATUS_MAP: Record<Status, { label: string; dot: string; text: string }> = {
  green:     { label: "예약 가능",   dot: s["dot-success"],   text: s["text-success"] },
  afternoon: { label: "오후만 가능", dot: s["dot-info"],      text: s["text-info"] },
  yellow:    { label: "접속 불가",   dot: s["dot-warning"],   text: s["text-warning"] },
  red:       { label: "슬롯 없음",   dot: s["dot-danger"],    text: s["text-danger"] },
  error:     { label: "수집 오류",   dot: s["dot-muted"],     text: s["text-muted"] },
};

export function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_MAP[status];
  return (
    <span className={s.badge}>
      <span className={`${s.dot} ${m.dot}`} aria-hidden />
      <span className={m.text}>{m.label}</span>
    </span>
  );
}

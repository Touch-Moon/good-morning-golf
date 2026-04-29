import type { Status } from "@/lib/data";

const STATUS_MAP: Record<Status, { label: string; dot: string; text: string }> = {
  green: { label: "예약 가능", dot: "bg-success", text: "text-success" },
  yellow: { label: "접속 불가", dot: "bg-warning", text: "text-warning" },
  red: { label: "슬롯 없음", dot: "bg-danger", text: "text-danger" },
  error: { label: "수집 오류", dot: "bg-muted", text: "text-muted" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_MAP[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      <span className={s.text}>{s.label}</span>
    </span>
  );
}

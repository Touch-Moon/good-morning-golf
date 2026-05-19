"use client";

import type { Status } from "@/lib/data";
import { useT } from "@/lib/locale-context";
import s from "./StatusBadge.module.scss";

const STATUS_STYLES: Record<Status, { dot: string; text: string }> = {
  green:     { dot: s["dot-success"], text: s["text-success"] },
  afternoon: { dot: s["dot-info"],    text: s["text-info"] },
  yellow:    { dot: s["dot-warning"], text: s["text-warning"] },
  red:       { dot: s["dot-danger"],  text: s["text-danger"] },
  error:     { dot: s["dot-muted"],   text: s["text-muted"] },
};

export function StatusBadge({ status }: { status: Status }) {
  const t = useT();
  const style = STATUS_STYLES[status];
  return (
    <span className={s.badge}>
      <span className={`${s.dot} ${style.dot}`} aria-hidden />
      <span className={style.text}>{t.status[status]}</span>
    </span>
  );
}

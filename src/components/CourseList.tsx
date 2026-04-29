"use client";

import { useEffect, useState } from "react";
import type { CourseResult } from "@/lib/data";
import { CourseCard } from "./CourseCard";
import s from "./CourseList.module.scss";

type ViewMode = "list" | "card";
const STORAGE_KEY = "golf:view-mode";

export function CourseList({ courses }: { courses: CourseResult[] }) {
  const [view, setView] = useState<ViewMode>("list");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "card") setView(stored);
    setHydrated(true);
  }, []);

  const change = (next: ViewMode) => {
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div>
      <div className={s.toolbar}>
        <div role="tablist" aria-label="보기 방식" className={s["toggle-group"]}>
          <ToggleButton active={view === "list"} onClick={() => change("list")} label="리스트" icon={<ListIcon />} />
          <ToggleButton active={view === "card"} onClick={() => change("card")} label="카드" icon={<CardIcon />} />
        </div>
      </div>

      <div className={`${s.content}${hydrated ? "" : ` ${s.hidden}`}`}>
        {view === "card" ? (
          <section className={s["card-view"]}>
            {courses.map((c) => (
              <CourseCard key={c.name} course={c} mode="list" />
            ))}
          </section>
        ) : (
          <section className={s["list-view"]}>
            {courses.map((c) => (
              <CourseCard key={c.name} course={c} mode="list" />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`${s["toggle-btn"]}${active ? ` ${s.active}` : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

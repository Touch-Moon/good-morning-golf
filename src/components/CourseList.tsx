"use client";

import { useEffect, useState } from "react";
import type { CourseResult } from "@/lib/data";
import { CourseCard } from "./CourseCard";
import { CourseTable } from "./CourseTable";

type ViewMode = "card" | "table";
const STORAGE_KEY = "golf:view-mode";

export function CourseList({ courses }: { courses: CourseResult[] }) {
  const [view, setView] = useState<ViewMode>("table");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "card" || stored === "table") setView(stored);
    setHydrated(true);
  }, []);

  const change = (next: ViewMode) => {
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div
          role="tablist"
          aria-label="보기 방식"
          className="inline-flex rounded-lg border border-border bg-surface p-1"
        >
          <ToggleButton
            active={view === "card"}
            onClick={() => change("card")}
            label="카드"
            icon={<CardIcon />}
          />
          <ToggleButton
            active={view === "table"}
            onClick={() => change("table")}
            label="테이블"
            icon={<TableIcon />}
          />
        </div>
      </div>

      {/* prevent hydration flash by reserving height of card grid until mounted */}
      <div className={hydrated ? "" : "opacity-0"}>
        {view === "card" ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.name} course={c} />
            ))}
          </section>
        ) : (
          <CourseTable courses={courses} />
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
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-surface-elevated text-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
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

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M3 15h18M9 4v16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

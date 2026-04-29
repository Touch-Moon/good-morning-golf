"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseResult, Status } from "@/lib/data";
import { CourseCard } from "./CourseCard";
import s from "./CourseList.module.scss";

type ViewMode = "list" | "card";
const STORAGE_KEY = "golf:view-mode";

const STATUS_LABELS: Record<Status, string> = {
  green:     "예약 가능",
  afternoon: "오후만 가능",
  yellow:    "접속 불가",
  red:       "슬롯 없음",
  error:     "오류",
};

const STATUS_DOT_VARS: Record<Status, string> = {
  green:     "var(--success)",
  afternoon: "var(--info)",
  yellow:    "var(--warning)",
  red:       "var(--danger)",
  error:     "var(--muted)",
};

export function CourseList({ courses, highlightCourse = null }: { courses: CourseResult[]; highlightCourse?: string | null }) {
  const [view, setView] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "card") setView(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const changeView = (next: ViewMode) => {
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const presentStatuses = useMemo(() => {
    const seen = new Set<Status>();
    for (const c of courses) seen.add(c.status);
    return (["green", "afternoon", "yellow", "red", "error"] as Status[]).filter((st) => seen.has(st));
  }, [courses]);

  const filtered = filter === "all" ? courses : courses.filter((c) => c.status === filter);

  const filterLabel = filter === "all" ? "전체" : STATUS_LABELS[filter];
  const filterDot = filter !== "all" ? STATUS_DOT_VARS[filter] : null;

  return (
    <div>
      <div className={s.toolbar}>
        {/* Filter dropdown */}
        <div className={s["dropdown-wrap"]} ref={dropdownRef}>
          <button
            type="button"
            className={`${s["dropdown-trigger"]}${dropdownOpen ? ` ${s.open}` : ""}`}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {filterDot && (
              <span className={s["trigger-dot"]} style={{ background: filterDot }} />
            )}
            {filterLabel}
            <svg className={s["chevron"]} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <ul className={s.dropdown} role="listbox">
              <DropdownItem
                active={filter === "all"}
                onClick={() => { setFilter("all"); setDropdownOpen(false); }}
                label="전체"
              />
              {presentStatuses.map((st) => (
                <DropdownItem
                  key={st}
                  active={filter === st}
                  dot={STATUS_DOT_VARS[st]}
                  onClick={() => { setFilter(st); setDropdownOpen(false); }}
                  label={STATUS_LABELS[st]}
                />
              ))}
            </ul>
          )}
        </div>

        {/* View toggle */}
        <div role="tablist" aria-label="보기 방식" className={s["toggle-group"]}>
          <ToggleButton active={view === "list"} onClick={() => changeView("list")} label="리스트" icon={<ListIcon />} />
          <ToggleButton active={view === "card"} onClick={() => changeView("card")} label="카드" icon={<CardIcon />} />
        </div>
      </div>

      <div className={`${s.content}${hydrated ? "" : ` ${s.hidden}`}`}>
        {view === "card" ? (
          <section className={s["card-view"]}>
            {filtered.map((c) => (
              <CourseCard key={c.name} course={c} mode="list" highlight={c.name === highlightCourse} />
            ))}
          </section>
        ) : (
          <section className={s["list-view"]}>
            {filtered.map((c) => (
              <CourseCard key={c.name} course={c} mode="list" highlight={c.name === highlightCourse} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function DropdownItem({
  active,
  dot,
  label,
  onClick,
}: {
  active: boolean;
  dot?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        className={`${s["dropdown-item"]}${active ? ` ${s.active}` : ""}`}
        onClick={onClick}
      >
        {dot && <span className={s["item-dot"]} style={{ background: dot }} />}
        {label}
        {active && (
          <svg className={s["check"]} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </li>
  );
}

function ToggleButton({
  active, onClick, label, icon,
}: {
  active: boolean; onClick: () => void; label: string; icon: React.ReactNode;
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

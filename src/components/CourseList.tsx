"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseResult, Status } from "@/lib/data";
import { lowestPrice } from "@/lib/data";
import { CourseCard } from "./CourseCard";
import s from "./CourseList.module.scss";

type ViewMode = "list" | "card";
type SortMode = "alpha" | "distance" | "price";
const STORAGE_KEY = "golf:view-mode";
const SORT_STORAGE_KEY = "golf:sort-mode";

const FILTER_OPTIONS: { value: "all" | Status; label: string }[] = [
  { value: "all",       label: "전체" },
  { value: "green",     label: "예약가능" },
  { value: "afternoon", label: "오후가능" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "alpha",    label: "알파벳순" },
  { value: "distance", label: "거리순" },
  { value: "price",    label: "가격순" },
];

export function CourseList({ courses, highlightCourse = null, highlightTimes = [] }: { courses: CourseResult[]; highlightCourse?: string | null; highlightTimes?: string[] }) {
  const [view, setView]     = useState<ViewMode>("list");
  const [filter, setFilter] = useState<"all" | Status>("green");
  const [sort, setSort]     = useState<SortMode>("alpha");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "card") setView(stored);
    const storedSort = localStorage.getItem(SORT_STORAGE_KEY);
    if (storedSort === "alpha" || storedSort === "distance" || storedSort === "price") setSort(storedSort as SortMode);
    setHydrated(true);
  }, []);

  const changeView = (next: ViewMode) => {
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const changeSort = (next: SortMode) => {
    setSort(next);
    localStorage.setItem(SORT_STORAGE_KEY, next);
  };

  const displayCourses = useMemo(() => {
    const base = filter === "all" ? courses : courses.filter((c) => c.status === filter);
    const sorted = [...base].sort((a, b) => {
      if (sort === "alpha")    return a.name.localeCompare(b.name);
      if (sort === "distance") return (a.distance_km ?? 9999) - (b.distance_km ?? 9999);
      if (sort === "price")    return (lowestPrice(a) ?? 9999) - (lowestPrice(b) ?? 9999);
      return 0;
    });
    if (!highlightCourse) return sorted;
    const hi   = sorted.filter((c) => c.name === highlightCourse);
    const rest = sorted.filter((c) => c.name !== highlightCourse);
    return [...hi, ...rest];
  }, [courses, filter, sort, highlightCourse]);

  return (
    <div>
      <div className={s.toolbar}>
        <div className={s["toolbar-left"]}>
          <Dropdown
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(v) => setFilter(v as "all" | Status)}
          />
          <Dropdown
            options={SORT_OPTIONS}
            value={sort}
            onChange={(v) => changeSort(v as SortMode)}
          />
        </div>

        <div role="tablist" aria-label="보기 방식" className={s["toggle-group"]}>
          <ToggleButton active={view === "list"} onClick={() => changeView("list")} label="리스트" icon={<ListIcon />} iconOnly />
          <ToggleButton active={view === "card"} onClick={() => changeView("card")} label="카드"   icon={<CardIcon />} iconOnly />
        </div>
      </div>

      <div className={`${s.content}${hydrated ? "" : ` ${s.hidden}`}`}>
        {view === "card" ? (
          <section className={s["card-view"]}>
            {displayCourses.map((c) => (
              <CourseCard key={c.name} course={c} mode="list" highlight={c.name === highlightCourse} highlightTimes={c.name === highlightCourse ? highlightTimes : []} />
            ))}
          </section>
        ) : (
          <section className={s["list-view"]}>
            {displayCourses.map((c) => (
              <CourseCard key={c.name} course={c} mode="list" highlight={c.name === highlightCourse} highlightTimes={c.name === highlightCourse ? highlightTimes : []} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Shared dropdown ──────────────────────────────────────────────────────────

function Dropdown({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className={s["dropdown-wrap"]} ref={ref}>
      <button
        type="button"
        className={`${s["dropdown-trigger"]}${open ? ` ${s.open}` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {currentLabel}
        <svg className={s.chevron} width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className={s.dropdown} role="listbox">
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                className={`${s["dropdown-item"]}${value === opt.value ? ` ${s.active}` : ""}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
                {value === opt.value && (
                  <svg className={s.check} width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────

function ToggleButton({ active, onClick, label, icon, iconOnly = false }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode; iconOnly?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      onClick={onClick}
      className={`${s["toggle-btn"]}${active ? ` ${s.active}` : ""}`}
    >
      {icon}
      {!iconOnly && label}
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

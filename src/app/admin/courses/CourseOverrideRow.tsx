"use client";

import { useState, useTransition } from "react";
import type { CourseResult } from "@/lib/data";
import type { CourseOverride } from "@/lib/supabase";
import { upsertCourseOverride, toggleOverrideActive, deleteOverride } from "../actions";
import s from "./CourseOverrideRow.module.scss";

const STATUS_OPTIONS = [
  { value: "", label: "— 기본값 (스크래핑)" },
  { value: "green", label: "🟢 green — 예약 가능" },
  { value: "afternoon", label: "🔵 afternoon — 오후만 가능" },
  { value: "yellow", label: "🟡 yellow — 접속 불가" },
  { value: "red", label: "🔴 red — 슬롯 없음" },
  { value: "error", label: "⚫ error — 수집 오류" },
];

export function CourseOverrideRow({
  course,
  override,
}: {
  course: CourseResult;
  override: CourseOverride | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const hasActive = override?.is_active === true;

  function handleToggle() {
    startTransition(async () => {
      if (override) {
        await toggleOverrideActive(course.name, !override.is_active);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Override를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteOverride(course.name);
    });
  }

  return (
    <div className={`${s.row} ${hasActive ? s.active : ""}`}>
      <div className={s.header} onClick={() => setOpen((v) => !v)}>
        <div className={s.left}>
          <span className={`${s.dot} ${hasActive ? s["dot-active"] : ""}`} />
          <span className={s.name}>{course.name}</span>
          {override && (
            <span className={`${s.badge} ${hasActive ? s["badge-on"] : s["badge-off"]}`}>
              {hasActive ? "Override ON" : "Override OFF"}
            </span>
          )}
        </div>
        <div className={s.right}>
          {override?.price_override != null && (
            <span className={s.hint}>${override.price_override}/인</span>
          )}
          {override?.status_override && (
            <span className={s.hint}>{override.status_override}</span>
          )}
          <span className={s.chevron}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div className={s.body}>
          <div className={s.scraped}>
            <strong>스크래핑 데이터:</strong> 상태={course.status} · 슬롯 {course.slots.length}개
            {course.slots.length > 0 && (() => {
              const prices = course.slots.filter(sl => sl.price != null).map(sl => sl.price as number);
              return prices.length > 0 ? ` · 최저가 $${Math.min(...prices).toFixed(2)}` : " · 가격 없음";
            })()}
          </div>

          <form
            className={s.form}
            action={upsertCourseOverride}
          >
            <input type="hidden" name="course_name" value={course.name} />
            <input type="hidden" name="is_active" value="true" />

            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.label}>가격 override ($/인)</label>
                <input
                  className={s.input}
                  type="number"
                  name="price_override"
                  step="0.01"
                  min="0"
                  defaultValue={override?.price_override ?? ""}
                  placeholder="예: 69.00"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>상태 override</label>
                <select
                  className={s.select}
                  name="status_override"
                  defaultValue={override?.status_override ?? ""}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>카트 정책 override</label>
                <select
                  className={s.select}
                  name="cart_policy_override"
                  defaultValue={override?.cart_policy_override ?? ""}
                >
                  <option value="">— 기본값 (스크래핑)</option>
                  <option value="mandatory">카트 필수</option>
                  <option value="optional">카트 선택</option>
                  <option value="included">카트비 포함</option>
                </select>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label}>메모 (내부용)</label>
              <input
                className={s.input}
                type="text"
                name="notes"
                defaultValue={override?.notes ?? ""}
                placeholder="관리자 메모"
              />
            </div>

            <div className={s.actions}>
              <button className={s["btn-save"]} type="submit" disabled={pending}>
                저장 (Override ON)
              </button>
              {override && (
                <>
                  <button
                    className={s["btn-toggle"]}
                    type="button"
                    onClick={handleToggle}
                    disabled={pending}
                  >
                    {hasActive ? "Override 끄기" : "Override 켜기"}
                  </button>
                  <button
                    className={s["btn-delete"]}
                    type="button"
                    onClick={handleDelete}
                    disabled={pending}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { COURSE_ADAPTERS, type Course } from "@/lib/courses";
import { createCourse, updateCourse, deleteCourse, toggleCourseActive } from "../actions";
import s from "./CourseManager.module.scss";

const ADAPTER_LABELS: Record<string, string> = {
  manual: "manual — 수동 입력 (크롤 안 함)",
  teeon: "teeon — Tee-On (CourseCode)",
  teeitup: "teeitup — TeeItUp/GolfNow",
  prophetservices: "prophetservices — Prophet",
  chronogolf: "chronogolf — Chronogolf",
  cps_golf: "cps_golf — CPS Golf",
  clubhouse_online: "clubhouse_online — ClubhouseOnline",
  teeon_portal: "teeon_portal — Tee-On 포털",
  golfnow: "golfnow — GolfNow (facility_id)",
};

function CourseForm({
  course,
  onDone,
}: {
  course?: Course;
  onDone?: () => void;
}) {
  const [adapter, setAdapter] = useState<string>(course?.adapter ?? "manual");
  const [pending, startTransition] = useTransition();
  const ref = (course?.source_ref ?? {}) as Record<string, unknown>;
  const isEdit = !!course;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) await updateCourse(formData);
      else await createCourse(formData);
      onDone?.();
    });
  }

  const showCourseCode = adapter === "teeon" || adapter === "teeon_portal";
  const showGolfNow = adapter === "golfnow";

  return (
    <form className={s.form} action={handleSubmit}>
      {isEdit && <input type="hidden" name="id" value={course!.id} />}

      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.label}>코스 이름 *</label>
          <input className={s.input} name="name" required defaultValue={course?.name ?? ""} placeholder="예: Transcona Golf Club" />
        </div>
        <div className={s.field}>
          <label className={s.label}>slug (비우면 자동)</label>
          <input className={s.input} name="slug" defaultValue={course?.slug ?? ""} placeholder="transcona" />
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>예약 링크 (바로가기, 코스당 1개)</label>
        <input className={s.input} name="booking_url" type="url" defaultValue={course?.booking_url ?? ""} placeholder="https://..." />
      </div>

      <div className={s.field}>
        <label className={s.label}>시간 출처 (adapter)</label>
        <select className={s.select} name="adapter" value={adapter} onChange={(e) => setAdapter(e.target.value)}>
          {COURSE_ADAPTERS.map((a) => (
            <option key={a} value={a}>{ADAPTER_LABELS[a] ?? a}</option>
          ))}
        </select>
      </div>

      {showCourseCode && (
        <div className={s.field}>
          <label className={s.label}>CourseCode</label>
          <input className={s.input} name="ref_course_code" defaultValue={(ref.course_code as string) ?? ""} placeholder="예: TRAN" />
        </div>
      )}
      {showGolfNow && (
        <div className={s.grid}>
          <div className={s.field}>
            <label className={s.label}>GolfNow facility_id</label>
            <input className={s.input} name="ref_facility_id" defaultValue={(ref.facility_id as string) ?? ""} placeholder="예: 15887" />
          </div>
          <div className={s.field}>
            <label className={s.label}>GolfNow slug</label>
            <input className={s.input} name="ref_slug" defaultValue={(ref.slug as string) ?? ""} placeholder="assiniboine-golf-club" />
          </div>
        </div>
      )}
      {adapter === "manual" && (
        <p className={s.hint}>※ manual 코스의 티타임은 저장 후 “티타임 편집”에서 입력합니다 (WS-A4).</p>
      )}

      <div className={s.grid3}>
        <div className={s.field}>
          <label className={s.label}>거리 (km)</label>
          <input className={s.input} type="number" name="distance_km" min="0" defaultValue={course?.distance_km ?? ""} />
        </div>
        <div className={s.field}>
          <label className={s.label}>기본 인원</label>
          <input className={s.input} type="number" name="default_players" min="1" max="4" defaultValue={course?.default_players ?? 4} />
        </div>
        <div className={s.field}>
          <label className={s.label}>정렬 순서</label>
          <input className={s.input} type="number" name="sort_order" defaultValue={course?.sort_order ?? 0} />
        </div>
      </div>

      <div className={s.grid3}>
        <div className={s.field}>
          <label className={s.label}>전화</label>
          <input className={s.input} name="phone" defaultValue={course?.phone ?? ""} placeholder="(204) ..." />
        </div>
        <div className={s.field}>
          <label className={s.label}>카트 필수</label>
          <select className={s.select} name="cart_mandatory" defaultValue={course?.cart_mandatory ? "true" : "false"}>
            <option value="false">불필요</option>
            <option value="true">필수</option>
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label}>활성</label>
          <select className={s.select} name="is_active" defaultValue={course?.is_active === false ? "false" : "true"}>
            <option value="true">활성 (홈 노출)</option>
            <option value="false">비활성 (숨김)</option>
          </select>
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>메모 (내부용)</label>
        <input className={s.input} name="notes" defaultValue={course?.notes ?? ""} />
      </div>

      <div className={s.actions}>
        <button className={s.btnSave} type="submit" disabled={pending}>
          {pending ? "저장 중…" : isEdit ? "수정 저장" : "코스 추가"}
        </button>
      </div>
    </form>
  );
}

function CourseRow({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`"${course.name}" 코스를 삭제할까요?`)) return;
    startTransition(async () => {
      await deleteCourse(course.id);
    });
  }
  function handleToggle() {
    startTransition(async () => {
      await toggleCourseActive(course.id, !course.is_active);
    });
  }

  return (
    <div className={`${s.row} ${course.is_active ? "" : s.inactive}`}>
      <div className={s.header} onClick={() => setOpen((v) => !v)}>
        <div className={s.left}>
          <span className={s.name}>{course.name}</span>
          <span className={s.badge}>{course.adapter ?? "—"}</span>
          {!course.is_active && <span className={s.badgeOff}>비활성</span>}
        </div>
        <div className={s.right}>
          {course.distance_km != null && <span className={s.meta}>~{course.distance_km}km</span>}
          <button className={s.btnMini} type="button" onClick={(e) => { e.stopPropagation(); handleToggle(); }} disabled={pending}>
            {course.is_active ? "숨기기" : "노출"}
          </button>
          <button className={s.btnMiniDel} type="button" onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={pending}>
            삭제
          </button>
          <span className={s.chevron}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className={s.body}>
          <CourseForm course={course} onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export function CourseManager({ courses }: { courses: Course[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className={s.wrap}>
      <div className={s.topbar}>
        <h2 className={s.h2}>코스 등록 / 관리 ({courses.length})</h2>
        <button className={s.btnAdd} type="button" onClick={() => setAdding((v) => !v)}>
          {adding ? "닫기" : "+ 코스 추가"}
        </button>
      </div>

      {adding && (
        <div className={s.addBox}>
          <CourseForm onDone={() => setAdding(false)} />
        </div>
      )}

      <div className={s.list}>
        {courses.map((c) => (
          <CourseRow key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}

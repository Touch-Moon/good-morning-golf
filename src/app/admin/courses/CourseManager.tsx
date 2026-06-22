"use client";

import { useState, useTransition } from "react";
import { COURSE_ADAPTERS, type Course, type ManualSlot } from "@/lib/courses";
import { useT } from "@/lib/locale-context";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseActive,
  updateManualSlots,
} from "../actions";
import s from "./CourseManager.module.scss";

function CourseForm({ course, onDone }: { course?: Course; onDone?: () => void }) {
  const t = useT().admin.courses;
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
          <label className={s.label}>{t.name} *</label>
          <input className={s.input} name="name" required defaultValue={course?.name ?? ""} placeholder={t.namePh} />
        </div>
        <div className={s.field}>
          <label className={s.label}>{t.slug}</label>
          <input className={s.input} name="slug" defaultValue={course?.slug ?? ""} placeholder="transcona" />
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>{t.bookingUrl}</label>
        <input className={s.input} name="booking_url" type="url" defaultValue={course?.booking_url ?? ""} placeholder="https://..." />
      </div>

      <div className={s.field}>
        <label className={s.label}>{t.adapter}</label>
        <select className={s.select} name="adapter" value={adapter} onChange={(e) => setAdapter(e.target.value)}>
          {COURSE_ADAPTERS.map((a) => (
            <option key={a} value={a}>{a === "manual" ? t.adapterManual : a}</option>
          ))}
        </select>
      </div>

      {showCourseCode && (
        <div className={s.field}>
          <label className={s.label}>{t.courseCode}</label>
          <input className={s.input} name="ref_course_code" defaultValue={(ref.course_code as string) ?? ""} placeholder="TRAN" />
        </div>
      )}
      {showGolfNow && (
        <div className={s.grid}>
          <div className={s.field}>
            <label className={s.label}>{t.facilityId}</label>
            <input className={s.input} name="ref_facility_id" defaultValue={(ref.facility_id as string) ?? ""} placeholder="15887" />
          </div>
          <div className={s.field}>
            <label className={s.label}>{t.gnSlug}</label>
            <input className={s.input} name="ref_slug" defaultValue={(ref.slug as string) ?? ""} placeholder="assiniboine-golf-club" />
          </div>
        </div>
      )}
      {adapter === "manual" && <p className={s.hint}>{t.manualHint}</p>}

      <div className={s.grid3}>
        <div className={s.field}>
          <label className={s.label}>{t.distanceKm}</label>
          <input className={s.input} type="number" name="distance_km" min="0" defaultValue={course?.distance_km ?? ""} />
        </div>
        <div className={s.field}>
          <label className={s.label}>{t.players}</label>
          <input className={s.input} type="number" name="default_players" min="1" max="4" defaultValue={course?.default_players ?? 4} />
        </div>
        <div className={s.field}>
          <label className={s.label}>{t.sort}</label>
          <input className={s.input} type="number" name="sort_order" defaultValue={course?.sort_order ?? 0} />
        </div>
      </div>

      <div className={s.grid3}>
        <div className={s.field}>
          <label className={s.label}>{t.phone}</label>
          <input className={s.input} name="phone" defaultValue={course?.phone ?? ""} placeholder="(204) ..." />
        </div>
        <div className={s.field}>
          <label className={s.label}>{t.cart}</label>
          <select className={s.select} name="cart_mandatory" defaultValue={course?.cart_mandatory ? "true" : "false"}>
            <option value="false">{t.cartNo}</option>
            <option value="true">{t.cartYes}</option>
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label}>{t.active}</label>
          <select className={s.select} name="is_active" defaultValue={course?.is_active === false ? "false" : "true"}>
            <option value="true">{t.activeOn}</option>
            <option value="false">{t.activeOff}</option>
          </select>
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>{t.notes}</label>
        <input className={s.input} name="notes" defaultValue={course?.notes ?? ""} />
      </div>

      <div className={s.actions}>
        <button className={s.btnSave} type="submit" disabled={pending}>
          {pending ? t.saving : isEdit ? t.save : t.addBtn}
        </button>
      </div>
    </form>
  );
}

function ManualSlotsEditor({ course }: { course: Course }) {
  const t = useT().admin.courses;
  const [slots, setSlots] = useState<ManualSlot[]>(course.manual_slots ?? []);
  const [pending, startTransition] = useTransition();

  function update(i: number, patch: Partial<ManualSlot>) {
    setSlots((prev) => prev.map((sl, idx) => (idx === i ? { ...sl, ...patch } : sl)));
  }
  function addSlot() {
    setSlots((prev) => [...prev, { time: "07:00", price: null, is_hot_deal: false, spots_available: 4 }]);
  }
  function removeSlot(i: number) {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  }
  function save() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(course.id));
      fd.append("slots_json", JSON.stringify(slots));
      await updateManualSlots(fd);
    });
  }

  return (
    <div className={s.slotEditor}>
      <div className={s.slotTop}>
        <strong className={s.slotTitle}>{t.teeTimes}</strong>
        <button type="button" className={s.slotAdd} onClick={addSlot}>{t.addSlot}</button>
      </div>

      {slots.length === 0 && <p className={s.hint}>{t.noSlots}</p>}

      {slots.map((sl, i) => (
        <div key={i} className={s.slotRow}>
          <label className={s.slotCell}>
            <span className={s.slotCap}>{t.time}</span>
            <input className={s.slotInput} type="time" value={sl.time} onChange={(e) => update(i, { time: e.target.value })} />
          </label>
          <label className={s.slotCell}>
            <span className={s.slotCap}>{t.price}</span>
            <input className={s.slotInput} type="number" min="0" value={sl.price ?? ""} onChange={(e) => update(i, { price: e.target.value === "" ? null : Number(e.target.value) })} />
          </label>
          <label className={s.slotCell}>
            <span className={s.slotCap}>{t.spots}</span>
            <input className={s.slotInput} type="number" min="1" max="4" value={sl.spots_available ?? ""} onChange={(e) => update(i, { spots_available: e.target.value === "" ? null : Number(e.target.value) })} />
          </label>
          <label className={s.slotCheck}>
            <input type="checkbox" checked={sl.is_hot_deal} onChange={(e) => update(i, { is_hot_deal: e.target.checked })} />
            <span>{t.hotDeal}</span>
          </label>
          <button type="button" className={s.slotDel} onClick={() => removeSlot(i)} aria-label="remove">×</button>
        </div>
      ))}

      <div className={s.actions}>
        <button type="button" className={s.btnSave} onClick={save} disabled={pending}>
          {pending ? t.saving : t.saveSlots}
        </button>
      </div>
    </div>
  );
}

function CourseRow({ course }: { course: Course }) {
  const t = useT().admin.courses;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t.delConfirm(course.name))) return;
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
          {!course.is_active && <span className={s.badgeOff}>{t.activeOff}</span>}
        </div>
        <div className={s.right}>
          {course.distance_km != null && <span className={s.meta}>~{course.distance_km}km</span>}
          <button className={s.btnMini} type="button" onClick={(e) => { e.stopPropagation(); handleToggle(); }} disabled={pending}>
            {course.is_active ? t.hide : t.show}
          </button>
          <button className={s.btnMiniDel} type="button" onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={pending}>
            {t.del}
          </button>
          <span className={s.chevron}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className={s.body}>
          <CourseForm course={course} onDone={() => setOpen(false)} />
          {course.adapter === "manual" && <ManualSlotsEditor course={course} />}
        </div>
      )}
    </div>
  );
}

export function CourseManager({ courses }: { courses: Course[] }) {
  const t = useT().admin.courses;
  const [adding, setAdding] = useState(false);

  return (
    <div className={s.wrap}>
      <div className={s.topbar}>
        <h2 className={s.h2}>{t.manage(courses.length)}</h2>
        <button className={s.btnAdd} type="button" onClick={() => setAdding((v) => !v)}>
          {adding ? t.close : t.add}
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

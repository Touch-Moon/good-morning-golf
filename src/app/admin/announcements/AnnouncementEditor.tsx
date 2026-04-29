"use client";

import { useState, useTransition } from "react";
import type { Announcement } from "@/lib/supabase";
import { upsertAnnouncement, deleteAnnouncement, setAnnouncementActive } from "../actions";
import { WeeklyBookingForm } from "./WeeklyBookingForm";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import s from "./AnnouncementEditor.module.scss";

type CourseSlim = { name: string; slots: string[] };

type FormMode = "weekly" | "free" | null;

export function AnnouncementEditor({
  announcements,
  courses,
  targetDate,
}: {
  announcements: Announcement[];
  courses: CourseSlim[];
  targetDate: string;
}) {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [pending, startTransition] = useTransition();

  function openFree() { setEditing(null); setFormMode("free"); }
  function openWeekly() { setEditing(null); setFormMode("weekly"); }
  function openEdit(a: Announcement) { setEditing(a); setFormMode("free"); }
  function closeForm() { setFormMode(null); setEditing(null); }

  function handleDelete(id: string) {
    if (!confirm("공지사항을 삭제할까요?")) return;
    startTransition(async () => { await deleteAnnouncement(id); });
  }

  function handleToggle(a: Announcement) {
    startTransition(async () => { await setAnnouncementActive(a.id, !a.is_active); });
  }

  async function handleFreeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertAnnouncement(fd);
      closeForm();
    });
  }

  return (
    <div className={s.wrap}>
      {/* Action buttons */}
      {formMode === null && (
        <div className={s.btnRow}>
          <button className={s["btn-weekly"]} onClick={openWeekly}>
            📅 주간 예약 공지 작성
          </button>
          <button className={s["btn-new"]} onClick={openFree}>
            + 직접 입력
          </button>
        </div>
      )}

      {/* Weekly structured form */}
      {formMode === "weekly" && (
        <WeeklyBookingForm courses={courses} targetDate={targetDate} onClose={closeForm} />
      )}

      {/* Free-text form */}
      {formMode === "free" && (
        <form className={s.form} onSubmit={handleFreeSubmit}>
          <h2 className={s["form-title"]}>{editing ? "공지 수정" : "직접 입력"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input type="hidden" name="is_active" value="false" />
          <div className={s.field}>
            <label className={s.label}>공지 내용</label>
            <textarea
              className={s.textarea}
              name="message"
              rows={4}
              defaultValue={editing?.message ?? ""}
              placeholder="공지 내용을 입력하세요."
              required
            />
          </div>
          <div className={s.actions}>
            <button className={s["btn-save"]} type="submit" disabled={pending}>저장</button>
            <button className={s["btn-cancel"]} type="button" onClick={closeForm}>취소</button>
          </div>
        </form>
      )}

      {/* List */}
      <div className={s.list}>
        {announcements.length === 0 && formMode === null && (
          <p className={s.empty}>공지사항이 없습니다.</p>
        )}
        {announcements.map((a) => {
          const isExpired = a.expires_at != null && new Date(a.expires_at) < new Date();
          return (
          <div key={a.id} className={`${s.item} ${a.is_active && !isExpired ? s.active : ""}`}>
            <div className={s["item-header"]}>
              <span className={`${s["active-badge"]} ${a.is_active && !isExpired ? s.on : s.off}`}>
                {isExpired ? "만료됨" : a.is_active ? "활성" : "비활성"}
              </span>
              {a.expires_at && (
                <span className={`${s["expires-badge"]} ${isExpired ? s.expired : ""}`}>
                  ⏱ {new Date(a.expires_at).toLocaleString("ko-KR", {
                    timeZone: "America/Winnipeg",
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              )}
              <span className={s.date}>
                {new Date(a.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <AnnouncementBanner announcement={a} />
            <div className={s["item-actions"]}>
              <button
                className={`${s["btn-toggle"]} ${a.is_active ? s.deactivate : s.activate}`}
                onClick={() => handleToggle(a)}
                disabled={pending}
              >
                {a.is_active ? "비활성화" : "활성화"}
              </button>
              <button className={s["btn-edit"]} onClick={() => openEdit(a)} disabled={pending}>
                수정
              </button>
              <button className={s["btn-delete"]} onClick={() => handleDelete(a.id)} disabled={pending}>
                삭제
              </button>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

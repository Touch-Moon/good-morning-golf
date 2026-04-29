"use client";

import { useState, useTransition } from "react";
import type { Announcement } from "@/lib/supabase";
import { upsertAnnouncement, deleteAnnouncement, setAnnouncementActive } from "../actions";
import s from "./AnnouncementEditor.module.scss";

export function AnnouncementEditor({ announcements }: { announcements: Announcement[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(a: Announcement) {
    setEditing(a);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!confirm("공지사항을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteAnnouncement(id);
    });
  }

  function handleToggle(a: Announcement) {
    startTransition(async () => {
      await setAnnouncementActive(a.id, !a.is_active);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertAnnouncement(fd);
      setShowForm(false);
      setEditing(null);
    });
  }

  return (
    <div className={s.wrap}>
      {/* New form */}
      {showForm ? (
        <form className={s.form} onSubmit={handleSubmit}>
          <h2 className={s["form-title"]}>{editing ? "공지 수정" : "새 공지 작성"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input type="hidden" name="is_active" value="false" />
          <div className={s.field}>
            <label className={s.label}>공지 내용</label>
            <textarea
              className={s.textarea}
              name="message"
              rows={3}
              defaultValue={editing?.message ?? ""}
              placeholder="예: 이번 주 토요일 오전 6시부터 예약 가능합니다."
              required
            />
          </div>
          <div className={s.actions}>
            <button className={s["btn-save"]} type="submit" disabled={pending}>저장</button>
            <button className={s["btn-cancel"]} type="button" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </form>
      ) : (
        <button className={s["btn-new"]} onClick={openNew}>+ 새 공지 작성</button>
      )}

      {/* List */}
      <div className={s.list}>
        {announcements.length === 0 && (
          <p className={s.empty}>공지사항이 없습니다.</p>
        )}
        {announcements.map((a) => (
          <div key={a.id} className={`${s.item} ${a.is_active ? s.active : ""}`}>
            <div className={s["item-header"]}>
              <span className={`${s["active-badge"]} ${a.is_active ? s.on : s.off}`}>
                {a.is_active ? "활성" : "비활성"}
              </span>
              <span className={s.date}>
                {new Date(a.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <p className={s.message}>{a.message}</p>
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
        ))}
      </div>
    </div>
  );
}

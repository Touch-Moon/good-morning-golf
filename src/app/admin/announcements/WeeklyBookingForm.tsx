"use client";

import { useState, useTransition } from "react";
import { formatTime } from "@/lib/data";
import { upsertAnnouncement } from "../actions";
import s from "./WeeklyBookingForm.module.scss";

const FIXED_MEMBERS = ["이금정", "전지호", "박대영", "김기태", "문진철"];

// Winnipeg CDT = UTC-5 (summer)
const WINNIPEG_OFFSET = "-05:00";

type CourseSlim = { name: string; slots: string[] };

function buildMessage(courseName: string, times: string[], absent: string[]): string {
  const lines: string[] = ["이번주"];
  lines.push(`장소: ${courseName}`);
  if (times.length > 0) {
    lines.push(`시간: ${times.map(formatTime).join(", ")}`);
  }
  const attending = FIXED_MEMBERS.filter((m) => !absent.includes(m));
  if (attending.length > 0) {
    lines.push(`참가인원: ${attending.join(", ")}`);
  }
  return lines.join("\n");
}

// Returns ISO UTC string: targetDate + lastTime (HH:mm) in Winnipeg CDT
function buildExpiresAt(targetDate: string, times: string[]): string | null {
  if (!targetDate || times.length === 0) return null;
  const lastTime = [...times].sort().at(-1)!; // "HH:mm"
  return new Date(`${targetDate}T${lastTime}:00${WINNIPEG_OFFSET}`).toISOString();
}

export function WeeklyBookingForm({
  courses,
  targetDate,
  onClose,
}: {
  courses: CourseSlim[];
  targetDate: string;
  onClose: () => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [absentFixed, setAbsentFixed] = useState<string[]>([]);
  const [customAbsent, setCustomAbsent] = useState("");
  const [pending, startTransition] = useTransition();

  const courseData = courses.find((c) => c.name === selectedCourse);
  const slots = courseData?.slots ?? [];

  const allAbsent = [
    ...absentFixed,
    ...customAbsent.split(",").map((s) => s.trim()).filter(Boolean),
  ];

  const preview = selectedCourse
    ? buildMessage(selectedCourse, selectedTimes, allAbsent)
    : "";

  const expiresAt = buildExpiresAt(targetDate, selectedTimes);

  function toggleTime(t: string) {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()
    );
  }

  function toggleAbsent(name: string) {
    setAbsentFixed((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;
    const fd = new FormData();
    fd.set("message", preview);
    fd.set("is_active", "false");
    if (expiresAt) fd.set("expires_at", expiresAt);
    startTransition(async () => {
      await upsertAnnouncement(fd);
      onClose();
    });
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s["form-header"]}>
        <h2 className={s.title}>주간 예약 공지 작성</h2>
        <button type="button" className={s["btn-close"]} onClick={onClose}>✕</button>
      </div>

      {/* Course selector */}
      <div className={s.section}>
        <label className={s.label}>장소</label>
        <select
          className={s.select}
          value={selectedCourse}
          onChange={(e) => { setSelectedCourse(e.target.value); setSelectedTimes([]); }}
          required
        >
          <option value="">골프장을 선택하세요</option>
          {courses.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Time slot selector */}
      <div className={s.section}>
        <label className={s.label}>
          시간 <span className={s["label-hint"]}>(복수 선택 가능)</span>
        </label>
        {!selectedCourse && (
          <p className={s.placeholder}>골프장 선택 후 슬롯이 표시됩니다</p>
        )}
        {selectedCourse && slots.length === 0 && (
          <p className={s.placeholder}>해당 코스의 스크래핑된 슬롯이 없습니다</p>
        )}
        {slots.length > 0 && (
          <div className={s["slot-grid"]}>
            {slots.map((t) => (
              <button
                key={t}
                type="button"
                className={`${s["slot-btn"]} ${selectedTimes.includes(t) ? s.selected : ""}`}
                onClick={() => toggleTime(t)}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Absent members */}
      <div className={s.section}>
        <label className={s.label}>
          미참가인원 <span className={s["label-hint"]}>(해당되는 인원 선택)</span>
        </label>
        <div className={s["member-grid"]}>
          {FIXED_MEMBERS.map((name) => (
            <button
              key={name}
              type="button"
              className={`${s["member-btn"]} ${absentFixed.includes(name) ? s.absent : ""}`}
              onClick={() => toggleAbsent(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <input
          className={s.input}
          type="text"
          placeholder="추가 인원 (쉼표로 구분: 홍길동, 김철수)"
          value={customAbsent}
          onChange={(e) => setCustomAbsent(e.target.value)}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className={s.preview}>
          <p className={s["preview-label"]}>미리보기</p>
          <pre className={s["preview-text"]}>{preview}</pre>
          {expiresAt && (
            <p className={s["preview-expires"]}>
              ⏱ 자동 만료:{" "}
              {new Date(expiresAt).toLocaleString("ko-KR", {
                timeZone: "America/Winnipeg",
                month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })} (위니펙 시간)
            </p>
          )}
        </div>
      )}

      <div className={s.actions}>
        <button
          className={s["btn-save"]}
          type="submit"
          disabled={!selectedCourse || pending}
        >
          저장 (비활성 상태로)
        </button>
        <button className={s["btn-cancel"]} type="button" onClick={onClose}>
          취소
        </button>
      </div>
    </form>
  );
}

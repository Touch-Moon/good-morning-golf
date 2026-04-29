import type { Announcement } from "@/lib/supabase";
import s from "./AnnouncementBanner.module.scss";

const FIXED_MEMBERS = ["이금정", "전지호", "박대영", "김기태", "문진철"];

type ParsedLine =
  | { type: "venue"; value: string }
  | { type: "time"; value: string }
  | { type: "attending"; value: string }
  | { type: "text"; value: string };

function parseMessage(message: string): ParsedLine[] {
  return message.split("\n").flatMap((line): ParsedLine[] => {
    if (/^이번\s*주$/.test(line.trim())) return [];
    if (line.startsWith("장소: "))     return [{ type: "venue",    value: line.slice(4) }];
    if (line.startsWith("시간: "))     return [{ type: "time",     value: line.slice(4) }];
    if (line.startsWith("참가인원: "))  return [{ type: "attending", value: line.slice(6) }];
    if (line.startsWith("미참가인원: ")) {
      const absent = line.slice(7).split(",").map((n) => n.trim()).filter(Boolean);
      const attending = FIXED_MEMBERS.filter((m) => !absent.includes(m));
      return attending.length > 0 ? [{ type: "attending", value: attending.join(", ") }] : [];
    }
    if (line.trim() === "") return [];
    return [{ type: "text", value: line }];
  });
}

const ICONS: Record<string, React.ReactNode> = {
  venue: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
    </svg>
  ),
  time: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  attending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const lines = parseMessage(announcement.message);

  return (
    <div className={s.banner} role="alert">
      <div className={s.lines}>
        {lines.map((line, i) => {
          if (line.type === "text") {
            return <p key={i} className={s.text}>{line.value}</p>;
          }
          return (
            <div key={i} className={s.row}>
              <span className={s.rowIcon}>{ICONS[line.type]}</span>
              <span className={s.rowValue}>{line.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

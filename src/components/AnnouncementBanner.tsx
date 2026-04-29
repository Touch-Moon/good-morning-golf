import type { Announcement } from "@/lib/supabase";
import s from "./AnnouncementBanner.module.scss";

export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  return (
    <div className={s.banner} role="alert">
      <span className={s.icon}>📢</span>
      <p className={s.message}>{announcement.message}</p>
    </div>
  );
}

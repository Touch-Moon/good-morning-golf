import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { supabase } from "@/lib/supabase";
import type { Announcement } from "@/lib/supabase";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const announcements = (data ?? []) as Announcement[];

  return (
    <main className={s.main}>
      <h1 className={s.title}>히스토리</h1>
      <p className={s.desc}>지난 주간 공지사항을 모아 봅니다.</p>

      <div className={s.list}>
        {announcements.length === 0 && (
          <p className={s.empty}>지난 공지사항이 없습니다.</p>
        )}
        {announcements.map((a) => {
          const isExpired = a.expires_at != null && new Date(a.expires_at) < new Date();
          const isLive = a.is_active && !isExpired;
          return (
            <article key={a.id} className={`${s.item} ${isLive ? s.active : ""}`}>
              <div className={s["item-header"]}>
                <span className={`${s["active-badge"]} ${isLive ? s.on : s.off}`}>
                  {isExpired ? "만료됨" : a.is_active ? "활성" : "비활성"}
                </span>
                {a.expires_at && (
                  <span className={`${s["expires-badge"]} ${isExpired ? s.expired : ""}`}>
                    ⏱ {new Date(a.expires_at).toLocaleString("ko-KR", {
                      timeZone: "America/Winnipeg",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                <span className={s.date}>
                  {new Date(a.created_at).toLocaleDateString("ko-KR", {
                    timeZone: "America/Winnipeg",
                  })}
                </span>
              </div>
              <AnnouncementBanner announcement={a} maskNames />
            </article>
          );
        })}
      </div>
    </main>
  );
}

import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { supabase } from "@/lib/supabase";
import type { Announcement } from "@/lib/supabase";
import { getLocale } from "@/lib/i18n-server";
import { dict } from "@/lib/i18n";
import s from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const locale = await getLocale();
  const t = dict[locale];
  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const announcements = (data ?? []) as Announcement[];

  return (
    <main className={s.main}>
      <h1 className={s.title}>{t.history.title}</h1>
      <p className={s.desc}>{t.history.desc}</p>

      <div className={s.list}>
        {announcements.length === 0 && (
          <p className={s.empty}>{t.history.empty}</p>
        )}
        {announcements.map((a) => {
          const isExpired = a.expires_at != null && new Date(a.expires_at) < new Date();
          const isLive = a.is_active && !isExpired;
          return (
            <article key={a.id} className={`${s.item} ${isLive ? s.active : ""}`}>
              <div className={s["item-header"]}>
                <span className={`${s["active-badge"]} ${isLive ? s.on : s.off}`}>
                  {isExpired ? t.history.expired : a.is_active ? t.history.active : t.history.inactive}
                </span>
                {a.expires_at && (
                  <span className={`${s["expires-badge"]} ${isExpired ? s.expired : ""}`}>
                    ⏱ {new Date(a.expires_at).toLocaleString(dateLocale, {
                      timeZone: "America/Winnipeg",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                <span className={s.date}>
                  {new Date(a.created_at).toLocaleDateString(dateLocale, {
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

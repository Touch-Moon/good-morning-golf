"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { useLocale, useT } from "@/lib/locale-context";
import { setLocale } from "@/app/actions/locale";
import s from "@/app/admin/layout.module.scss";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useT();
  const [, startTransition] = useTransition();

  const nav = [
    { href: "/admin/courses", label: t.admin.nav.courses },
    { href: "/admin/announcements", label: t.admin.nav.announcements },
  ];

  const toggleLocale = () => {
    startTransition(() => setLocale(locale === "ko" ? "en" : "ko"));
  };
  const toggleLabel = locale === "ko" ? t.lang.toggleToEnglish : t.lang.toggleToKorean;

  return (
    <div className={s.shell}>
      <nav className={s.sidebar}>
        <div className={s["sidebar-logo"]}>
          <span className={s["logo-dot"]} />
          {t.admin.title}
        </div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${s["nav-link"]} ${pathname.startsWith(item.href) ? s.active : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <div className={s["nav-spacer"]} />
        <button type="button" className={s["nav-lang"]} onClick={toggleLocale}>
          <GlobeIcon />
          {toggleLabel}
        </button>
        <a href="/admin/logout" className={s["nav-logout"]}>
          {t.admin.nav.logout}
        </a>
      </nav>
      <main className={s.main}>{children}</main>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18M12 3a13.5 13.5 0 010 18M12 3a13.5 13.5 0 000 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

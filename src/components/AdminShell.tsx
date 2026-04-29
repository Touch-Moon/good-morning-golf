"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "@/app/admin/layout.module.scss";

const NAV = [
  { href: "/admin/courses", label: "코스 관리" },
  { href: "/admin/announcements", label: "공지사항" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={s.shell}>
      <nav className={s.sidebar}>
        <div className={s["sidebar-logo"]}>
          <span className={s["logo-dot"]} />
          Admin
        </div>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${s["nav-link"]} ${pathname.startsWith(item.href) ? s.active : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <div className={s["nav-spacer"]} />
        <a href="/admin/logout" className={s["nav-logout"]}>
          로그아웃
        </a>
      </nav>
      <main className={s.main}>{children}</main>
    </div>
  );
}

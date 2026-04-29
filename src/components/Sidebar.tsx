"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./Sidebar.module.scss";

const NAV_ITEMS = [
  {
    href: "/",
    label: "이번 주",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "히스토리",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={s.sidebar}>
      <div className={s.logo}>
        <Image src="/Logo-GMG.svg" alt="GMG Logo" width={48} height={48} className={s["logo-img"]} />
        <span className={s["logo-text"]}>
          <span className={s["logo-text-top"]}>Good Morning</span>
          <span className={s["logo-text-bottom"]}>Golf</span>
        </span>
      </div>
      <nav className={s.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${s["nav-item"]}${pathname === item.href ? ` ${s.active}` : ""}`}
          >
            {item.icon}
            <span className={s["nav-label"]}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

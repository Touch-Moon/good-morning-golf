"use client";

import { useState } from "react";
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
    href: "/hotdeals",
    label: "핫딜",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2C12 2 7 7.5 7 12a5 5 0 0010 0c0-4.5-5-10-5-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17a2 2 0 000-4c-.7 0-1.3.36-1.65.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeDrawer = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  };

  return (
    <>
      {/* ── Mobile top header ── */}
      <header className={s["mobile-header"]}>
        <div className={s["mobile-logo"]}>
          <Image src="/Logo-GMG.svg" alt="GMG" width={32} height={32} className={s["logo-img"]} />
          <span className={s["mobile-logo-text"]}>Good Morning Golf</span>
        </div>
        <button
          className={s.hamburger}
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div className={`${s.overlay}${closing ? ` ${s["overlay--closing"]}` : ""}`} onClick={closeDrawer}>
          <nav className={`${s.drawer}${closing ? ` ${s["drawer--closing"]}` : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={s["drawer-header"]}>
              <div className={s["drawer-logo"]}>
                <Image src="/Logo-GMG.svg" alt="GMG Logo" width={40} height={40} className={s["logo-img"]} />
                <span className={s["logo-text"]}>
                  <span className={s["logo-text-top"]}>Good Morning</span>
                  <span className={s["logo-text-bottom"]}>Golf</span>
                </span>
              </div>
              <button className={s["close-btn"]} onClick={closeDrawer} aria-label="닫기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={s["drawer-nav"]}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${s["nav-item"]}${pathname === item.href ? ` ${s.active}` : ""}`}
                  onClick={closeDrawer}
                >
                  {item.icon}
                  <span className={s["nav-label"]}>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
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
    </>
  );
}

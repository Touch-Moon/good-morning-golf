import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import s from "./layout.module.scss";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Saturday Tee Times — Winnipeg",
  description: "이번 주 토요일 골프 티타임 한눈에 보기",
  icons: { icon: "/Logo-GMG.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ fontFamily: "var(--font-plex-sans)" }}
      className={`${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <div className={s.shell}>
          <Sidebar />
          <div className={s.content}>{children}</div>
        </div>
      </body>
    </html>
  );
}

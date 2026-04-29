import type { Metadata } from "next";
import s from "./layout.module.scss";

export const metadata: Metadata = {
  title: "Admin — Good Morning Golf",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={s.adminRoot}>{children}</div>;
}

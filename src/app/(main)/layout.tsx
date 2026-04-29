import { Sidebar } from "@/components/Sidebar";
import s from "./layout.module.scss";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.shell}>
      <Sidebar />
      <div className={s.content}>{children}</div>
    </div>
  );
}

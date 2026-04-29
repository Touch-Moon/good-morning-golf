"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import s from "./page.module.scss";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin/courses");
    } else {
      const data = await res.json();
      setError(data.error ?? "로그인 실패");
    }
    setLoading(false);
  }

  return (
    <div className={s.wrap}>
      <div className={s.card}>
        <div className={s.logo}>
          <span className={s["logo-dot"]} />
          Admin
        </div>
        <h1 className={s.title}>관리자 로그인</h1>
        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.field}>
            <label className={s.label} htmlFor="username">아이디</label>
            <input
              id="username"
              className={s.input}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.form?.requestSubmit(); }}
              required
            />
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="password">비밀번호</label>
            <input
              id="password"
              className={s.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.form?.requestSubmit(); }}
              required
            />
          </div>
          {error && <p className={s.error}>{error}</p>}
          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

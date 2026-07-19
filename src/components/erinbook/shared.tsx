"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export type BadgeTone = "orange" | "green" | "blue" | "pink" | "purple" | "outline";

const navItems = [
  { label: "이벤트 캘린더", href: "/#calendar" },
  { label: "길드 홍보", href: "/#guild" },
  { label: "문의사항", href: "/#contact" },
  { label: "분배 계산기", href: "/share-calc" },
  { label: "스킬 계산기", href: "/skill-calc" },
  { label: "거대한 뿔피리", href: "/#horn" },
];

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(Math.max(0, Math.trunc(value)));
}

export function parseNumber(value: string) {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

export function useToast() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | null>(null);

  function show(messageText: string) {
    if (timer.current) window.clearTimeout(timer.current);
    setMessage(messageText);
    timer.current = window.setTimeout(() => setMessage(""), 2200);
  }

  return { message, show };
}

export async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function Toast({ message }: { message: string }) {
  return <div className={`eb-toast ${message ? "visible" : ""}`} role="status">{message}</div>;
}

export function SearchBox({ className, placeholder }: { className: string; placeholder: string }) {
  const [query, setQuery] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    const target = normalized.includes("분배") || normalized.includes("판매") ? "/share-calc" : normalized.includes("공지") ? "/erinbook-notice" : "/skill-calc";
    window.location.assign(target);
  }

  return (
    <form className={className} onSubmit={submit} role="search">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label="에린북 검색" />
      <button type="submit" aria-label="검색">⌕</button>
    </form>
  );
}

export function Badge({ children, tone = "orange" }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`eb-badge eb-badge-${tone}`}>{children}</span>;
}

export function SiteNav({ active }: { active?: "share" | "skill" }) {
  return (
    <div className="eb-site-header">
      <div className="eb-logo-row"><Link href="/">ERINBOOK</Link></div>
      <nav className="eb-nav" aria-label="primary">
        {navItems.map((item) => (
          <Link className={(active === "share" && item.href === "/share-calc") || (active === "skill" && item.href === "/skill-calc") ? "active" : ""} key={item.label} href={item.href}>{item.label}</Link>
        ))}
      </nav>
    </div>
  );
}

export function HeaderHero() {
  return (
    <header className="eb-top">
      <SiteNav />
      <section className="eb-hero">
        <div className="eb-hero-art" aria-hidden />
        <h1>ERINBOOK</h1>
        <p>마비노기의 <strong>모든것</strong></p>
        <SearchBox className="eb-search" placeholder="아이템이나 계산기를 검색해보세요" />
      </section>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="eb-footer">
      <strong>ERINBOOK</strong>
      <div className="eb-footer-links">
        <Link href="/erinbook-notice?view=terms">이용약관</Link>
        <Link href="/erinbook-notice?view=privacy">개인정보 처리방침</Link>
      </div>
      <div className="eb-socials" aria-label="social links">
        <a href="https://mabinogimobile.nexon.com/" aria-label="마비노기 공식 사이트">N</a>
        <a href="https://www.youtube.com/" aria-label="유튜브">▶</a>
        <a href="mailto:hello@erinbook.example" aria-label="이메일">@</a>
      </div>
    </footer>
  );
}

export function PlaceholderIcon({ label, large = false }: { label: string; large?: boolean }) {
  return <div className={large ? "eb-icon-placeholder large" : "eb-icon-placeholder"}>{label}</div>;
}

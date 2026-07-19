"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

type BadgeTone = "orange" | "green" | "blue" | "pink" | "purple" | "outline";

const navItems = [
  { label: "이벤트 캘린더", href: "/#calendar" },
  { label: "길드 홍보", href: "/#guild" },
  { label: "문의사항", href: "/#contact" },
  { label: "분배 계산기", href: "/share-calc" },
  { label: "스킬 계산기", href: "/skill-calc" },
  { label: "거대한 뿔피리", href: "/#horn" },
];

const skillDefinitions = [
  { name: "전장의 서곡", desc: "공격력 증가 버프", icon: "♬", metric: "공격력 증가", base: 28 },
  { name: "비바체", desc: "공격 속도 증가 버프", icon: "♪", metric: "공격 속도 증가", base: 18 },
  { name: "풍년가", desc: "행운 증가 버프", icon: "♩", metric: "행운 증가", base: 22 },
  { name: "인내의 노래", desc: "방어력 증가 버프", icon: "▣", metric: "방어력 증가", base: 24 },
  { name: "행진곡", desc: "이동 속도 증가 버프", icon: "♫", metric: "이동 속도 증가", base: 16 },
] as const;

const optionEffects = [
  ["멜로디 쇼크 (3중주)", 3],
  ["듀엣 연주", 1.5],
  ["합주 연주", 2],
  ["음악 전용 1단계 (+2%)", 2],
  ["음악 전용 2단계 (+4%)", 4],
  ["여신의 축복", 1],
  ["축복의 연주", 1.6],
  ["인내의 연주", 1.2],
] as const;

const rankLabels = ["랭크 F", "랭크 E", "랭크 D", "랭크 C", "랭크 B", "랭크 A", "랭크 9", "랭크 5", "랭크 1"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(Math.max(0, Math.trunc(value)));
}

function parseNumber(value: string) {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

function useToast() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | null>(null);

  function show(messageText: string) {
    if (timer.current) window.clearTimeout(timer.current);
    setMessage(messageText);
    timer.current = window.setTimeout(() => setMessage(""), 2200);
  }

  return { message, show };
}

async function writeClipboard(text: string) {
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

function Toast({ message }: { message: string }) {
  return <div className={`eb-toast ${message ? "visible" : ""}`} role="status">{message}</div>;
}

function SearchBox({ className, placeholder }: { className: string; placeholder: string }) {
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

const erinNotices = [
  ["업데이트", "green", "경매장 검색 기능 추가 안내", "2026.05.13"],
  ["점검", "blue", "5/12(화) 서버 불안정 버그(완료)", "2026.05.12"],
  ["이벤트", "pink", "에린북 공유 이벤트", "2026.05.07"],
  ["업데이트", "green", "계산기 기능 추가 안내", "2026.05.06"],
  ["공지", "orange", "에린북 오픈 안내", "2026.05.06"],
] as const;

const mabiNotices = [
  ["공지", "orange", "마비노기 모바일 시즌 2 업데이트 쇼케이스 사전 설문조사 안내", "2026.05.13"],
  ["점검", "blue", "5/14(목) 정기 점검 안내 (06:00 ~ 10:10)", "2026.05.12"],
  ["이벤트", "pink", "두근두근 아일랜드 이벤트 안내", "2026.05.07"],
  ["업데이트", "green", "5/7(목) 업데이트 노트", "2026.05.06"],
  ["상점", "purple", "5/7(목) 신규 패키지 안내", "2026.05.06"],
] as const;

const hornRows = [
  ["ch.1", "거뿔의 어떤 말들이 어쩌구저쩌구 -- 아마도 길드..."],
  ["ch.1", "하루가 길어서... 잠깐 쉬고 싶다"],
  ["ch.1", "하우징에서 물건 팔아요"],
  ["ch.1", "프리시즌 후리스"],
  ["ch.1", "마비노기 이런저런 소식"],
];

const noticeList = [
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
  ["이벤트", "pink", "에린북 이벤트 안내"],
  ["점검", "orange", "5월 20일 (화) 점검 안내"],
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
] as const;

const sharePresets = ["거래 수수료 5%", "거래 수수료 3%", "거래 수수료 8%", "수수료 없음"];

function Badge({ children, tone = "orange" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={`eb-badge eb-badge-${tone}`}>{children}</span>;
}

function SiteNav({ active }: { active?: "share" | "skill" }) {
  return (
    <div className="eb-site-header">
      <div className="eb-logo-row">
        <Link href="/">ERINBOOK</Link>
      </div>
      <nav className="eb-nav" aria-label="primary">
        {navItems.map((item) => (
          <Link className={(active === "share" && item.href === "/share-calc") || (active === "skill" && item.href === "/skill-calc") ? "active" : ""} key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function HeaderHero() {
  return (
    <header className="eb-top">
      <SiteNav />
      <section className="eb-hero">
        <div className="eb-hero-art" aria-hidden />
        <h1>ERINBOOK</h1>
        <p>
          마비노기의 <strong>모든것</strong>
        </p>
        <SearchBox className="eb-search" placeholder="아이템이나 계산기를 검색해보세요" />
      </section>
    </header>
  );
}

function Footer() {
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

function NoticeBoard({
  title,
  items,
  href,
}: {
  title: string;
  items: readonly (readonly [string, BadgeTone, string, string])[];
  href: string;
}) {
  return (
    <section className="eb-card eb-board">
      <div className="eb-card-title">
        <h2>{title}</h2>
        <Link href={href}>더보기</Link>
      </div>
      <div className="eb-notice-list">
        {items.map(([badge, tone, text, date]) => (
          <Link className="eb-notice-row" href={href} key={`${title}-${text}`}>
            <div>
              <Badge tone={tone}>{badge}</Badge>
              <b>{text}</b>
            </div>
            <time>{date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CalendarBlock() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [events, setEvents] = useState<{ date: string; title: string; detail: string; label: string; tone: BadgeTone }[]>([
    { date: "2026-04-18", title: "봄맞이 길드 행사", detail: "오후 08:00", label: "이벤트", tone: "pink" },
    { date: "2026-05-12", title: "서버 정기 점검", detail: "오전 08:00 ~ 오전 10:00", label: "점검", tone: "blue" },
    { date: "2026-05-12", title: "에린북 공유 이벤트", detail: "시즌 2 기념 공유 이벤트", label: "이벤트", tone: "pink" },
    { date: "2026-05-25", title: "업데이트 사전 안내", detail: "신규 계산기 업데이트", label: "공지", tone: "orange" },
    { date: "2026-06-01", title: "6월 출석 이벤트", detail: "매일 접속 보상을 확인하세요", label: "이벤트", tone: "pink" },
  ]);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDay, setSelectedDay] = useState(12);
  const [draftDate, setDraftDate] = useState("2026-05-12");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDetail, setDraftDetail] = useState("");
  const [draftLabel, setDraftLabel] = useState("이벤트");
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, index - firstWeekday + 1));
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      current: date.getUTCMonth() + 1 === month,
    };
  });
  const selectedKey = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const selectedEvents = events.filter((event) => event.date === selectedKey);
  const selectedWeekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(year, month - 1, selectedDay)).getUTCDay()];

  function moveMonth(amount: number) {
    const next = new Date(Date.UTC(year, month - 1 + amount, 1));
    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth() + 1);
    setSelectedDay(1);
    setDraftDate(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`);
  }

  function selectDate(date: (typeof calendarDays)[number]) {
    setYear(date.year);
    setMonth(date.month);
    setSelectedDay(date.day);
    setDraftDate(`${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`);
  }

  function selectDateValue(value: string) {
    const [nextYear, nextMonth, nextDay] = value.split("-").map(Number);
    const lastDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
    if (!nextYear || nextMonth < 1 || nextMonth > 12 || nextDay < 1 || nextDay > lastDay) return;
    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDay(nextDay);
    setDraftDate(value);
  }

  function addCalendarEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const toneByLabel: Record<string, BadgeTone> = { 이벤트: "pink", 점검: "blue", 공지: "orange" };
    setEvents((current) => [...current, {
      date: selectedKey,
      title: draftTitle.trim(),
      detail: draftDetail.trim() || "상세 내용 없음",
      label: draftLabel,
      tone: toneByLabel[draftLabel] ?? "orange",
    }]);
    setDraftTitle("");
    setDraftDetail("");
  }

  return (
    <section className="eb-card eb-calendar-card" id="calendar">
      <h2>이벤트 캘린더</h2>
      <div className="eb-calendar-wrap">
        <div className="eb-calendar">
          <div className="eb-month"><button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">‹</button><strong>{year}. {String(month).padStart(2, "0")}</strong><button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">›</button></div>
          <div className="eb-weekdays">{days.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="eb-dates">
            {calendarDays.map((date) => {
              const dateKey = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
              const classNames = [dateKey === selectedKey ? "active" : "", date.current ? "" : "outside", events.some((event) => event.date === dateKey) ? "has-event" : ""].filter(Boolean).join(" ");
              return (
              <button type="button" onClick={() => selectDate(date)} key={dateKey} className={classNames} aria-label={`${date.year}년 ${date.month}월 ${date.day}일`}>
                {date.day}
              </button>
              );
            })}
          </div>
        </div>
        <div className="eb-events">
          <div className="eb-events-heading">
            <h3>{String(month).padStart(2, "0")}.{String(selectedDay).padStart(2, "0")} ({selectedWeekday}) 일정</h3>
            <div className="eb-date-jump">
              <input value={draftDate} onChange={(event) => setDraftDate(event.target.value)} placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" aria-label="일정 날짜 입력" />
              <button type="button" onClick={() => selectDateValue(draftDate)}>이동</button>
            </div>
          </div>
          <form className="eb-event-form" onSubmit={addCalendarEvent}>
            <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="더미 일정 제목" aria-label="일정 제목" required />
            <input value={draftDetail} onChange={(event) => setDraftDetail(event.target.value)} placeholder="시간 또는 상세 내용" aria-label="일정 상세" />
            <select value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} aria-label="일정 분류">
              <option>이벤트</option>
              <option>점검</option>
              <option>공지</option>
            </select>
            <button type="submit">추가</button>
          </form>
          <div className="eb-event-list">
          {selectedEvents.map((event) => (
            <div className="eb-event-row" key={`${event.date}-${event.title}`}>
              <time>{String(month).padStart(2, "0")}.{String(selectedDay).padStart(2, "0")} ({selectedWeekday})</time>
              <div>
                <b>{event.title}</b>
                <span>{event.detail}</span>
              </div>
              <Badge tone={event.tone}>{event.label}</Badge>
            </div>
          ))}
          {!selectedEvents.length && <div className="eb-event-empty">선택한 날짜에 등록된 일정이 없습니다.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlaceholderIcon({ label, large = false }: { label: string; large?: boolean }) {
  return <div className={large ? "eb-icon-placeholder large" : "eb-icon-placeholder"}>{label}</div>;
}

export function ErinBookHome() {
  return (
    <main className="eb-page eb-home">
      <HeaderHero />
      <div className="eb-section eb-two-col">
        <NoticeBoard title="에린북 공지사항" items={erinNotices} href="/erinbook-notice" />
        <NoticeBoard title="마비노기 공지사항" items={mabiNotices} href="/mabi-notice" />
      </div>
      <div className="eb-section eb-two-col eb-mid-row">
        <section className="eb-card eb-horn" id="horn">
          <div className="eb-card-title small">
            <h2>거대한 뿔피리</h2>
            <Link href="/#horn">더보기</Link>
          </div>
          {hornRows.map(([channel, text], index) => (
            <div className="eb-horn-row" key={`${text}-${index}`}>
              <PlaceholderIcon label="" />
              <Badge tone="orange">{channel}</Badge>
              <span>{text}</span>
              <time>오후 {index + 1}:35</time>
            </div>
          ))}
        </section>
        <section className="eb-card eb-guild" id="guild">
          <h2>길드 홍보</h2>
          <div className="eb-guild-banner">
            <strong>에린친화</strong>
            <span>길드 홍보 영역</span>
          </div>
        </section>
      </div>
      <CalendarBlock />
      <div className="eb-section eb-two-col">
        <section className="eb-card eb-cta">
          <div>
            <PlaceholderIcon label="▦" />
            <div>
              <h2>분배 계산기</h2>
              <p>아이템 분배를 간편하게 계산해보세요</p>
            </div>
          </div>
          <Link className="eb-button" href="/share-calc">계산기 열기</Link>
        </section>
        <section className="eb-card eb-cta">
          <h2>버프 계산기</h2>
          <div className="eb-skill-icons">
            {["♪", "♫", "♬", "♭"].map((label) => <PlaceholderIcon key={label} label={label} large />)}
          </div>
          <Link className="eb-button" href="/skill-calc">버프 계산기 열기</Link>
        </section>
      </div>
      <div className="eb-section eb-link-cards" id="contact">
        {[
          ["?", "문의사항", "자주 묻는 질문과 문의하기"],
          ["▣", "이터니티", "최신 개발 소식을 확인해보세요"],
          ["✣", "마비노기", "공식 홈페이지로 이동해보세요"],
        ].map(([icon, title, desc]) => (
          <Link className="eb-card eb-link-card" href={title === "문의사항" ? "mailto:hello@erinbook.example" : title === "마비노기" ? "https://mabinogimobile.nexon.com/" : "/erinbook-notice"} key={title}>
            <PlaceholderIcon label={icon} large />
            <div>
              <h2>{title}</h2>
              <p>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <Footer />
    </main>
  );
}

function PageIntro({ title, desc }: { title: string; desc: string }) {
  return (
    <section className="eb-card eb-intro">
      <h1>{title}</h1>
      <p>{desc}</p>
    </section>
  );
}

function NoticeDetail({ kind }: { kind: "erin" | "mabi" }) {
  const title = kind === "erin" ? "에린북 공지사항" : "마비노기 공지사항";
  const desc = kind === "erin" ? "에린북의 최신 소식과 중요한 안내를 확인해보세요" : "마비노기의 최신 소식과 중요한 안내를 확인해보세요";
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState(0);
  const filteredNotices = noticeList.map((item, index) => ({ item, index })).filter(({ item }) => filter === "전체" || item[0] === filter);
  const activeNotice = noticeList[selected] ?? noticeList[0];
  return (
    <main className="eb-page">
      <HeaderHero />
      <PageIntro title={title} desc={desc} />
      <div className="eb-section eb-filters">
        {["전체", "업데이트", "점검", "이벤트", "안내"].map((item) => (
          <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <section className="eb-section eb-notice-layout">
        <aside className="eb-notice-sidebar">
          <div className="eb-total">총 128건</div>
          {filteredNotices.map(({ item: [badge, tone, text], index }) => (
            <button className={`eb-side-item ${selected === index ? "active" : ""}`} onClick={() => setSelected(index)} key={`${text}-${index}`}>
              <Badge tone={tone}>{badge}</Badge>
              <h3>{text}</h3>
              <time>2026. 05. 20</time>
            </button>
          ))}
          {!filteredNotices.length && <p className="eb-empty-notice">해당 분류의 공지가 없습니다.</p>}
          <div className="eb-pagination"><button aria-label="이전 페이지" disabled>‹</button><strong>1</strong><button aria-label="다음 페이지" disabled>›</button></div>
        </aside>
        <article className="eb-card eb-article">
          <Badge tone={activeNotice[1]}>{activeNotice[0]}</Badge>
          <h2>{activeNotice[2]}</h2>
          <div className="eb-meta">
            <b>작성일</b><span>2026.05.20</span><b>조회수</b><span>5,412</span><b>카테고리</b><span>점검</span>
          </div>
          <hr />
          <div className="eb-body-text">
            <p>안녕하세요. 에린북 운영팀입니다.</p>
            <p>{activeNotice[2]} 내역을 안내해 드립니다.</p>
            <ol><li>기능 추가</li></ol>
            <ul>
              <li>추가된 기능은 후원기능입니다.</li>
              <li>~~~</li>
            </ul>
          </div>
          <hr />
        </article>
      </section>
      <Footer />
    </main>
  );
}

export function ErinNoticePage() {
  return <NoticeDetail kind="erin" />;
}

export function MabiNoticePage() {
  return <NoticeDetail kind="mabi" />;
}

export function SkillCalcPage() {
  const [skillIndex, setSkillIndex] = useState(0);
  const [ranks, setRanks] = useState([8, 8, 4]);
  const [extras, setExtras] = useState<string[]>(["멜로디 쇼크 (3중주)"]);
  const [selectBonuses, setSelectBonuses] = useState([0, 0, 0]);
  const [activePreset, setActivePreset] = useState(-1);
  const { message, show } = useToast();
  const skill = skillDefinitions[skillIndex];
  const rankBonus = useMemo(() => ranks.reduce((sum, rank) => sum + rank * 0.7, 0), [ranks]);
  const extraBonus = useMemo(() => optionEffects.filter(([label]) => extras.includes(label)).reduce((sum, [, value]) => sum + value, 0), [extras]);
  const selectedBonus = selectBonuses.reduce((sum, value) => sum + value, 0);
  const finalEffect = skill.base + rankBonus + extraBonus + selectedBonus;

  function applyPreset(index: number) {
    const presets = [
      { ranks: [8, 8, 8], extras: ["멜로디 쇼크 (3중주)", "음악 전용 2단계 (+4%)", "축복의 연주"], bonuses: [2.5, 2, 1.5] },
      { ranks: [7, 7, 6], extras: ["듀엣 연주", "합주 연주"], bonuses: [1.5, 1, 0] },
      { ranks: [5, 5, 5], extras: ["여신의 축복"], bonuses: [0, 0, 0] },
      { ranks: [8, 6, 7], extras: ["합주 연주", "인내의 연주"], bonuses: [1.5, 0, 1] },
    ];
    const preset = presets[index];
    setRanks(preset.ranks);
    setExtras(preset.extras);
    setSelectBonuses(preset.bonuses);
    setActivePreset(index);
    show("프리셋을 적용했습니다.");
  }

  function resetSkill() {
    setRanks([8, 8, 4]);
    setExtras([]);
    setSelectBonuses([0, 0, 0]);
    setActivePreset(-1);
    show("설정을 초기화했습니다.");
  }

  async function copySkillLink() {
    const url = `${window.location.origin}/skill-calc?skill=${skillIndex}&effect=${finalEffect.toFixed(1)}`;
    await writeClipboard(url);
    show("공유 링크를 복사했습니다.");
  }

  function saveSkill() {
    const saved = JSON.parse(localStorage.getItem("erinbook-skill-settings") ?? "[]") as unknown[];
    localStorage.setItem("erinbook-skill-settings", JSON.stringify([...saved, { skill: skill.name, ranks, extras, finalEffect, savedAt: new Date().toISOString() }].slice(-10)));
    show("현재 세팅을 브라우저에 저장했습니다.");
  }

  return (
    <main className="skill-page">
      <SiteNav active="skill" />
      <section className="skill-hero">
        <div className="skill-hero-bg" />
        <h1>ERINBOOK</h1>
        <p>에린북 가이드 허브</p>
        <SearchBox className="skill-search" placeholder="이런 정보를 찾고 계신가요?" />
      </section>

      <div className="skill-breadcrumb"><Link href="/">홈</Link> <span>›</span> 도구 <span>›</span> 스킬 계산기</div>
      <header className="skill-title-row">
        <div>
          <h1>스킬 계산기</h1>
          <p>음악 스킬의 버프 효과를 계산하고 최적의 세팅을 찾아보세요.</p>
        </div>
        <div className="skill-lyre">♬</div>
      </header>

      <section className="skill-shell">
        <aside className="skill-left">
          <article className="skill-card skill-select">
            <h2>음악 스킬 선택</h2>
            {skillDefinitions.map(({ name, desc, icon }, index) => (
              <button className={index === skillIndex ? "active" : ""} onClick={() => { setSkillIndex(index); show(`${name} 계산기로 변경했습니다.`); }} key={name}>
                <span>{icon}</span>
                <div><strong>{name}</strong><small>{desc}</small></div>
              </button>
            ))}
            <button className="skill-all-button" onClick={() => { document.querySelector(".skill-result-block")?.scrollIntoView({ behavior: "smooth" }); show("선택한 스킬의 결과를 표시합니다."); }}>전체 스킬 비교 ↗</button>
          </article>
          <article className="skill-card skill-help">
            <h2>계산기 사용 방법</h2>
            {["음악 스킬을 선택하세요.", "악기도끼 및 음악 스킬 랭크를 설정하세요.", "악기, 타이틀, 효과 등 추가 옵션을 선택하세요.", "결과를 확인하고 세팅을 저장하거나 공유해 보세요."].map((text, index) => (
              <p key={text}><span>{index + 1}</span>{text}</p>
            ))}
            <button onClick={() => document.querySelector(".skill-calculator")?.scrollIntoView({ behavior: "smooth" })}>상세 가이드 보기 ›</button>
          </article>
          <article className="skill-card skill-warning">
            <h2>주의 사항</h2>
            <ul>
              <li>계산 결과는 게임 내 실제 효과와 다를 수 있습니다.</li>
              <li>일부 효과는 중첩 적용되지 않을 수 있습니다.</li>
              <li>패치에 따라 수치가 변경될 수 있으니 참고용으로 활용해 주세요.</li>
            </ul>
          </article>
          <article className="skill-ad-card">
            <h2>더 좋은 버프를 위해<br />음악 마스터가 되어보세요!</h2>
            <p>에린의 연주가 모임을 더욱 빛나게 합니다.</p>
            <button onClick={() => window.location.assign("/erinbook-notice")}>음악 가이드 보기 ›</button>
          </article>
        </aside>

        <section className="skill-main">
          <article className="skill-card skill-calculator">
            <div className="skill-panel-head">
              <div><span>{skill.icon}</span><h2>{skill.name} 계산기</h2><p>{skill.desc} 효과를 계산합니다.</p></div>
              <button onClick={resetSkill}>↻ 초기화</button>
            </div>
            <section className="skill-form-block">
              <h3>1. 기본 설정</h3>
              {["악기 연주", "노래", `${skill.name} (마스터리)`].map((label, rowIndex) => (
                <div className="skill-rank-row" key={label}>
                  <strong>{label} <small>?</small></strong>
                  <div className="skill-rank-controls">
                    <div className="skill-rank-tabs">
                      {rankLabels.slice(0, 6).map((rank, rankIndex) => (
                        <button className={ranks[rowIndex] === rankIndex ? "active" : ""} onClick={() => setRanks((current) => current.map((value, index) => index === rowIndex ? rankIndex : value))} key={rank}>{rank}</button>
                      ))}
                    </div>
                    <select className="skill-select-line" value={ranks[rowIndex]} onChange={(event) => setRanks((current) => current.map((value, index) => index === rowIndex ? Number(event.target.value) : value))} aria-label={`${label} 랭크`}>
                      {rankLabels.map((rank, rankIndex) => <option value={rankIndex} key={rank}>{rank}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </section>
            <section className="skill-form-block">
              <h3>2. 추가 옵션</h3>
              <div className="skill-option-grid">
                {["악기 보너스", "타이틀", "음식/포션 효과"].map((label, index) => (
                  <label key={label}><span>{label} <small>?</small></span><select value={selectBonuses[index]} onChange={(event) => setSelectBonuses((current) => current.map((value, itemIndex) => itemIndex === index ? Number(event.target.value) : value))}><option value="0">선택하세요</option><option value="1">일반 (+1.0%)</option><option value="1.5">고급 (+1.5%)</option><option value="2.5">최상급 (+2.5%)</option></select></label>
                ))}
              </div>
              <div className="skill-check-grid">
                {optionEffects.map(([item]) => (
                  <label key={item}><input type="checkbox" checked={extras.includes(item)} onChange={() => setExtras((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} />{item}</label>
                ))}
              </div>
            </section>
            <section className="skill-result-block">
              <h3>3. 계산 결과 <small>모든 데이터는 게임 내 패치 기준으로 반영됩니다.</small></h3>
              <div className="skill-result-cards">
                <div className="skill-result-card main"><span>{skill.metric}</span><strong>+{finalEffect.toFixed(1)}%</strong><small>기본 +{(skill.base + rankBonus).toFixed(1)}%</small></div>
                <div className="skill-result-card blank" />
                <div className="skill-result-card blank" />
              </div>
              <div className="skill-detail-grid">
                <div className="skill-detail-box">
                  <h4>상세 내역</h4>
                  <p><span>기본 효과 합계</span><b>+{(skill.base + rankBonus).toFixed(1)}%</b></p>
                  <p><span>추가 효과 합계</span><b>+{(extraBonus + selectedBonus).toFixed(1)}%</b></p>
                  <footer><span>최종 {skill.metric}</span><strong>+{finalEffect.toFixed(1)}%</strong></footer>
                </div>
                <div className="skill-detail-box">
                  <h4>적용된 추가 효과</h4>
                  {extras.length ? extras.slice(0, 3).map((item) => <p key={item}>{item}<b>+{optionEffects.find(([label]) => label === item)?.[1].toFixed(1)}%</b></p>) : <p>선택한 추가 효과가 없습니다.</p>}
                  {selectedBonus > 0 && <p>선택 옵션 합계 <b>+{selectedBonus.toFixed(1)}%</b></p>}
                </div>
              </div>
              <div className="skill-result-note">☆ {skill.name}은 파티 플레이 시 더욱 강력합니다!</div>
              <div className="skill-action-row">
                <button onClick={saveSkill}>▱ 결과 저장</button>
                <button onClick={copySkillLink}>↗ 링크 복사</button>
                <button className="primary" onClick={() => { setSkillIndex((skillIndex + 1) % skillDefinitions.length); document.querySelector(".skill-select")?.scrollIntoView({ behavior: "smooth" }); }}>↻ 다른 스킬 계산하기 ›</button>
              </div>
            </section>
          </article>
        </section>

        <aside className="skill-right">
          <article className="skill-card skill-presets">
            <h2>빠른 프리셋</h2>
            {["공격력 극대화 세팅", "균형 잡힌 세팅", "초보자 추천 세팅", "지속 시간 중시 세팅"].map((preset, index) => (
              <button className={index === activePreset ? "active" : ""} onClick={() => applyPreset(index)} key={preset}><span>{preset}<small>+{index === 0 ? "42.6% / 150초" : index === 1 ? "35.2% / 120초" : index === 2 ? "28.1% / 90초" : "31.8% / 180초"}</small></span>›</button>
            ))}
            <button className="manage" onClick={() => { localStorage.removeItem("erinbook-skill-settings"); show("저장된 사용자 세팅을 정리했습니다."); }}>내 프리셋 관리 ›</button>
          </article>
          <article className="skill-card skill-saved">
            <div className="skill-side-head"><h2>저장된 세팅</h2><button onClick={() => show("저장된 세팅을 모두 표시하고 있습니다.")}>전체 보기 ›</button></div>
            {["주간 보스용 세팅", "레이드 파티 세팅", "사냥용 세팅"].map((setting, index) => (
              <button className="skill-saved-row" onClick={() => applyPreset(index)} key={setting}><span>♬</span><div><strong>{setting}</strong><small>2026.05.13</small></div><b>›</b></button>
            ))}
          </article>
          <article className="skill-card skill-tips">
            <h2>계산 팁</h2>
            {["콤보 연주를 사용하면 추가 효과를 받을 수 있어요.", "파티 내 다른 연주자와 중복되지 않는 효과를 선택하세요.", "음식, 타이틀, 전용 효과를 함께 사용하면 더 강력해져요.", "지속 시간과 쿨타임을 고려해 최적의 타이밍에 사용하세요."].map((tip) => (
              <p key={tip}><span>✧</span>{tip}</p>
            ))}
          </article>
          <article className="skill-card skill-guides">
            <div className="skill-side-head"><h2>관련 가이드</h2><Link href="/erinbook-notice">전체 보기 ›</Link></div>
            {["음악 스킬 완벽 가이드", "악기별 성능 비교", "콤보 연주 완벽 가이드", "타이틀 및 효과 정리"].map((guide) => (
              <Link href="/erinbook-notice" key={guide}><span>♬</span><strong>{guide}</strong><small>기초부터 심화까지</small></Link>
            ))}
          </article>
        </aside>
      </section>

      <section className="skill-tools">
        <h2>관련 도구</h2>
        <div>
          {["스탯 계산기", "데미지 계산기", "타이틀 검색", "효과 검색", "아이템 검색"].map((tool, index) => (
            <button className="skill-tool-card" onClick={() => index < 2 ? window.location.assign("/share-calc") : show(`${tool} 기능은 다음 업데이트에서 제공됩니다.`)} key={tool}><span>▧</span><div><strong>{tool}</strong><small>계산에 필요한 정보를 확인해보세요.</small></div><b>→</b></button>
          ))}
        </div>
      </section>
      <Footer />
      <Toast message={message} />
    </main>
  );
}

export function ShareCalcPage() {
  const [title, setTitle] = useState("");
  const [saleAmount, setSaleAmount] = useState(8750000);
  const [people, setPeople] = useState(8);
  const [feeMode, setFeeMode] = useState<"percent" | "fixed">("percent");
  const [feeValue, setFeeValue] = useState(5);
  const [deduction, setDeduction] = useState(50000);
  const [vat, setVat] = useState(false);
  const [rounding, setRounding] = useState<"floor" | "round" | "ceil">("round");
  const [distribution, setDistribution] = useState<"equal" | "custom">("equal");
  const [firstRatio, setFirstRatio] = useState(20);
  const { message, show } = useToast();
  const feeAmount = feeMode === "percent" ? saleAmount * feeValue / 100 : feeValue;
  const afterFee = Math.max(0, saleAmount - feeAmount - deduction);
  const vatAmount = vat ? afterFee * 0.1 : 0;
  const netAmount = Math.max(0, afterFee - vatAmount);
  const roundValue = rounding === "floor" ? Math.floor : rounding === "ceil" ? Math.ceil : Math.round;
  const equalShare = roundValue(netAmount / people);
  const firstShare = people === 1 ? roundValue(netAmount) : roundValue(netAmount * firstRatio / 100);
  const remainingShare = people === 1 ? firstShare : roundValue((netAmount - firstShare) / (people - 1));
  const personAmounts = Array.from({ length: people }, (_, index) => distribution === "equal" ? equalShare : index === 0 ? firstShare : remainingShare);
  const perPerson = personAmounts[0];
  const distributedTotal = personAmounts.reduce((sum, value) => sum + value, 0);
  const totalDeductions = feeAmount + deduction + vatAmount;

  function resetShare() {
    setTitle("");
    setSaleAmount(8750000);
    setPeople(8);
    setFeeMode("percent");
    setFeeValue(5);
    setDeduction(50000);
    setVat(false);
    setRounding("round");
    setDistribution("equal");
    setFirstRatio(20);
    show("입력값을 초기화했습니다.");
  }

  function resultText() {
    return `${title || "분배 계산 결과"}\n총 판매 금액: ${formatNumber(saleAmount)} 골드\n수수료 및 공제: ${formatNumber(totalDeductions)} 골드\n실수령 총액: ${formatNumber(netAmount)} 골드\n${people}인 분배: 1인당 ${formatNumber(perPerson)} 골드`;
  }

  async function copyResult(value = resultText()) {
    await writeClipboard(value);
    show("계산 결과를 복사했습니다.");
  }

  async function shareUrl() {
    await writeClipboard(`${window.location.origin}/share-calc`);
    show("분배 계산기 URL을 복사했습니다.");
  }

  function downloadResultImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ff7800";
    context.font = "bold 42px Arial";
    context.fillText("ERINBOOK", 64, 82);
    context.fillStyle = "#111827";
    context.font = "bold 30px Arial";
    context.fillText(title || "분배 계산 결과", 64, 142);
    context.font = "24px Arial";
    resultText().split("\n").slice(1).forEach((line, index) => context.fillText(line, 64, 214 + index * 58));
    const link = document.createElement("a");
    link.download = "erinbook-share-result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    show("결과 이미지를 저장했습니다.");
  }

  return (
    <main className="share-page">
      <SiteNav active="share" />

      <section className="share-hero">
        <div className="share-hero-bg" />
        <h1>분배 계산기</h1>
        <p>아이템 판매, 경매, 파티 분배를 쉽게 계산해보세요.</p>
        <div className="share-breadcrumb"><Link href="/">홈</Link> <span>›</span> 분배 계산기</div>
      </section>

      <section className="share-shell">
        <aside className="share-left">
          <div className="share-empty-card">
            <div className="share-empty-head">
              <strong>최근 계산 기록</strong>
              <span>전체 보기 ›</span>
            </div>
          </div>
          <div className="share-empty-card mode">
            <strong>분배 계산 모드</strong>
          </div>
          <div className="share-empty-banner" />
        </aside>

        <section className="share-main">
          <article className="share-panel">
            <div className="share-step-title"><span>1</span><h2>기본 정보 입력</h2></div>
            <label className="share-field">
              <span>계산 제목 (선택) <em>{title.length} / 30</em></span>
              <input value={title} maxLength={30} onChange={(event) => setTitle(event.target.value)} placeholder="예) 글라스 기브넨 판매 분배" />
            </label>
            <label className="share-field">
              <span>총 판매 금액</span>
              <div className="share-input-with-unit"><b>◎</b><input inputMode="numeric" value={formatNumber(saleAmount)} onChange={(event) => setSaleAmount(parseNumber(event.target.value))} aria-label="총 판매 금액" /><span>골드</span></div>
            </label>
            <label className="share-field">
              <span>분배 인원 수</span>
              <div className="share-stepper"><button onClick={() => setPeople((value) => Math.max(1, value - 1))} aria-label="인원 감소">-</button><strong>{people}</strong><button onClick={() => setPeople((value) => Math.min(100, value + 1))} aria-label="인원 증가">+</button></div>
            </label>
          </article>

          <article className="share-panel">
            <div className="share-step-title"><span>2</span><h2>수수료 및 공제 설정</h2></div>
            <div className="share-form-row">
              <span>거래 수수료</span>
              <button className={`share-choice ${feeMode === "percent" ? "active" : ""}`} onClick={() => { setFeeMode("percent"); setFeeValue(5); }}>퍼센트(%)</button>
              <button className={`share-choice ${feeMode === "fixed" ? "active" : ""}`} onClick={() => { setFeeMode("fixed"); setFeeValue(50000); }}>고정 금액</button>
              <label className="share-percent"><input inputMode="decimal" value={feeValue} onChange={(event) => setFeeValue(Math.max(0, parseNumber(event.target.value)))} aria-label="수수료" /><b>{feeMode === "percent" ? "%" : "골드"}</b></label>
            </div>
            <div className="share-deduction">
              <span>수리비</span>
              <input inputMode="numeric" value={formatNumber(deduction)} onChange={(event) => setDeduction(parseNumber(event.target.value))} aria-label="수리비" />
              <small>골드</small>
              <button onClick={() => setDeduction(0)} aria-label="수리비 삭제">×</button>
            </div>
          </article>

          <article className="share-panel">
            <div className="share-step-title"><span>3</span><h2>고급 설정 <small>(선택)</small></h2></div>
            <div className="share-toggle-row">
              <div><strong>부가세(VAT) 포함</strong><p>부가세 10%를 별도로 계산합니다.</p></div>
              <button className={`share-toggle ${vat ? "active" : ""}`} onClick={() => setVat((value) => !value)} aria-pressed={vat} aria-label="부가세 포함" />
            </div>
            <div className="share-radio-grid">
              <label><input type="radio" name="rounding" checked={rounding === "floor"} onChange={() => setRounding("floor")} /> 버림</label>
              <label><input type="radio" name="rounding" checked={rounding === "round"} onChange={() => setRounding("round")} /> 반올림</label>
              <label><input type="radio" name="rounding" checked={rounding === "ceil"} onChange={() => setRounding("ceil")} /> 올림</label>
              <label><input type="radio" name="distribution" checked={distribution === "equal"} onChange={() => setDistribution("equal")} /> 1/N 균등 분배</label>
              <label><input type="radio" name="distribution" checked={distribution === "custom"} onChange={() => setDistribution("custom")} /> 지정 비율 분배</label>
              {distribution === "custom" && <label className="share-ratio-input">1번 비율 <input type="number" min="1" max="99" value={firstRatio} onChange={(event) => setFirstRatio(Math.min(99, Math.max(1, Number(event.target.value) || 1)))} />%</label>}
            </div>
            <div className="share-button-row">
              <button className="share-reset" onClick={resetShare}>↻ 초기화</button>
              <button className="share-calculate" onClick={() => { document.querySelector(".share-results")?.scrollIntoView({ behavior: "smooth" }); show("계산 결과를 갱신했습니다."); }}>▣ 계산하기</button>
            </div>
          </article>

          <article className="share-panel share-results">
            <h2>계산 결과</h2>
            <div className="share-summary-grid">
              {[
                ["총 판매 금액", formatNumber(saleAmount), "골드", "neutral"],
                ["총 수수료/공제", formatNumber(totalDeductions), "골드", "pink"],
                ["실수령 총액", formatNumber(netAmount), "골드", "green"],
                ["1인당 분배 금액", formatNumber(perPerson), "골드", "blue"],
              ].map(([label, value, unit, tone]) => (
                <div className={`share-summary ${tone}`} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{unit}</small>
                </div>
              ))}
            </div>
            <div className="share-result-columns">
              <div className="share-detail-card">
                <h3>상세 내역</h3>
                {[
                  ["총 판매 금액", `${formatNumber(saleAmount)} 골드`],
                  [feeMode === "percent" ? `거래 수수료 (${feeValue.toFixed(2)}%)` : "고정 수수료", `-${formatNumber(feeAmount)} 골드`],
                  ["추가 공제 (1건)", `-${formatNumber(deduction)} 골드`],
                  ["부가세", `-${formatNumber(vatAmount)} 골드`],
                ].map(([label, value]) => <p key={label}><span>{label}</span><b>{value}</b></p>)}
                <footer><span>실수령 총액</span><strong>{formatNumber(netAmount)} 골드</strong></footer>
              </div>
              <div className="share-detail-card">
                <h3>인원별 분배 예시 <button onClick={() => copyResult(personAmounts.map((amount, index) => `${index + 1}번: ${formatNumber(amount)} 골드`).join("\n"))}>복사</button></h3>
                {personAmounts.slice(0, 8).map((amount, index) => <p key={index}><span>{index + 1}번</span><b>{formatNumber(amount)} 골드</b></p>)}
                {people > 8 && <p><span>외 {people - 8}명</span><b>동일 금액</b></p>}
                <footer><span>합계</span><strong>{formatNumber(distributedTotal)} 골드</strong></footer>
              </div>
            </div>
            <div className="share-export-row">
              <button onClick={() => copyResult()}>▣ 결과 복사</button>
              <button onClick={shareUrl}>↗ URL 공유</button>
              <button onClick={downloadResultImage}>▤ 이미지로 저장</button>
            </div>
          </article>
        </section>

        <aside className="share-right">
          <article className="share-side-card guide">
            <div className="share-side-head"><h2>사용 가이드</h2><Link href="/erinbook-notice">더보기 ›</Link></div>
            {[["1", "총 판매 금액을 입력하세요.", "아이템 판매 후 받은 총 금액을 입력합니다."], ["3", "수수료 및 공제 항목을 설정하세요.", "거래 수수료와 추가 공제 항목을 입력합니다."], ["3", "인원 수를 설정하세요.", "분배할 인원 수를 입력합니다."], ["4", "계산하기 버튼을 눌러 결과를 확인하세요.", "실수령액과 1인당 분배 금액을 확인합니다."]].map(([num, title, desc]) => (
              <div className="share-guide-row" key={title}><span>{num}</span><div><strong>{title}</strong><p>{desc}</p></div></div>
            ))}
          </article>
          <article className="share-side-card formula">
            <h2>수식 안내</h2>
            <div><strong>실수령 총액</strong><p>= 총 판매 금액<br />- (총 판매 금액 × 수수료율)<br />- 추가 공제 금액 합계<br />- (공제 후 금액 × 부가세율)</p></div>
            <div><strong>1인당 분배 금액</strong><p>= 실수령 총액 ÷ 인원 수</p></div>
          </article>
          <article className="share-side-card presets">
            <div className="share-side-head"><h2>자주 사용하는 수수료 프리셋</h2><button onClick={() => { localStorage.removeItem("erinbook-share-preset"); show("사용자 프리셋을 삭제했습니다."); }}>관리</button></div>
            {sharePresets.map((preset) => <div className="share-preset" key={preset}><div><strong>{preset}</strong><span>수수료 {preset.replace("거래 수수료 ", "")}</span></div><button onClick={() => { setFeeMode("percent"); setFeeValue(preset === "수수료 없음" ? 0 : parseNumber(preset)); show(`${preset}을 적용했습니다.`); }}>사용</button></div>)}
            <button className="share-new-preset" onClick={() => { localStorage.setItem("erinbook-share-preset", JSON.stringify({ feeMode, feeValue })); show("현재 수수료 설정을 프리셋으로 저장했습니다."); }}>＋ 새 프리셋 추가</button>
          </article>
          <article className="share-calendar-ad">
            <h2>이벤트 캘린더 <span>2026.05</span></h2>
            <p>주요 이벤트 일정을 확인하고 놓치지 마세요!</p>
            <button onClick={() => window.location.assign("/#calendar")}>이벤트 캘린더 보기</button>
          </article>
        </aside>
      </section>

      <Footer />
      <Toast message={message} />
    </main>
  );
}

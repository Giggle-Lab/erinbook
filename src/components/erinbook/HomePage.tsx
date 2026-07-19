"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { Badge, Footer, HeaderHero, PlaceholderIcon } from "./shared";
import type { BadgeTone } from "./shared";

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

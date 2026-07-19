"use client";

import { useState } from "react";
import { Badge, Footer, HeaderHero } from "./shared";

const noticeList = [
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
  ["이벤트", "pink", "에린북 이벤트 안내"],
  ["점검", "orange", "5월 20일 (화) 점검 안내"],
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
  ["업데이트", "green", "5월 20일 (화) 업데이트 안내"],
] as const;


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


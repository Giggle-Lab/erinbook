import Link from "next/link";

type BadgeTone = "orange" | "green" | "blue" | "pink" | "purple" | "outline";

const navItems = [
  { label: "이벤트 캘린더", href: "/" },
  { label: "길드 홍보", href: "/" },
  { label: "문의사항", href: "/" },
  { label: "분배 계산기", href: "/share-calc" },
  { label: "버프 계산기", href: "/skill-calc" },
  { label: "거대한 뿔피리", href: "/" },
  { label: "로그인", href: "/" },
];

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

const skillItems = [
  ["전장의 서곡", "공격력 증가 버프", "07"],
  ["비바체", "공격속도 증가 버프", "09"],
  ["풍년가", "풍년 버프", "08"],
  ["인내의 노래", "방어력 증가 버프", "06"],
  ["행진곡", "이동속도 증가 버프", "10"],
];

function Badge({ children, tone = "orange" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={`eb-badge eb-badge-${tone}`}>{children}</span>;
}

function HeaderHero() {
  return (
    <header className="eb-top">
      <div className="eb-logo-row">
        <Link href="/">ERINBOOK</Link>
      </div>
      <nav className="eb-nav" aria-label="primary">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <section className="eb-hero">
        <div className="eb-hero-art" aria-hidden />
        <h1>ERINBOOK</h1>
        <p>
          마비노기의 <strong>모든것</strong>
        </p>
        <div className="eb-search">
          <span>아이템을 검색해보세요</span>
          <span className="eb-search-icon">⌕</span>
        </div>
      </section>
    </header>
  );
}

function Footer() {
  return (
    <footer className="eb-footer">
      <strong>ERINBOOK</strong>
      <div className="eb-footer-links">
        <span>이용약관</span>
        <span>개인정보 처리방침</span>
      </div>
      <div className="eb-socials" aria-label="social links">
        <span>☯</span>
        <span>☯</span>
        <span>☯</span>
      </div>
    </footer>
  );
}

function NoticeBoard({
  title,
  items,
}: {
  title: string;
  items: readonly (readonly [string, BadgeTone, string, string])[];
}) {
  return (
    <section className="eb-card eb-board">
      <div className="eb-card-title">
        <h2>{title}</h2>
        <span>더보기</span>
      </div>
      <div className="eb-notice-list">
        {items.map(([badge, tone, text, date]) => (
          <div className="eb-notice-row" key={`${title}-${text}`}>
            <div>
              <Badge tone={tone}>{badge}</Badge>
              <b>{text}</b>
            </div>
            <time>{date}</time>
          </div>
        ))}
      </div>
    </section>
  );
}

function CalendarBlock() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const nums = [26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6];
  return (
    <section className="eb-card eb-calendar-card">
      <h2>이벤트 캘린더</h2>
      <div className="eb-calendar-wrap">
        <div className="eb-calendar">
          <div className="eb-month">&lt; <strong>2026. 05</strong> &gt;</div>
          <div className="eb-weekdays">{days.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="eb-dates">
            {nums.map((n, i) => (
              <span key={`${n}-${i}`} className={n === 25 && i > 20 ? "active" : ""}>
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="eb-events">
          {["서버 점검", "에린북 공유 이벤트", "서버 점검"].map((event, index) => (
            <div className="eb-event-row" key={`${event}-${index}`}>
              <time>05.12 (월)</time>
              <div>
                <b>{event}</b>
                <span>{index === 1 ? "시즌2 어쩌구 저쩌구" : "오전 08:00 ~ 오전 10:00"}</span>
              </div>
              <Badge tone={index === 1 ? "pink" : index === 2 ? "orange" : "blue"}>{index === 1 ? "이벤트" : index === 2 ? "공지" : "점검"}</Badge>
            </div>
          ))}
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
        <NoticeBoard title="에린북 공지사항" items={erinNotices} />
        <NoticeBoard title="마비노기 공지사항" items={mabiNotices} />
      </div>
      <div className="eb-section eb-two-col eb-mid-row">
        <section className="eb-card eb-horn">
          <div className="eb-card-title small">
            <h2>거대한 뿔피리</h2>
            <span>더보기</span>
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
        <section className="eb-card eb-guild">
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
      <div className="eb-section eb-link-cards">
        {[
          ["?", "문의사항", "자주 묻는 질문과 문의하기"],
          ["▣", "이터니티", "최신 개발 소식을 확인해보세요"],
          ["✣", "마비노기", "공식 홈페이지로 이동해보세요"],
        ].map(([icon, title, desc]) => (
          <section className="eb-card eb-link-card" key={title}>
            <PlaceholderIcon label={icon} large />
            <div>
              <h2>{title}</h2>
              <p>{desc}</p>
            </div>
          </section>
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
  return (
    <main className="eb-page">
      <HeaderHero />
      <PageIntro title={title} desc={desc} />
      <div className="eb-section eb-filters">
        {["전체", "업데이트", "점검", "이벤트", "안내"].map((filter, index) => (
          <Badge key={filter} tone={index === 0 ? "orange" : "outline"}>{filter}</Badge>
        ))}
      </div>
      <section className="eb-section eb-notice-layout">
        <aside className="eb-notice-sidebar">
          <div className="eb-total">총 128건</div>
          {noticeList.map(([badge, tone, text], index) => (
            <article className="eb-side-item" key={`${text}-${index}`}>
              <Badge tone={tone}>{badge}</Badge>
              <h3>{text}</h3>
              <time>2026. 05. 20</time>
            </article>
          ))}
          <div className="eb-pagination">페이지네이션</div>
        </aside>
        <article className="eb-card eb-article">
          <Badge tone="green">업데이트</Badge>
          <h2>5/20(화) 업데이트 안내</h2>
          <div className="eb-meta">
            <b>작성일</b><span>2026.05.20</span><b>조회수</b><span>5,412</span><b>카테고리</b><span>점검</span>
          </div>
          <hr />
          <div className="eb-body-text">
            <p>안녕하세요. 에린북 운영팀입니다.</p>
            <p>5/20(화) 업데이트 내역을 안내해 드립니다.</p>
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
  return (
    <main className="eb-page eb-short-page">
      <HeaderHero />
      <section className="eb-card eb-calc-intro">
        <div>
          <h1>스킬 계산기</h1>
          <p>음악 스킬의 버프효과를 확인하고, 효율을 확인해보세요</p>
        </div>
        <PlaceholderIcon label="" large />
      </section>
      <section className="eb-section eb-calc-layout">
        <aside className="eb-skill-list">
          <h2>음악 스킬 선택</h2>
          {skillItems.map(([name, desc, num]) => (
            <article className="eb-skill-item" key={name}>
              <PlaceholderIcon label={num} large />
              <div>
                <h3>{name}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </aside>
        <article className="eb-card eb-calc-panel">
          <div className="eb-panel-head">
            <h2>전장의 서곡 계산기</h2>
            <button>초기화</button>
          </div>
          {["기본 설정", "추가 옵션", "계산 결과"].map((title) => (
            <div className="eb-empty-section" key={title}>
              <h3>{title}</h3>
            </div>
          ))}
        </article>
      </section>
      <Footer />
    </main>
  );
}

export function ShareCalcPage() {
  return (
    <main className="eb-page">
      <HeaderHero />
      <PageIntro title="마비노기 공지사항" desc="마비노기의 최신 소식과 중요한 안내를 확인해보세요" />
      <div className="eb-section eb-filters">
        {["전체", "업데이트", "점검", "이벤트", "안내"].map((filter, index) => (
          <Badge key={filter} tone={index === 0 ? "orange" : "outline"}>{filter}</Badge>
        ))}
      </div>
      <section className="eb-section eb-notice-layout">
        <aside className="eb-notice-sidebar">
          <div className="eb-total">총 128건</div>
          {noticeList.map(([badge, tone, text], index) => (
            <article className="eb-side-item" key={`${text}-${index}`}>
              <Badge tone={tone}>{badge}</Badge>
              <h3>{text}</h3>
              <time>2026. 05. 20</time>
            </article>
          ))}
          <div className="eb-pagination">페이지네이션</div>
        </aside>
        <article className="eb-card eb-article">
          <Badge tone="green">업데이트</Badge>
          <h2>5/20(화) 업데이트 안내</h2>
          <div className="eb-meta">
            <b>작성일</b><span>2026.05.20</span><b>조회수</b><span>5,412</span><b>카테고리</b><span>점검</span>
          </div>
          <hr />
          <div className="eb-body-text">
            <p>안녕하세요. 에린북 운영팀입니다.</p>
            <p>5/20(화) 업데이트 내역을 안내해 드립니다.</p>
            <p>기능 추가</p>
            <p>추가된 기능은 후원기능입니다. ~~~</p>
          </div>
          <hr />
        </article>
      </section>
      <Footer />
    </main>
  );
}

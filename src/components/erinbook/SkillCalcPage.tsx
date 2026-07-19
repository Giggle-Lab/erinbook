"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Footer, SearchBox, SiteNav, Toast, useToast, writeClipboard } from "./shared";

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

type SkillDefinition = (typeof skillDefinitions)[number];

function SkillSelector({ selectedIndex, onSelect, onCompare }: {
  selectedIndex: number;
  onSelect: (index: number, skill: SkillDefinition) => void;
  onCompare: () => void;
}) {
  return (
    <article className="skill-card skill-select">
      <h2>음악 스킬 선택</h2>
      {skillDefinitions.map((skill, index) => (
        <button className={index === selectedIndex ? "active" : ""} onClick={() => onSelect(index, skill)} key={skill.name}>
          <span>{skill.icon}</span>
          <div><strong>{skill.name}</strong><small>{skill.desc}</small></div>
        </button>
      ))}
      <button className="skill-all-button" onClick={onCompare}>전체 스킬 비교 ↗</button>
    </article>
  );
}

function RankSettings({ skillName, ranks, onRankChange }: {
  skillName: string;
  ranks: number[];
  onRankChange: (rowIndex: number, rankIndex: number) => void;
}) {
  return (
    <section className="skill-form-block">
      <h3>1. 기본 설정</h3>
      {["악기 연주", "노래", `${skillName} (마스터리)`].map((label, rowIndex) => (
        <div className="skill-rank-row" key={label}>
          <strong>{label} <small>?</small></strong>
          <div className="skill-rank-controls">
            <div className="skill-rank-tabs">
              {rankLabels.slice(0, 6).map((rank, rankIndex) => (
                <button className={ranks[rowIndex] === rankIndex ? "active" : ""} onClick={() => onRankChange(rowIndex, rankIndex)} key={rank}>{rank}</button>
              ))}
            </div>
            <select className="skill-select-line" value={ranks[rowIndex]} onChange={(event) => onRankChange(rowIndex, Number(event.target.value))} aria-label={`${label} 랭크`}>
              {rankLabels.map((rank, rankIndex) => <option value={rankIndex} key={rank}>{rank}</option>)}
            </select>
          </div>
        </div>
      ))}
    </section>
  );
}

function AdditionalOptions({ bonuses, extras, onBonusChange, onToggleExtra }: {
  bonuses: number[];
  extras: string[];
  onBonusChange: (index: number, value: number) => void;
  onToggleExtra: (item: string) => void;
}) {
  return (
    <section className="skill-form-block">
      <h3>2. 추가 옵션</h3>
      <div className="skill-option-grid">
        {["악기 보너스", "타이틀", "음식/포션 효과"].map((label, index) => (
          <label key={label}><span>{label} <small>?</small></span><select value={bonuses[index]} onChange={(event) => onBonusChange(index, Number(event.target.value))}><option value="0">선택하세요</option><option value="1">일반 (+1.0%)</option><option value="1.5">고급 (+1.5%)</option><option value="2.5">최상급 (+2.5%)</option></select></label>
        ))}
      </div>
      <div className="skill-check-grid">
        {optionEffects.map(([item]) => (
          <label key={item}><input type="checkbox" checked={extras.includes(item)} onChange={() => onToggleExtra(item)} />{item}</label>
        ))}
      </div>
    </section>
  );
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
          <SkillSelector
            selectedIndex={skillIndex}
            onSelect={(index, selectedSkill) => { setSkillIndex(index); show(`${selectedSkill.name} 계산기로 변경했습니다.`); }}
            onCompare={() => { document.querySelector(".skill-result-block")?.scrollIntoView({ behavior: "smooth" }); show("선택한 스킬의 결과를 표시합니다."); }}
          />
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
            <RankSettings
              skillName={skill.name}
              ranks={ranks}
              onRankChange={(rowIndex, rankIndex) => setRanks((current) => current.map((value, index) => index === rowIndex ? rankIndex : value))}
            />
            <AdditionalOptions
              bonuses={selectBonuses}
              extras={extras}
              onBonusChange={(index, value) => setSelectBonuses((current) => current.map((bonus, bonusIndex) => bonusIndex === index ? value : bonus))}
              onToggleExtra={(item) => setExtras((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}
            />
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

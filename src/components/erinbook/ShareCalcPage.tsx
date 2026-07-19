"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer, SiteNav, Toast, formatNumber, parseNumber, useToast, writeClipboard } from "./shared";

const sharePresets = ["거래 수수료 5%", "거래 수수료 3%", "거래 수수료 8%", "수수료 없음"];

type FeeMode = "percent" | "fixed";
type RoundingMode = "floor" | "round" | "ceil";
type DistributionMode = "equal" | "custom";

function BasicInfoPanel({ title, saleAmount, people, onTitleChange, onSaleAmountChange, onPeopleChange }: {
  title: string;
  saleAmount: number;
  people: number;
  onTitleChange: (value: string) => void;
  onSaleAmountChange: (value: number) => void;
  onPeopleChange: (value: number) => void;
}) {
  return (
    <article className="share-panel">
      <div className="share-step-title"><span>1</span><h2>기본 정보 입력</h2></div>
      <label className="share-field">
        <span>계산 제목 (선택) <em>{title.length} / 30</em></span>
        <input value={title} maxLength={30} onChange={(event) => onTitleChange(event.target.value)} placeholder="예) 글라스 기브넨 판매 분배" />
      </label>
      <label className="share-field">
        <span>총 판매 금액</span>
        <div className="share-input-with-unit"><b>◎</b><input inputMode="numeric" value={formatNumber(saleAmount)} onChange={(event) => onSaleAmountChange(parseNumber(event.target.value))} aria-label="총 판매 금액" /><span>골드</span></div>
      </label>
      <label className="share-field">
        <span>분배 인원 수</span>
        <div className="share-stepper"><button onClick={() => onPeopleChange(Math.max(1, people - 1))} aria-label="인원 감소">-</button><strong>{people}</strong><button onClick={() => onPeopleChange(Math.min(100, people + 1))} aria-label="인원 증가">+</button></div>
      </label>
    </article>
  );
}

function FeeSettingsPanel({ feeMode, feeValue, deduction, onFeeModeChange, onFeeValueChange, onDeductionChange }: {
  feeMode: FeeMode;
  feeValue: number;
  deduction: number;
  onFeeModeChange: (mode: FeeMode, defaultValue: number) => void;
  onFeeValueChange: (value: number) => void;
  onDeductionChange: (value: number) => void;
}) {
  return (
    <article className="share-panel">
      <div className="share-step-title"><span>2</span><h2>수수료 및 공제 설정</h2></div>
      <div className="share-form-row">
        <span>거래 수수료</span>
        <button className={`share-choice ${feeMode === "percent" ? "active" : ""}`} onClick={() => onFeeModeChange("percent", 5)}>퍼센트(%)</button>
        <button className={`share-choice ${feeMode === "fixed" ? "active" : ""}`} onClick={() => onFeeModeChange("fixed", 50000)}>고정 금액</button>
        <label className="share-percent"><input inputMode="decimal" value={feeValue} onChange={(event) => onFeeValueChange(Math.max(0, parseNumber(event.target.value)))} aria-label="수수료" /><b>{feeMode === "percent" ? "%" : "골드"}</b></label>
      </div>
      <div className="share-deduction">
        <span>수리비</span>
        <input inputMode="numeric" value={formatNumber(deduction)} onChange={(event) => onDeductionChange(parseNumber(event.target.value))} aria-label="수리비" />
        <small>골드</small>
        <button onClick={() => onDeductionChange(0)} aria-label="수리비 삭제">×</button>
      </div>
    </article>
  );
}

function AdvancedSettingsPanel({ vat, rounding, distribution, firstRatio, onVatChange, onRoundingChange, onDistributionChange, onFirstRatioChange, onReset, onCalculate }: {
  vat: boolean;
  rounding: RoundingMode;
  distribution: DistributionMode;
  firstRatio: number;
  onVatChange: (value: boolean) => void;
  onRoundingChange: (value: RoundingMode) => void;
  onDistributionChange: (value: DistributionMode) => void;
  onFirstRatioChange: (value: number) => void;
  onReset: () => void;
  onCalculate: () => void;
}) {
  return (
    <article className="share-panel">
      <div className="share-step-title"><span>3</span><h2>고급 설정 <small>(선택)</small></h2></div>
      <div className="share-toggle-row">
        <div><strong>부가세(VAT) 포함</strong><p>부가세 10%를 별도로 계산합니다.</p></div>
        <button className={`share-toggle ${vat ? "active" : ""}`} onClick={() => onVatChange(!vat)} aria-pressed={vat} aria-label="부가세 포함" />
      </div>
      <div className="share-radio-grid">
        <label><input type="radio" name="rounding" checked={rounding === "floor"} onChange={() => onRoundingChange("floor")} /> 버림</label>
        <label><input type="radio" name="rounding" checked={rounding === "round"} onChange={() => onRoundingChange("round")} /> 반올림</label>
        <label><input type="radio" name="rounding" checked={rounding === "ceil"} onChange={() => onRoundingChange("ceil")} /> 올림</label>
        <label><input type="radio" name="distribution" checked={distribution === "equal"} onChange={() => onDistributionChange("equal")} /> 1/N 균등 분배</label>
        <label><input type="radio" name="distribution" checked={distribution === "custom"} onChange={() => onDistributionChange("custom")} /> 지정 비율 분배</label>
        {distribution === "custom" && <label className="share-ratio-input">1번 비율 <input type="number" min="1" max="99" value={firstRatio} onChange={(event) => onFirstRatioChange(Math.min(99, Math.max(1, Number(event.target.value) || 1)))} />%</label>}
      </div>
      <div className="share-button-row">
        <button className="share-reset" onClick={onReset}>↻ 초기화</button>
        <button className="share-calculate" onClick={onCalculate}>▣ 계산하기</button>
      </div>
    </article>
  );
}

export function ShareCalcPage() {
  const [title, setTitle] = useState("");
  const [saleAmount, setSaleAmount] = useState(8750000);
  const [people, setPeople] = useState(8);
  const [feeMode, setFeeMode] = useState<FeeMode>("percent");
  const [feeValue, setFeeValue] = useState(5);
  const [deduction, setDeduction] = useState(50000);
  const [vat, setVat] = useState(false);
  const [rounding, setRounding] = useState<RoundingMode>("round");
  const [distribution, setDistribution] = useState<DistributionMode>("equal");
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
          <BasicInfoPanel title={title} saleAmount={saleAmount} people={people} onTitleChange={setTitle} onSaleAmountChange={setSaleAmount} onPeopleChange={setPeople} />
          <FeeSettingsPanel
            feeMode={feeMode}
            feeValue={feeValue}
            deduction={deduction}
            onFeeModeChange={(mode, defaultValue) => { setFeeMode(mode); setFeeValue(defaultValue); }}
            onFeeValueChange={setFeeValue}
            onDeductionChange={setDeduction}
          />
          <AdvancedSettingsPanel
            vat={vat}
            rounding={rounding}
            distribution={distribution}
            firstRatio={firstRatio}
            onVatChange={setVat}
            onRoundingChange={setRounding}
            onDistributionChange={setDistribution}
            onFirstRatioChange={setFirstRatio}
            onReset={resetShare}
            onCalculate={() => { document.querySelector(".share-results")?.scrollIntoView({ behavior: "smooth" }); show("계산 결과를 갱신했습니다."); }}
          />

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

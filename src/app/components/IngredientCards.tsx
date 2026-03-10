"use client";

import { useRef, useState } from "react";
import {
  useScrollAnimation,
  useProgressiveReveal,
} from "./scroll-hooks";

/* ─────────────────────────────────────────────────
   S4 — IngredientCards
   따뜻한 배경의 핵심 원료 딥다이브 카드 섹션.

   Design approach:
   - Warm default background (no section-* class)
   - 3 feature-rich ingredient cards
   - Each card: illustration area + title + body + expandable detail
   - Tags for quick scanning
   - Progressive reveal on scroll
   ───────────────────────────────────────────────── */

/* ── Ingredient data ── */
const INGREDIENTS = [
  {
    id: "duoligo",
    icon: (
      <svg
        viewBox="0 0 56 56"
        fill="none"
        className="w-14 h-14"
        aria-hidden="true"
      >
        {/* Simplified gut/probiotic icon */}
        <circle cx="28" cy="28" r="26" fill="var(--color-elderberry-50)" />
        <circle cx="20" cy="22" r="4" fill="var(--color-elderberry-300)" opacity="0.7" />
        <circle cx="34" cy="20" r="3" fill="var(--color-elderberry-400)" opacity="0.6" />
        <circle cx="28" cy="32" r="5" fill="var(--color-elderberry)" opacity="0.5" />
        <circle cx="38" cy="34" r="3.5" fill="var(--color-elderberry-300)" opacity="0.7" />
        <circle cx="18" cy="36" r="3" fill="var(--color-elderberry-400)" opacity="0.5" />
        <path
          d="M16 28c4-6 12-6 16-2s8 4 10 0"
          stroke="var(--color-elderberry)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
      </svg>
    ),
    tagLabel: "장 건강",
    tagColor: "var(--color-elderberry)",
    title: "듀올리고 — 검증된 프리바이오틱스",
    body: "장 속 유익균의 먹이로 이용되는 프리바이오틱스 성분 중 모유에 함유되어 있다고 알려진 갈락토올리고당(GOS)과 락툴로스를 함께 담았습니다.",
    detail:
      "GOS를 보충한 영유아 대상 다기관 임상시험에서, 비피더스균과 유산균의 성장이 촉진되고 유해균은 억제되는 결과가 확인되었습니다.",
    citation: "Giovannini et al., J Am Coll Nutr (2014), 다기관 RCT",
    highlights: [
      { label: "락툴로스", desc: "장내 유익균 영양원" },
      { label: "GOS", desc: "갈락토올리고당" },
    ],
  },
  {
    id: "amla",
    icon: (
      <svg
        viewBox="0 0 56 56"
        fill="none"
        className="w-14 h-14"
        aria-hidden="true"
      >
        {/* Amla / green gooseberry icon */}
        <circle cx="28" cy="28" r="26" fill="#F1F8E9" />
        <circle cx="28" cy="27" r="11" fill="#AED581" opacity="0.45" />
        <circle cx="28" cy="27" r="7.5" fill="#8BC34A" opacity="0.5" />
        <circle cx="25" cy="25" r="2" fill="white" opacity="0.35" />
        <path
          d="M28 16c-1 0-3 2-3 4s2 2 3 2 3 0 3-2-2-4-3-4z"
          fill="#558B2F"
          opacity="0.6"
        />
      </svg>
    ),
    tagLabel: "비타민C",
    tagColor: "#7CB342",
    title: "인디언구스베리 — 비타민C가 풍부한 열매",
    body: "인도 아유르베다에서 오랜 시간 활용해온 슈퍼푸드, 암라. 비타민C가 매우 풍부한 것으로 알려져 있습니다.",
    detail:
      "일반 비타민C(아스코르브산)는 열과 빛에 쉽게 파괴되지만, 암라의 비타민C는 갈릭산·탄닌과 결합한 자연 보호 구조 덕분에 열에도 안정적으로 유지됩니다.",
    citation: null,
    highlights: [
      { label: "암라", desc: "인디언구스베리" },
      { label: "비타민C", desc: "유익한 구조로 함유" },
    ],
  },
  {
    id: "monkfruit",
    icon: (
      <svg
        viewBox="0 0 56 56"
        fill="none"
        className="w-14 h-14"
        aria-hidden="true"
      >
        {/* Monk fruit icon — dark brown warm tone */}
        <circle cx="28" cy="28" r="26" fill="#EFEBE9" />
        <circle cx="28" cy="29" r="11" fill="#A1887F" opacity="0.4" />
        <circle cx="28" cy="29" r="7" fill="#795548" opacity="0.35" />
        <circle cx="25" cy="27" r="1.8" fill="white" opacity="0.2" />
        <path
          d="M28 18c-1 0-2.5 1.5-2.5 3.5s1.5 2 2.5 2 2.5-.5 2.5-2S29 18 28 18z"
          fill="#4E342E"
          opacity="0.5"
        />
      </svg>
    ),
    tagLabel: "천연 감미",
    tagColor: "#6D4C41",
    title: "나한과 — 자연이 만든 단맛",
    body: "나한과(Monk Fruit)는 중국 남부 구이린 지역에서 건강에 유익한 열매로 옛부터 활용되어왔습니다. 설탕보다 250배에 달하는 단맛을 갖고 있지만 칼로리는 거의 없는 안전한 감미료 역할도 합니다.",
    detail:
      "아이들이 먹는 제품이기에 감미료까지 건강한 원료로 선택했습니다. 나한과는 미국 FDA에서 GRAS(일반적으로 안전하다고 인정) 등급을 받은 안전한 자연 유래 원료입니다.",
    citation: null,
    highlights: [
      { label: "제로 칼로리", desc: "설탕 대비 250배 단맛" },
      { label: "FDA GRAS", desc: "안전성 인정" },
    ],
  },
];

/* ── Single Card Component ── */
function IngredientCard({
  ingredient,
}: {
  ingredient: (typeof INGREDIENTS)[number];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="ingredient-card group relative rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{
          background: `linear-gradient(90deg, ${ingredient.tagColor}, color-mix(in srgb, ${ingredient.tagColor} 60%, white))`,
        }}
      />

      <div className="p-6 sm:p-8">
        {/* Tag + Icon row */}
        <div className="flex items-start justify-between mb-5">
          <span
            className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${ingredient.tagColor} 10%, transparent)`,
              color: ingredient.tagColor,
            }}
          >
            {ingredient.tagLabel}
          </span>
          {ingredient.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-text-primary leading-snug mb-3">
          {ingredient.title}
        </h3>

        {/* Body */}
        <p className="text-body text-text-secondary leading-relaxed mb-4">
          {ingredient.body}
        </p>

        {/* Expandable detail */}
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: expanded ? "300px" : "0px",
            opacity: expanded ? 1 : 0,
          }}
        >
          <div className="pb-4">
            <p className="text-body-sm text-text-tertiary leading-relaxed mb-2">
              {ingredient.detail}
            </p>
            {ingredient.citation && (
              <p className="text-[11px] text-text-tertiary/60 italic">
                — {ingredient.citation}
              </p>
            )}
          </div>
        </div>

        {/* Highlight pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {ingredient.highlights.map((h) => (
            <div
              key={h.label}
              className="flex items-center gap-1.5 text-xs bg-bg-warm/60 rounded-lg px-3 py-2"
            >
              <span className="font-semibold text-text-primary">
                {h.label}
              </span>
              <span className="text-text-tertiary">{h.desc}</span>
            </div>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-body-sm font-medium transition-colors duration-200 hover:underline"
          style={{ color: ingredient.tagColor }}
          aria-expanded={expanded}
          aria-controls={`detail-${ingredient.id}`}
        >
          {expanded ? "접기 ↑" : "성분 상세 보기 →"}
        </button>
      </div>
    </article>
  );
}

/* ═══════ Main Component ═══════ */
export default function IngredientCards() {
  /* ── Scroll animation hooks ── */
  const headlineRef = useScrollAnimation<HTMLHeadingElement>({
    from: { opacity: 0, y: 40 },
    duration: 1.1,
    ease: "power3.out",
  });

  const subRef = useScrollAnimation<HTMLParagraphElement>({
    from: { opacity: 0, y: 20 },
    duration: 0.85,
    ease: "power2.out",
    delay: 0.15,
  });

  const gridRef = useProgressiveReveal<HTMLDivElement>({
    childSelector: ".ingredient-card",
    stagger: 0.2,
    from: { opacity: 0, y: 48, scale: 0.96 },
    duration: 0.95,
    ease: "power2.out",
  });

  return (
    <section
      id="ingredient-cards"
      className="section-padding relative overflow-hidden"
    >
      {/* ═══════ Subtle Warm Background Texture ═══════ */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(250,244,234,0.6) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(248,244,251,0.4) 0%, transparent 50%)",
        }}
      />

      <div className="section-inner relative z-10">
        {/* ── Headline ── */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            ref={headlineRef}
            className="font-bold text-text-primary leading-[1.15] tracking-[-0.025em] mb-4"
            style={{ fontSize: "var(--font-size-heading-xl)" }}
          >
            자연에서 찾은 원료
            <br />
            <span className="text-gradient-warm">과학으로 설계한</span> 배합
          </h2>

          <p
            ref={subRef}
            className="text-body-lg text-text-secondary max-w-[480px] mx-auto"
          >
            각 성분의 특성을 살려, 아이의 몸에 맞게 구성했습니다.
          </p>
        </div>

        {/* ── Ingredient Cards Grid ── */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-3 gap-5 lg:gap-7"
        >
          {INGREDIENTS.map((ingredient) => (
            <IngredientCard key={ingredient.id} ingredient={ingredient} />
          ))}
        </div>
      </div>
    </section>
  );
}

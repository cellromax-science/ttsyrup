"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useScrollAnimation,
  useProgressiveReveal,
} from "./scroll-hooks";

/* ─────────────────────────────────────────────────
   S6 — ProductFormats
   section-ivory 배경의 제품 라인업 쇼케이스.

   Design approach:
   - 밝고 깨끗한 아이보리 배경
   - 3 product cards with transparent PNG images
   - Interactive comparison table
   - Character mention at bottom
   ───────────────────────────────────────────────── */

/* ── Product format data ── */
interface FormatData {
  id: string;
  name: string;
  volume: string;
  image: string;
  tagline: string;
  desc: string;
  extra?: string;
  useCase: string;
  icon: string;
  color: string;
  characterColor: string;
  character: string;
}

const FORMATS: FormatData[] = [
  {
    id: "syrup",
    name: "어린이튼튼시럽",
    volume: "500ml",
    image: "/products/syrup-box-transparent.png",
    tagline: "가정에서 매일 먹이기 좋은 기본형",
    desc: "경제적인 대용량으로 꾸준한 영양 관리에 적합합니다. 계량컵으로 1회 10ml, 하루 한 번.",
    useCase: "집에서 매일",
    icon: "🏠",
    color: "var(--color-elderberry)",
    characterColor: "#7CB342",
    character: "초록 공룡",
  },
  {
    id: "stick",
    name: "어린이튼튼스틱",
    volume: "10ml × 30포",
    image: "/products/stick-transparent.png",
    tagline: "외출, 여행, 어린이집에 가져가기 좋은 휴대형",
    desc: "개별 포장이라 위생적이고, 따로 계량할 필요 없이 한 포를 그대로 먹이면 됩니다.",
    useCase: "외출·여행",
    icon: "✈️",
    color: "var(--color-elderberry-400)",
    characterColor: "#4DB6AC",
    character: "청록 공룡",
  },
  {
    id: "jjayo",
    name: "어린이튼튼짜요",
    volume: "20g × 40포",
    image: "/products/jjayo-40pack-transparent.png",
    tagline: "아이가 직접 짜서 먹는 재미있는 파우치형",
    desc: "스스로 짜먹는 경험이 아이의 자율성을 길러주고, 거부감 없이 즐겁게 영양을 섭취할 수 있습니다.",
    extra:
      "어린이 튼튼짜요 1포는 시럽제품의 20ml에 해당하는 용량이 젤리 제형에 담겨 있어 만 2세 이상부터 섭취를 권장합니다.",
    useCase: "아이 스스로",
    icon: "🧒",
    color: "var(--color-coral)",
    characterColor: "#4DB6AC",
    character: "청록 공룡",
  },
];

/* ── Product Card ── */
function FormatCard({
  format,
  isExpanded,
  onToggle,
}: {
  format: FormatData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`format-card group relative rounded-3xl p-5 sm:p-6 text-left transition-all duration-500 w-full border-2 border-transparent ${
        isExpanded
          ? "shadow-xl scale-[1.02]"
          : "bg-white/60 shadow-sm hover:shadow-md hover:bg-white/80"
      }`}
      style={
        isExpanded
          ? {
              background:
                "linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, var(--color-coral) 0%, var(--color-elderberry-light) 100%) border-box",
            }
          : {}
      }
      aria-expanded={isExpanded}
    >
      {/* Use case badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: isExpanded
              ? `color-mix(in srgb, ${format.color} 12%, transparent)`
              : "rgba(0,0,0,0.04)",
            color: isExpanded ? format.color : "var(--color-text-secondary)",
          }}
        >
          <span>{format.icon}</span>
          {format.useCase}
        </span>
        <span className="text-[11px] text-text-tertiary font-medium">
          {format.volume}
        </span>
      </div>

      {/* Product image */}
      <div className="relative w-full aspect-square mb-4 flex items-center justify-center">
        <div className="relative w-[75%] h-[75%]">
          <Image
            src={format.image}
            alt={format.name}
            fill
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 20vw"
            className={`object-contain transition-transform duration-500 ${
              isExpanded
                ? "scale-105 drop-shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
                : "drop-shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
            }`}
          />
        </div>
      </div>

      {/* Name */}
      <h3
        className="text-lg font-bold mb-1.5 transition-colors duration-300"
        style={{ color: isExpanded ? format.color : "var(--color-text-primary)" }}
      >
        {format.name}
      </h3>

      {/* Tagline */}
      <p className="text-body-sm text-text-secondary leading-relaxed">
        {format.tagline}
      </p>

      {/* ── Expandable Detail ── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-3 border-t border-black/[0.06]">
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {format.desc}
          </p>
          {format.extra && (
            <p className="text-body-sm text-text-secondary leading-relaxed mt-2">
              {format.extra}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: format.characterColor }}
            />
            <span className="text-[11px] text-text-tertiary">
              {format.character}와 함께하는 영양 시간
            </span>
          </div>
        </div>
      </div>

      {/* ── Toggle indicator ── */}
      <div
        className="mt-3 flex items-center justify-center gap-1 text-xs font-medium transition-colors duration-300"
        style={{
          color: isExpanded ? format.color : "var(--color-text-tertiary)",
        }}
      >
        <span>{isExpanded ? "접기" : "더보기"}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}

/* ═══════ Main Component ═══════ */
export default function ProductFormats() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  /* ── Scroll hooks ── */
  const headlineRef = useScrollAnimation<HTMLHeadingElement>({
    from: { opacity: 0, y: 40 },
    duration: 1.1,
    ease: "power3.out",
  });

  const subRef = useScrollAnimation<HTMLParagraphElement>({
    from: { opacity: 0, y: 20 },
    duration: 0.85,
    delay: 0.12,
  });

  const gridRef = useProgressiveReveal<HTMLDivElement>({
    childSelector: ".format-card",
    stagger: 0.18,
    from: { opacity: 0, y: 44, scale: 0.96 },
    duration: 0.9,
  });

  return (
    <section
      id="product-formats"
      className="section-ivory section-padding relative overflow-hidden"
    >
      <div className="section-inner relative z-10">
        {/* ── Headline ── */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            ref={headlineRef}
            className="font-bold text-text-primary leading-[1.15] tracking-[-0.025em] mb-4"
            style={{ fontSize: "var(--font-size-heading-xl)" }}
          >
            우리 아이 생활에 맞는
            <br />
            <span className="text-gradient-warm">딱 맞는 한 가지</span>
          </h2>

          <p
            ref={subRef}
            className="text-body-lg text-text-secondary max-w-[480px] mx-auto"
          >
            집에서, 밖에서, 아이 손에서.
            <br className="hidden sm:block" />
            세 가지 제형으로 상황에 맞게 선택하세요.
          </p>
        </div>

        {/* ── Product Cards Grid ── */}
        <div
          ref={gridRef}
          className="grid sm:grid-cols-3 gap-4 lg:gap-5 mb-8"
        >
          {FORMATS.map((format, i) => (
            <FormatCard
              key={format.id}
              format={format}
              isExpanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </div>


      </div>
    </section>
  );
}

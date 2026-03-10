"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useScrollAnimation,
  useProgressiveReveal,
} from "./scroll-hooks";

/* ─────────────────────────────────────────────────
   S8 — FaqCta
   section-lavender 배경의 FAQ + 최종 CTA 섹션.

   Design approach:
   - Soft lavender background for calming close
   - Accordion FAQ with smooth expand/collapse
   - Final CTA with warm gradient text
   - Scroll-to-top secondary button
   ───────────────────────────────────────────────── */

/* ── FAQ data ── */
const FAQS = [
  {
    q: "몇 살부터 먹일 수 있나요?",
    a: "만 1세 이상부터 섭취할 수 있습니다. 처음 시작할 때는 소량부터 시작해 아이의 반응을 살펴보시는 것을 권장합니다.",
  },
  {
    q: "하루에 얼마나 먹이면 되나요?",
    a: "1일 1회, 10ml를 권장합니다. 시럽은 동봉된 계량컵으로, 스틱과 짜요는 1포가 1회 분량입니다.",
  },
  {
    q: "시럽, 스틱, 짜요 중 어떤 걸 선택해야 하나요?",
    a: "세 제형 모두 동일한 핵심 성분을 담고 있습니다. 집에서 매일 먹인다면 시럽(500ml)이 경제적이고, 외출이 잦다면 스틱(개별 포장), 아이가 스스로 먹는 걸 좋아한다면 짜요를 추천합니다. 약국에서 약사와 상담 후 선택하시면 더 좋습니다.",
  },
  {
    q: "온라인에서 구매할 수 있나요?",
    a: "셀로맥스 어린이튼튼시럽은 약국 전용 제품으로, 가까운 약국에서만 구매하실 수 있습니다. 상단의 '약국 찾기'를 통해 가까운 취급 약국을 검색해 보세요.",
  },
  {
    q: "다른 영양제와 함께 먹여도 되나요?",
    a: "일반적인 식품과 함께 섭취할 수 있습니다. 다만, 유사한 성분의 다른 영양 보충제를 함께 드시는 경우 약사와 상담하시기를 권장합니다.",
  },
  {
    q: "엘더베리가 아이에게 안전한가요?",
    a: "셀로맥스에 사용된 엘더베리 추출물은 국제 임상시험에서 안전성이 확인된 원료입니다(Tiralongo et al., 2016). 단, 특이 체질이거나 알레르기가 있는 경우 섭취 전 약사와 상담해 주세요.",
  },
];

/* ── Accordion Item ── */
function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof FAQS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="faq-item border-b border-black/[0.06] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-body font-semibold text-text-primary group-hover:text-elderberry-500 transition-colors duration-200 leading-snug pr-2">
          {faq.q}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-elderberry-500 rotate-45"
              : "bg-black/[0.04] group-hover:bg-elderberry-50"
          }`}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            className={`w-3.5 h-3.5 transition-colors duration-300 ${
              isOpen ? "text-white" : "text-text-secondary"
            }`}
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isOpen ? "300px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="text-body text-text-secondary leading-relaxed pb-5 sm:pb-6 pr-10">
          {faq.a}
        </p>
      </div>
    </div>
  );
}

/* ═══════ Main Component ═══════ */
export default function FaqCta() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  /* ── Scroll hooks ── */
  const faqHeadRef = useScrollAnimation<HTMLHeadingElement>({
    from: { opacity: 0, y: 40 },
    duration: 1.1,
    ease: "power3.out",
  });

  const faqListRef = useProgressiveReveal<HTMLDivElement>({
    childSelector: ".faq-item",
    stagger: 0.1,
    from: { opacity: 0, y: 20 },
    duration: 0.7,
  });

  const ctaRef = useScrollAnimation<HTMLDivElement>({
    from: { opacity: 0, y: 48, scale: 0.96 },
    duration: 1.2,
    delay: 0.1,
  });

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="faq-cta"
      className="section-lavender section-padding relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(91,46,140,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(232,115,74,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="section-inner relative z-10">
        {/* ═══════ FAQ Section ═══════ */}
        <div className="max-w-[680px] mx-auto mb-20 lg:mb-28">
          {/* FAQ Headline */}
          <div className="text-center mb-10 lg:mb-12">
            <h2
              ref={faqHeadRef}
              className="font-bold text-text-primary leading-[1.15] tracking-[-0.025em]"
              style={{ fontSize: "var(--font-size-heading-xl)" }}
            >
              자주 묻는 질문
            </h2>
          </div>

          {/* FAQ Accordion */}
          <div
            ref={faqListRef}
            className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 sm:px-8 border border-black/[0.04] shadow-sm"
          >
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* ═══════ Final CTA Section ═══════ */}
        <div
          ref={ctaRef}
          className="text-center max-w-[720px] mx-auto"
        >
          {/* CTA Headline */}
          <h2
            className="font-bold text-text-primary leading-[1.15] tracking-[-0.025em] mb-4"
            style={{ fontSize: "var(--font-size-heading-xl)" }}
          >
            우리 아이의 튼튼한 매일
            <br />
            <span className="text-gradient-warm">
              셀로맥스와 함께 시작하세요
            </span>
          </h2>

          {/* CTA Subcopy */}
          <p className="text-body-lg text-text-secondary leading-relaxed mb-8 lg:mb-10">
            하루 한 번, 작은 습관이
            <br />
            건강한 성장의 큰 차이를 만듭니다.
          </p>

          {/* Product images */}
          <div className="flex items-end justify-center gap-6 sm:gap-8 mb-10 lg:mb-12">
            {[
              { src: "/products/syrup-box-transparent.png", alt: "어린이튼튼시럽", w: 200, h: 240 },
              { src: "/products/stick-transparent.png", alt: "어린이튼튼스틱", w: 180, h: 220 },
              { src: "/products/jjayo-40pack-transparent.png", alt: "어린이튼튼짜요", w: 180, h: 220 },
            ].map((p) => (
              <div key={p.alt} className="relative" style={{ width: p.w, height: p.h }}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="120px"
                  className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                />
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center">
            <a href="#pharmacy-finder" className="btn-primary">
              가까운 약국 찾기
            </a>
            <button
              onClick={handleScrollToTop}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-body-sm font-semibold text-text-secondary bg-white/80 backdrop-blur-sm border border-black/[0.06] hover:bg-white hover:border-black/[0.1] transition-all duration-200"
            >
              맨 위로 돌아가기 ↑
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-8 text-[14px] text-text-tertiary">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" className="w-4.5 h-4.5">
                <path
                  d="M8 1.5l4.5 2v4c0 3.5-2 6-4.5 7-2.5-1-4.5-3.5-4.5-7v-4L8 1.5z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M6 8l1.5 1.5L10 6.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              약국 전용 제품
            </span>
            <span className="w-px h-4 bg-text-tertiary/30" />
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" className="w-4.5 h-4.5">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="currentColor"
                  opacity="0.2"
                />
                <path
                  d="M8 5v3.5l2 1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              만 1세부터
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

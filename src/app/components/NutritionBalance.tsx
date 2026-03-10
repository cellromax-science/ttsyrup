"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  useScrollAnimation,
  useProgressiveReveal,
} from "./scroll-hooks";

/* ─────────────────────────────────────────────────
   S3 — NutritionBalance
   section-lavender 배경의 영양 밸런스 인포그래픽.

   Design approach:
   - 헤드카피 + 서브카피 (스크롤 리빌)
   - SVG 육각형 레이더 차트 (6축 영양소)
   - 3개 영양소 상세 카드 (아미노산/칼슘/비타민B)
   - 각 카드별 GSAP stagger entrance
   ───────────────────────────────────────────────── */

/* ── Radar chart data: 6-axis nutrient balance ── */
const RADAR_AXES = [
  { label: "엘더베리", angle: -90 },
  { label: "아미노산", angle: -30 },
  { label: "프리바이오틱스", angle: 30 },
  { label: "비타민B", angle: 90 },
  { label: "비타민C", angle: 150 },
  { label: "칼슘", angle: 210 },
];

/* Values 0~1 for the filled radar polygon */
const RADAR_VALUES = [1.0, 0.88, 0.86, 0.87, 0.89, 0.89];

/* ── Nutrient detail cards ── */
const NUTRIENT_CARDS = [
  {
    icon: "🧬",
    title: "단백질의 기초, 아미노산 7종",
    body: "성장기 어린이의 몸은 매일 새로운 세포를 만들어냅니다. 그 기초가 되는 것이 바로 아미노산입니다. 셀로맥스는 BCAA(발린·류신·이소류신)를 포함한 7종의 아미노산을 담았습니다.",
    detail:
      "그중 L-아르기닌은 성장기 어린이의 건강한 발달을 돕는 것으로 알려진 반필수 아미노산이며, L-글루타민은 장 점막의 주요 에너지원으로 알려진 아미노산입니다.",
    accentColor: "var(--color-elderberry)",
    tags: ["BCAA 3종", "L-아르기닌", "L-글루타민", "+2종"],
  },
  {
    icon: "🦴",
    title: "물에 녹는 칼슘, 그래서 다릅니다",
    body: "칼슘은 많이 먹는 것보다 잘 흡수되는 것이 중요합니다. 셀로맥스의 수용성 발효 칼슘은 청정해역 패각을 자연 발효하여 만든 100% 수용성 이온화 칼슘입니다.",
    detail:
      "화학용매 없이 발효 공정만으로 추출해, 체내 흡수에 유리한 형태를 갖추었습니다.",
    accentColor: "var(--color-coral)",
    tags: ["수용성 이온화", "자연 발효", "흡수 유리"],
  },
  {
    icon: "🌿",
    title: "식물에서 온 비타민 B&C",
    body: "구아바, 홀리바질, 레몬에는 비타민 B군이 인디언구스베리에는 비타민 C가 풍부하게 함유되어 있습니다.",
    detail:
      "어린이에게 필요한 비타민 B1·B2·B3·B5·B6·B9 6종과 비타민 C를 한 번에 섭취할 수 있습니다.",
    accentColor: "var(--color-elderberry-400)",
    tags: ["구아바", "홀리바질", "레몬", "인디언구스베리"],
  },
];

/* ── Radar Chart SVG component ── */
function RadarChart({ inView }: { inView: boolean }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 120; // max radius

  /* Grid rings at 25%, 50%, 75%, 100% */
  const rings = [0.25, 0.5, 0.75, 1];

  /* Compute point on the radar */
  const point = (axisIdx: number, value: number) => {
    const angleDeg = RADAR_AXES[axisIdx].angle;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * value * Math.cos(rad),
      y: cy + r * value * Math.sin(rad),
    };
  };

  /* Hex path for grid rings */
  const hexPath = (scale: number) => {
    return RADAR_AXES.map((_, i) => {
      const p = point(i, scale);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    }).join(" ") + " Z";
  };

  /* Data polygon path */
  const dataPath = RADAR_VALUES.map((v, i) => {
    const p = point(i, v);
    return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
  }).join(" ") + " Z";

  /* Label positions (slightly outside max radius) */
  const labelOffset = 1.22;

  return (
    <div className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] mx-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        aria-label="영양 밸런스 레이더 차트"
      >
        {/* Grid rings */}
        {rings.map((scale) => (
          <path
            key={scale}
            d={hexPath(scale)}
            fill="none"
            stroke="var(--color-elderberry-200)"
            strokeWidth="0.8"
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {RADAR_AXES.map((_, i) => {
          const p = point(i, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="var(--color-elderberry-200)"
              strokeWidth="0.6"
              opacity={0.4}
            />
          );
        })}

        {/* Data polygon — animated fill */}
        <path
          d={dataPath}
          fill="var(--color-elderberry)"
          fillOpacity={inView ? 0.15 : 0}
          stroke="var(--color-elderberry)"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-[1.8s] ease-out"
          style={{
            strokeDasharray: inView ? "none" : "2000",
            strokeDashoffset: inView ? "0" : "2000",
          }}
        />

        {/* Data points */}
        {RADAR_VALUES.map((v, i) => {
          const p = point(i, v);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--color-elderberry)"
              className="transition-all duration-[1.6s] ease-out"
              style={{
                opacity: inView ? 1 : 0,
                transitionDelay: `${0.3 + i * 0.1}s`,
              }}
            />
          );
        })}

        {/* Center label — soft backing + text on top of everything */}
        <circle
          cx={cx}
          cy={cy}
          r="28"
          fill="white"
          fillOpacity={inView ? 0.65 : 0}
          className="transition-all duration-700"
          style={{ transitionDelay: "0.4s" }}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-elderberry-600 text-[10px] font-bold"
          style={{ opacity: inView ? 1 : 0, transition: "opacity 0.8s ease 0.5s" }}
        >
          영양 밸런스
        </text>
      </svg>

      {/* Axis labels (HTML for better styling & wrapping) */}
      {RADAR_AXES.map((axis, i) => {
        const p = point(i, labelOffset);
        /* Convert SVG coordinates to % positions */
        const leftPct = (p.x / size) * 100;
        const topPct = (p.y / size) * 100;

        return (
          <span
            key={axis.label}
            className="absolute text-[11px] sm:text-xs font-medium text-elderberry-500 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              opacity: inView ? 1 : 0,
              transitionDelay: `${0.6 + i * 0.08}s`,
            }}
          >
            {axis.label}
          </span>
        );
      })}
    </div>
  );
}

/* ── Nutrient card component ── */
function NutrientCard({
  card,
}: {
  card: (typeof NUTRIENT_CARDS)[number];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="nutrient-card card-surface group rounded-2xl p-6 sm:p-8 transition-shadow duration-300 hover:shadow-lg">
      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl sm:text-3xl leading-none flex-shrink-0 mt-0.5">
          {card.icon}
        </span>
        <h3
          className="text-body-lg font-bold text-text-primary leading-snug"
          style={{ color: card.accentColor }}
        >
          {card.title}
        </h3>
      </div>

      {/* Body */}
      <p className="text-body text-text-secondary leading-relaxed mb-3">
        {card.body}
      </p>

      {/* Expandable detail */}
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: expanded ? "200px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <p className="text-body-sm text-text-tertiary leading-relaxed pt-1 pb-3">
          {card.detail}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${card.accentColor} 8%, transparent)`,
              color: card.accentColor,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-body-sm font-medium transition-colors duration-200"
        style={{ color: card.accentColor }}
        aria-expanded={expanded}
      >
        {expanded ? "접기" : "자세히 보기 →"}
      </button>
    </div>
  );
}

/* ═══════ Main Component ═══════ */
export default function NutritionBalance() {
  const sectionRef = useRef<HTMLElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const [radarInView, setRadarInView] = useState(false);

  /* ── Scroll animation hooks ── */
  const headlineRef = useScrollAnimation<HTMLHeadingElement>({
    from: { opacity: 0, y: 40 },
    duration: 1.1,
    ease: "power3.out",
  });

  const subRef = useScrollAnimation<HTMLParagraphElement>({
    from: { opacity: 0, y: 24 },
    duration: 0.9,
    ease: "power2.out",
    delay: 0.15,
  });

  const cardGridRef = useProgressiveReveal<HTMLDivElement>({
    childSelector: ".nutrient-card",
    stagger: 0.18,
    from: { opacity: 0, y: 36, scale: 0.97 },
    duration: 0.85,
    ease: "power2.out",
  });

  /* ── Radar chart IntersectionObserver ── */
  useEffect(() => {
    const el = radarRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRadarInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── Decorative floating orbs ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ctx: gsap.Context | undefined;
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".lavender-orb").forEach((orb, i) => {
          gsap.to(orb, {
            y: `random(-20, 20)`,
            x: `random(-15, 15)`,
            scale: 1 + Math.random() * 0.12,
            duration: 5 + i * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.6,
          });
        });
      }, section);
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="nutrition-balance"
      ref={sectionRef}
      className="section-lavender section-padding relative overflow-hidden"
    >
      {/* ═══════ Decorative Orbs ═══════ */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="lavender-orb absolute -top-[120px] right-[10%] w-[380px] h-[380px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(91,46,140,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="lavender-orb absolute bottom-[5%] -left-[80px] w-[320px] h-[320px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(232,115,74,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="lavender-orb absolute top-[50%] right-[30%] w-[200px] h-[200px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(91,46,140,0.12) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* ═══════ Content ═══════ */}
      <div className="section-inner relative z-10">
        {/* ── Headline ── */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            ref={headlineRef}
            className="font-bold text-text-primary leading-[1.15] tracking-[-0.025em] mb-4 lg:mb-5"
            style={{ fontSize: "var(--font-size-heading-xl)" }}
          >
            성장기에 꼭 필요한 영양
            <br />
            <span className="text-gradient-elderberry">균형 있게</span>{" "}
            담았습니다
          </h2>

          <p
            ref={subRef}
            className="text-body-lg text-text-secondary max-w-[540px] mx-auto leading-relaxed"
          >
            아미노산 7종 + 수용성 발효 칼슘 + 식물 유래 비타민B
            <br className="hidden sm:block" />
            하루 한 번으로 채우는 성장의 기초
          </p>
        </div>

        {/* ── Radar Chart + Quick Stats ── */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16 lg:mb-20">
          {/* Radar chart */}
          <div ref={radarRef} className="flex-shrink-0" data-reveal="scale">
            <RadarChart inView={radarInView} />
            <p className="text-center text-[11px] text-text-tertiary mt-3">
              *각 성분의 영양학적 역할을 기반으로 구성한 개념도입니다
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-3 sm:gap-5 max-w-[480px] mx-auto lg:mx-0">
              {/* Stat: 프리미엄 원료 */}
              <div className="card-elderberry rounded-2xl px-3 py-4 sm:p-6 text-center" data-reveal>
                <span className="block text-2xl sm:text-3xl mb-1.5 sm:mb-2">✨</span>
                <span className="block text-[0.9rem] sm:text-lg font-bold text-elderberry-600 mb-0.5 sm:mb-1">
                  프리미엄 원료
                </span>
                <span className="text-[0.7rem] sm:text-body-sm text-text-secondary leading-snug">
                  6가지 핵심영양소
                </span>
              </div>

              {/* Stat: 아미노산 */}
              <div className="card-elderberry rounded-2xl px-3 py-4 sm:p-6 text-center" data-reveal>
                <span className="block text-2xl sm:text-3xl mb-1.5 sm:mb-2">💪</span>
                <span className="block text-[0.9rem] sm:text-lg font-bold text-elderberry-600 mb-0.5 sm:mb-1">
                  아미노산
                </span>
                <span className="text-[0.7rem] sm:text-body-sm text-text-secondary leading-snug">
                  BCAA 포함 7종
                </span>
              </div>

              {/* Stat: 비타민 B&C */}
              <div className="card-elderberry rounded-2xl px-3 py-4 sm:p-6 text-center" data-reveal>
                <span className="block text-2xl sm:text-3xl mb-1.5 sm:mb-2">🍋</span>
                <span className="block text-[0.9rem] sm:text-lg font-bold text-elderberry-600 mb-0.5 sm:mb-1">
                  비타민 B&amp;C
                </span>
                <span className="text-[0.7rem] sm:text-body-sm text-text-secondary leading-snug">
                  레몬·홀리바질·구아바·구스베리 유래
                </span>
              </div>

              {/* Stat: 이온화칼슘 */}
              <div className="card-elderberry rounded-2xl px-3 py-4 sm:p-6 text-center" data-reveal>
                <span className="block text-2xl sm:text-3xl mb-1.5 sm:mb-2">🐚</span>
                <span className="block text-[0.9rem] sm:text-lg font-bold text-elderberry-600 mb-0.5 sm:mb-1">
                  이온화칼슘
                </span>
                <span className="text-[0.7rem] sm:text-body-sm text-text-secondary leading-snug">
                  패각 발효 수용성 이온화 미네랄
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Nutrient Detail Cards ── */}
        <div
          ref={cardGridRef}
          className="grid md:grid-cols-3 gap-5 lg:gap-6"
        >
          {NUTRIENT_CARDS.map((card) => (
            <NutrientCard key={card.title} card={card} />
          ))}
        </div>

      </div>
    </section>
  );
}

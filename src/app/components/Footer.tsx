/* ─────────────────────────────────────────────────
   Footer
   Dark elderberry gradient background.
   Company info, disclaimer, links, copyright.
   ───────────────────────────────────────────────── */

import ProductInfoTable from "./ProductInfoTable";

export default function Footer() {
  return (
    <footer className="section-dark relative overflow-hidden">
      {/* Background subtle texture */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="section-inner relative z-10 py-14 sm:py-18 lg:py-20">
        {/* ── Top: Logo / Brand ── */}
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2.5 mb-3">
            {/* Brand mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-elderberry-400 to-elderberry-600 flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="w-4.5 h-4.5 text-white"
              >
                <circle
                  cx="10"
                  cy="8"
                  r="5"
                  fill="currentColor"
                  opacity="0.6"
                />
                <circle
                  cx="7"
                  cy="12"
                  r="4"
                  fill="currentColor"
                  opacity="0.4"
                />
                <circle
                  cx="13"
                  cy="12"
                  r="4"
                  fill="currentColor"
                  opacity="0.5"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-white/90 tracking-tight">
              Cellromax
            </span>
          </div>
          <p className="text-body-sm text-white/30">
            프리미엄 건강 솔루션 전문 브랜드
          </p>
        </div>

        {/* ── Disclaimer ── */}
        <div className="max-w-[640px] mx-auto mb-10 lg:mb-14">
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-white/[0.06]">
            <div className="flex items-start gap-3 mb-3">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M8 5v3.5M8 10.5v.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                안내사항
              </span>
            </div>
            <div className="space-y-1.5 text-[12px] text-white/30 leading-relaxed">
              <p>
                본 제품은 질병의 예방 및 치료를 위한 의약품이 아닙니다.
              </p>
              <p>
                임상시험 결과는 해당 연구의 특정 조건에서 확인된 것으로, 개인에
                따라 결과가 다를 수 있습니다.
              </p>
              <p>섭취 전 약사와 상담하시기 바랍니다.</p>
              <p>
                특이 체질이거나 알레르기 체질인 경우, 성분을 확인하신 후
                섭취하십시오.
              </p>
            </div>
          </div>
        </div>

        {/* ── Product Info Table ── */}
        <div className="mb-10 lg:mb-14">
          <ProductInfoTable />
        </div>

        {/* ── Company Info ── */}
        <div className="max-w-[640px] mx-auto text-center mb-8 lg:mb-10">
          <div className="space-y-2 text-[12px] text-white/25 leading-relaxed">
            <p>
              (주)셀로맥스사이언스 | 대표: 서정민
            </p>
            <p>
              사업자등록번호: 125-86-27262 | 통신판매업신고:
              2018-용인기흥-0828
            </p>
            <p>
              경기도 용인시 기흥구 구성로 357 디동 1층 106호
              용인테크노밸리(청덕동)
            </p>
            <p>
              고객센터:{" "}
              <a
                href="tel:031-662-1395"
                className="text-white/35 hover:text-white/50 transition-colors"
              >
                031-662-1395
              </a>{" "}
              (평일 09:00~17:00, 점심 12:30~13:30 / 토·일·공휴일 휴무)
            </p>
            <p>
              이메일:{" "}
              <a
                href="mailto:health1395@kshp.co.kr"
                className="text-white/35 hover:text-white/50 transition-colors"
              >
                health1395@kshp.co.kr
              </a>
            </p>
            <p>개인정보관리책임자: 양인규</p>
            <p>개인정보보호배상책임보험(Ⅱ) 가입: 메리츠화재</p>
          </div>
        </div>

        {/* ── Bottom Links + Copyright ── */}
        <div className="border-t border-white/[0.06] pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Links */}
            <div className="flex items-center gap-4 text-[11px]">
              <a
                href="#"
                className="text-white/25 hover:text-white/50 transition-colors"
              >
                개인정보처리방침
              </a>
              <span className="w-px h-3 bg-white/10" />
              <a
                href="#"
                className="text-white/25 hover:text-white/50 transition-colors"
              >
                이용약관
              </a>
              <span className="w-px h-3 bg-white/10" />
              <a
                href="#"
                className="text-white/25 hover:text-white/50 transition-colors"
              >
                사업자정보확인
              </a>
            </div>

            {/* Copyright */}
            <p className="text-[11px] text-white/20">
              &copy; 2026 Cellromax. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

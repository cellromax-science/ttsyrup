import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 셀로맥스 어린이튼튼시럽",
  description: "셀로맥스 어린이튼튼시럽 웹사이트 개인정보처리방침",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--color-bg-warm)]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-black/[0.06] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href={`/${locale === "ko" ? "" : locale}`}
            className="text-sm font-semibold text-[var(--color-elderberry)] hover:opacity-70 transition-opacity"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          개인정보처리방침
        </h1>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-10">
          시행일: 2026년 3월 25일
        </p>

        <div className="space-y-10 text-[var(--color-text-secondary)] leading-[1.85] text-[15px]">
          {/* 제1조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제1조 (총칙)
            </h2>
            <p>
              (주)셀로맥스사이언스(이하 &quot;회사&quot;)는 이용자의 개인정보를
              중요시하며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본
              개인정보처리방침은 회사가 운영하는 셀로맥스 어린이튼튼시럽
              웹사이트(이하 &quot;사이트&quot;)에 적용됩니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제2조 (수집하는 개인정보 항목)
            </h2>
            <p className="mb-3">
              본 사이트는 회원가입, 로그인, 결제 등의 기능을 제공하지 않으며,
              이용자의 개인정보를 직접 입력받지 않습니다. 다만, 서비스 이용
              과정에서 다음 정보가 자동으로 생성·수집될 수 있습니다.
            </p>
            <div className="bg-white/60 rounded-2xl p-5 border border-black/[0.04]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--color-text-primary)]">
                      항목
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--color-text-primary)]">
                      수집 목적
                    </th>
                    <th className="text-left py-2 font-semibold text-[var(--color-text-primary)]">
                      필수 여부
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  <tr>
                    <td className="py-2.5 pr-4">위치정보 (GPS)</td>
                    <td className="py-2.5 pr-4">
                      가까운 약국 찾기 기능 제공
                    </td>
                    <td className="py-2.5">선택</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4">접속 로그, IP 주소</td>
                    <td className="py-2.5 pr-4">
                      서비스 안정성 확보 및 통계 분석
                    </td>
                    <td className="py-2.5">자동 수집</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4">쿠키</td>
                    <td className="py-2.5 pr-4">
                      사이트 이용 편의 및 서비스 개선
                    </td>
                    <td className="py-2.5">자동 수집</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제3조 (위치정보의 처리)
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                &quot;가까운 약국 찾기&quot; 기능 이용 시, 이용자의 단말기에서
                위치정보를 수집합니다. 이는 브라우저의 위치 권한 동의를 통해
                이루어지며, 이용자가 &quot;허용&quot;을 선택한 경우에만
                수집됩니다.
              </li>
              <li>
                수집된 위치정보는 가까운 약국을 안내하는 목적으로만 사용되며,
                이용자의 브라우저(단말기)에서만 처리됩니다.{" "}
                <strong>
                  회사 서버에 전송되거나 저장되지 않습니다.
                </strong>
              </li>
              <li>
                이용자는 브라우저 설정에서 언제든지 위치 권한을 해제할 수
                있습니다.
              </li>
            </ol>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제4조 (쿠키의 사용)
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 서비스 개선 및 이용 통계 분석을 위해 쿠키를 사용할 수
                있습니다.
              </li>
              <li>
                쿠키는 이용자의 컴퓨터를 식별하지만 이용자 개인을 식별하지는
                않습니다.
              </li>
              <li>
                이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할
                수 있습니다. 다만, 쿠키 저장을 거부할 경우 일부 서비스 이용에
                어려움이 있을 수 있습니다.
              </li>
            </ol>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제5조 (개인정보의 보유 및 파기)
            </h2>
            <p>
              본 사이트는 이용자의 개인정보를 서버에 저장하지 않으므로 별도의
              보유 기간이 없습니다. 접속 로그 등 자동 수집 정보는 수집일로부터
              최대 1년간 보유한 후 지체 없이 파기합니다. 파기 시에는 복구가
              불가능한 방법을 사용합니다.
            </p>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제6조 (개인정보의 제3자 제공)
            </h2>
            <p className="mb-3">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의하여 요구되는 경우</li>
            </ul>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제7조 (개인정보 처리 위탁)
            </h2>
            <div className="bg-white/60 rounded-2xl p-5 border border-black/[0.04]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--color-text-primary)]">
                      수탁업체
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--color-text-primary)]">
                      위탁 업무
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  <tr>
                    <td className="py-2.5 pr-4">Vercel Inc.</td>
                    <td className="py-2.5">웹사이트 호스팅 및 콘텐츠 전송</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4">카카오(주)</td>
                    <td className="py-2.5">
                      지도 API 제공 (약국 위치 표시)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제8조 (이용자의 권리)
            </h2>
            <p>
              이용자는 언제든지 개인정보의 열람, 정정, 삭제, 처리정지를 요청할
              수 있습니다. 본 사이트는 이용자의 개인정보를 서버에 저장하지
              않으므로, 브라우저의 쿠키 삭제 및 위치 권한 해제를 통해 직접
              관리하실 수 있습니다.
            </p>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제9조 (만 14세 미만 아동의 개인정보)
            </h2>
            <p>
              본 사이트는 만 14세 미만 아동의 개인정보를 별도로 수집하지
              않습니다. 사이트의 모든 기능은 회원가입 없이 이용 가능하며,
              아동의 개인정보가 수집되는 절차가 존재하지 않습니다.
            </p>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제10조 (개인정보 보호책임자)
            </h2>
            <p className="mb-3">
              회사는 이용자의 개인정보를 보호하고 관련 불만을 처리하기 위하여
              아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-white/60 rounded-2xl p-5 border border-black/[0.04] text-sm space-y-1.5">
              <p>
                <strong>개인정보 보호책임자:</strong> 양인규
              </p>
              <p>
                <strong>소속/직위:</strong> (주)셀로맥스사이언스 / 전무
              </p>
              <p>
                <strong>전화:</strong> 031-662-1395
              </p>
              <p>
                <strong>이메일:</strong> health1395@kshp.co.kr
              </p>
            </div>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제11조 (권익침해 구제 방법)
            </h2>
            <p className="mb-3">
              이용자는 개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래
              기관에 문의하실 수 있습니다.
            </p>
            <ul className="text-sm space-y-1.5">
              <li>
                개인정보분쟁조정위원회:{" "}
                <span className="text-[var(--color-text-tertiary)]">
                  (국번없이) 1833-6972 / www.kopico.go.kr
                </span>
              </li>
              <li>
                개인정보침해신고센터:{" "}
                <span className="text-[var(--color-text-tertiary)]">
                  (국번없이) 118 / privacy.kisa.or.kr
                </span>
              </li>
              <li>
                대검찰청 사이버수사과:{" "}
                <span className="text-[var(--color-text-tertiary)]">
                  (국번없이) 1301 / www.spo.go.kr
                </span>
              </li>
              <li>
                경찰청 사이버수사국:{" "}
                <span className="text-[var(--color-text-tertiary)]">
                  (국번없이) 182 / ecrm.police.go.kr
                </span>
              </li>
            </ul>
          </section>

          {/* 제12조 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              제12조 (방침의 변경)
            </h2>
            <p>
              본 개인정보처리방침은 법령 및 회사 정책의 변경에 따라 수정될 수
              있으며, 변경 시 사이트 공지를 통해 안내합니다.
            </p>
            <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">
              본 방침은 2026년 3월 25일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

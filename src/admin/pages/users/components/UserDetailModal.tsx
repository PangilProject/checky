import { useState, type ReactNode } from "react";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import type { AdminUser } from "../hooks/useAdminUsers";

import { FiUser, FiMail, FiHash, FiClock, FiActivity } from "react-icons/fi";

interface Props {
  user: AdminUser;
  onClose: () => void;
}

const ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/* ======================
   Utils
====================== */

// 목록은 폭이 좁아 날짜만 보여주고(UserRow), 상세 모달은 시각까지 보여준다.
function formatDateTime(date?: Date) {
  if (!date) return "-";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${hours}:${minutes}`;
}

/**
 * 달력일 기준 며칠 전인지 센다. 어제 밤 11시 접속을 오늘 아침에 보면
 * 경과 시간은 반나절이지만 사람 기준으로는 "1일 전(어제)"이므로,
 * 자정끼리 비교한다.
 */
function diffCalendarDays(date: Date, nowTime: number) {
  const now = new Date(nowTime);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return Math.round(
    (startOfToday.getTime() - startOfThatDay.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/* ======================
   Sub Component
====================== */

function InfoRow({
  icon,
  text,
  muted = false,
}: {
  icon: ReactNode;
  text: string;
  muted?: boolean;
}) {
  return (
    <Stack gap={2} direction="row" align="center">
      <span
        className={`text-sm ${muted ? "text-content-subtle" : "text-content"}`}
      >
        {icon}
      </span>
      <Text variant="bodySm" className={muted ? "text-content-muted" : ""}>
        {text}
      </Text>
    </Stack>
  );
}

/* ======================
   Main Component
====================== */

export default function UserDetailModal({ user, onClose }: Props) {
  // 기준 시각은 모달을 열 때마다 계산한다. 모듈 스코프에 고정하면
  // 탭을 열어 둔 만큼 활성 판정과 "N일 전" 표기가 밀린다.
  const [nowTime] = useState(() => Date.now());

  // 활성 여부는 실사용을 나타내는 마지막 접속 기준으로 판단한다
  const isActive =
    user.lastActiveAt &&
    user.lastActiveAt.getTime() >= nowTime - ACTIVE_WINDOW_MS;

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle text="사용자 정보" />

      <div className="mb-10 flex flex-col gap-8">
        {/* ================= 기본 정보 ================= */}
        <div>
          <Text variant="body" className="mb-2 font-bold">
            기본 정보
          </Text>

          <InfoRow icon={<FiUser />} text={`이름: ${user.name ?? "-"}`} />
          <InfoRow icon={<FiMail />} text={`이메일: ${user.email ?? "-"}`} />
          <InfoRow icon={<FiHash />} text={`UID: ${user.id}`} muted />
        </div>

        {/* ================= 계정 정보 ================= */}
        <div>
          <Text variant="body" className="mb-2 font-bold">
            계정 정보
          </Text>

          <InfoRow
            icon={<FiClock />}
            text={`가입일: ${formatDateTime(user.createdAt)}`}
          />
          <InfoRow
            icon={<FiClock />}
            text={`마지막 로그인: ${formatDateTime(user.lastLoginAt)}`}
          />
          <InfoRow
            icon={<FiClock />}
            text={`마지막 접속: ${formatDateTime(user.lastActiveAt)}`}
          />
        </div>

        {/* ================= 상태 요약 ================= */}
        <div>
          <Text variant="body" className="mb-2 font-bold">
            상태 요약
          </Text>

          <InfoRow
            icon={<FiActivity />}
            text={`상태: ${isActive ? "활성" : "비활성"}`}
          />

          <InfoRow
            icon={<FiClock />}
            text={`최근 접속: ${
              user.lastActiveAt
                ? `${diffCalendarDays(user.lastActiveAt, nowTime)}일 전`
                : "기록 없음"
            }`}
            muted
          />
        </div>
      </div>

      {/* ================= 버튼 ================= */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </div>
    </ModalWrapper>
  );
}

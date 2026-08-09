import { useState, type ReactNode } from "react";
import { Text2, Text3 } from "@/shared/ui/Text";
import { Space10, Space2, Space8 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { NormalBlackUnFillButton } from "@/shared/ui/Button";
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

function formatDate(date?: Date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function diffDays(date: Date, nowTime: number) {
  const diff = nowTime - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
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
    <div className="flex items-center gap-2">
      <span className={`text-sm ${muted ? "text-gray-300" : "text-black"}`}>
        {icon}
      </span>
      <Text2 text={text} className={muted ? "text-gray-400" : ""} />
    </div>
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
    user.lastActiveAt && user.lastActiveAt.getTime() >= nowTime - ACTIVE_WINDOW_MS;

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle text="사용자 정보" />

      {/* ================= 기본 정보 ================= */}
      <div>
        <Text3 text="기본 정보" className="font-bold" />
        <Space2 direction="mb" />

        <InfoRow icon={<FiUser />} text={`이름: ${user.name ?? "-"}`} />
        <InfoRow icon={<FiMail />} text={`이메일: ${user.email ?? "-"}`} />
        <InfoRow icon={<FiHash />} text={`UID: ${user.id}`} muted />
      </div>

      <Space8 direction="mb" />

      {/* ================= 계정 정보 ================= */}
      <div>
        <Text3 text="계정 정보" className="font-bold" />
        <Space2 direction="mb" />

        <InfoRow
          icon={<FiClock />}
          text={`가입일: ${formatDate(user.createdAt)}`}
        />
        <InfoRow
          icon={<FiClock />}
          text={`마지막 로그인: ${formatDate(user.lastLoginAt)}`}
        />
        <InfoRow
          icon={<FiClock />}
          text={`마지막 접속: ${formatDate(user.lastActiveAt)}`}
        />
      </div>

      <Space8 direction="mb" />

      {/* ================= 상태 요약 ================= */}
      <div>
        <Text3 text="상태 요약" className="font-bold" />
        <Space2 direction="mb" />

        <InfoRow
          icon={<FiActivity />}
          text={`상태: ${isActive ? "활성" : "비활성"}`}
        />

        <InfoRow
          icon={<FiClock />}
          text={`최근 접속: ${
            user.lastActiveAt
              ? `${diffDays(user.lastActiveAt, nowTime)}일 전`
              : "기록 없음"
          }`}
          muted
        />
      </div>

      <Space10 direction="mb" />

      {/* ================= 버튼 ================= */}
      <div className="flex justify-end">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      </div>
    </ModalWrapper>
  );
}

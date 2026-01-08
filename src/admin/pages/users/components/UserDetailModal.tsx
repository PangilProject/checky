import type { ReactNode } from "react";
import { Text2, Text3, Text5 } from "@/shared/ui/Text";
import { Space10, Space2, Space8 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
import { NormalBlackUnFillButton } from "@/shared/ui/Button";
import type { AdminUser } from "../hooks/useAdminUsers";

import { FiUser, FiMail, FiHash, FiClock, FiActivity } from "react-icons/fi";

interface Props {
  user: AdminUser;
  onClose: () => void;
}

/* ======================
   Utils
====================== */

function formatDate(date?: Date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function diffDays(date?: Date) {
  if (!date) return "-";
  const diff = Date.now() - date.getTime();
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
  const isActive =
    user.lastLoginAt &&
    user.lastLoginAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <ModalWrapper onClose={onClose}>
      <Text5 text="사용자 정보" className="font-bold" />
      <Space10 direction="mb" />

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
          text={`최근 로그인: ${
            user.lastLoginAt ? `${diffDays(user.lastLoginAt)}일 전` : "-"
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

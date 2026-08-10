import { Button, Text } from "@/shared/ui/primitives";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { useAuth } from "@/shared/hooks/useAuth";
import { TitleText } from "@/shared/ui/TitleText";
import {
  AccountDeletionIncompleteError,
  deleteAccount,
} from "@/shared/api/auth/auth";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { LegalLinks } from "@/shared/ui/LegalLinks";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearAdminCache } from "@/shared/api/auth/adminAccess";
import { useAdminShortcut } from "./hooks/useAdminShortcut";
import { ThemeSection } from "./components/ThemeSection";

function MyPage() {
  return (
    <div>
      <TitleText text="마이 정보" className="mb-4" />
      <div className="flex flex-col gap-10">
        <UserInfoSection />
        <ThemeSection />
        <ButtonSection />
        <LegalLinks />
      </div>
    </div>
  );
}

const UserInfoSection = () => {
  const { user, isAdmin } = useAuth();
  const fallbackLogo = useLogoSrc("round");
  // 관리자만 쓰는 숨은 통로. 관리자가 아니면 핸들러 자체가 붙지 않는다.
  const handleAdminShortcutTap = useAdminShortcut(isAdmin);

  const name = user?.displayName || "";
  const email = user?.email || "";
  const imageUrl = user?.photoURL || "";
  return (
    <div className="flex gap-4">
      <img
        src={imageUrl || fallbackLogo}
        alt=""
        // 누를 수 있어 보이면 숨긴 뜻이 없으므로 커서와 모양은 그대로 둔다.
        // 빠르게 여러 번 누를 때 이미지 끌기나 글자 선택이 끼어들지 않게만 막는다.
        className="w-16 h-16 shrink-0 rounded-4xl object-cover select-none"
        draggable={false}
        onClick={handleAdminShortcutTap}
        onError={(e) => {
          e.currentTarget.src = fallbackLogo;
        }}
      />
      <div className="flex min-w-0 flex-col justify-center">
        <Text className="truncate">{name || "이름"}</Text>
        <Text variant="bodySm" tone="muted" className="truncate">
          {email || "이메일"}
        </Text>
      </div>
    </div>
  );
};

/** 회원탈퇴 실패 원인별 안내 문구를 반환합니다. */
const getWithdrawErrorMessage = (error: unknown): string => {
  if (error instanceof AccountDeletionIncompleteError) {
    return "데이터는 삭제되었지만 계정 삭제가 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.";
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "본인 확인이 취소되었습니다. 탈퇴가 진행되지 않았습니다.";
    case "auth/popup-blocked":
      return "팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해 주세요.";
    case "auth/requires-recent-login":
      return "보안을 위해 다시 로그인한 뒤 탈퇴를 진행해 주세요.";
    case "auth/network-request-failed":
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    default:
      return "회원탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
};

const ButtonSection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 세션 종료 시 이전 계정의 데이터가 다음 계정 화면에 남지 않도록 캐시를 비운다
  const clearSessionCaches = () => {
    queryClient.clear();
    clearAdminCache();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      clearSessionCaches();
      navigate("/", { replace: true });
      toast.success("로그아웃 되었습니다.");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await deleteAccount();
      clearSessionCaches();
      setWithdrawOpen(false);
      navigate("/", { replace: true });
      toast.success("회원탈퇴가 완료되었습니다.");
    } catch (error) {
      setWithdrawOpen(false);
      toast.error(getWithdrawErrorMessage(error));
    }
  };

  return (
    <div className="flex gap-3">
      <Button onClick={() => void handleLogout()} disabled={isLoggingOut}>
        로그아웃
      </Button>
      <Button onClick={() => setWithdrawOpen(true)}>회원탈퇴</Button>

      {withdrawOpen && (
        <ConfirmModal
          title="정말로 탈퇴하시겠습니까?"
          description="모든 데이터가 삭제되며, 이 작업은 되돌릴 수 없습니다."
          confirmText="탈퇴"
          danger
          onClose={() => setWithdrawOpen(false)}
          onConfirm={handleWithdraw}
        />
      )}
    </div>
  );
};
export default MyPage;

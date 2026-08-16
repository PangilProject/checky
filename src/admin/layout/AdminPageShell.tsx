import type { ReactNode } from "react";
import { Text } from "@/shared/ui/primitives";
import { cn } from "@/shared/ui/cn";

/**
 * 관리자 화면의 공통 틀.
 *
 * 대시보드·가입자·공지가 제목 줄과 로딩·실패 표시를 각자 그리고 있었다.
 * 지금 로딩은 "로딩 중..." 글자 한 줄뿐이라 개선의 여지가 큰데, 세 곳에
 * 흩어져 있으면 한 곳만 고쳐 화면마다 다르게 보이기 쉽다.
 */

interface AdminPageShellProps {
  title: string;
  /** 제목 오른쪽에 둘 것 (예: "공지 추가" 버튼) */
  action?: ReactNode;
  loading?: boolean;
  isError?: boolean;
  /**
   * 실패했을 때 보여 줄 문구.
   *
   * 조사(을/를)가 대상마다 달라 문장을 통째로 받는다. 대상 이름만 받아
   * 문장을 조립하면 "공지사항를" 같은 말이 나온다.
   */
  errorText?: string;
  /** 바깥 여백을 바꿔야 하는 화면용 (대시보드는 섹션 간격이 더 넓다) */
  className?: string;
  children?: ReactNode;
}

export const AdminPageShell = ({
  title,
  action,
  loading = false,
  isError = false,
  errorText,
  className,
  children,
}: AdminPageShellProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {action ? (
        <div className="flex items-center justify-between">
          <Text variant="heading">{title}</Text>
          {action}
        </div>
      ) : (
        <Text variant="heading">{title}</Text>
      )}

      {/* 실패를 먼저 본다. 실패한 뒤에도 loading 이 남아 있으면 로딩만 계속 보인다 */}
      {isError ? (
        <p className="text-sm text-content-muted">{errorText}</p>
      ) : loading ? (
        <p className="text-sm text-content-muted">로딩 중...</p>
      ) : (
        children
      )}
    </div>
  );
};

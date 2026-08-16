import type { ReactNode } from "react";
import { Button, Stack } from "@/shared/ui/primitives";

/**
 * 모달 맨 아래 버튼 줄.
 *
 * 분류·루틴·할 일·공지 모달이 같은 줄을 각자 그리고 있었다. 생김새만 같은 게
 * 아니라 규칙이 같다 — 상세에서는 왼쪽이 "닫기", 편집에서는 왼쪽이 "취소"고,
 * 저장 버튼은 처리 중에 "저장 중..."으로 바뀌며 고친 데가 없으면 막힌다.
 * 이 규칙이 모달마다 갈리면 같은 앱에서 저장 버튼이 다르게 동작한다.
 *
 * 가운데 도메인 버튼(종료·복구·삭제·이동)만 모달마다 다르므로 밖에서 받는다.
 *
 * 문구는 여기서만 정한다. 예전에는 카테고리 작성 화면만 "닫기 / 완료"였는데,
 * 같은 동작을 화면마다 다르게 부르면 사용자에게는 다른 일처럼 보인다.
 */

interface ModalActionsProps {
  /** 상세를 보는 중인가. false 면 작성·수정 중이다 */
  isViewing: boolean;
  isSubmitting?: boolean;
  /** 상세의 "닫기" */
  onClose: () => void;
  /** 작성·수정의 "취소". 없으면 닫기와 같게 동작한다 */
  onCancel?: () => void;
  /** 상세의 "수정". 없으면 수정 버튼을 그리지 않는다 */
  onEdit?: () => void;
  /**
   * 저장할 것이 있는가. 고친 데가 없으면 저장 버튼을 막는다.
   *
   * 내용이 비었는지 같은 유효성은 여기에 넣지 않는다. 비활성 버튼은 왜 막혔는지
   * 말해 주지 못하는데, "아무것도 안 고쳤다"와 달리 "제목이 비었다"는 자명하지
   * 않기 때문이다. 그쪽은 눌렀을 때 저장 핸들러가 안내 문구를 띄운다.
   */
  canSubmit?: boolean;
  onSubmit?: () => void;
  /** 닫기와 수정 사이에 들어갈 도메인 버튼들 (삭제·종료·이동 등) */
  children?: ReactNode;
}

export const ModalActions = ({
  isViewing,
  isSubmitting = false,
  onClose,
  onCancel,
  onEdit,
  canSubmit = true,
  onSubmit,
  children,
}: ModalActionsProps) => {
  if (isViewing) {
    return (
      <Stack gap={2} direction="row" wrap justify="between">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          닫기
        </Button>
        {children}
        {onEdit && (
          <Button onClick={onEdit} disabled={isSubmitting}>
            수정
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={2} direction="row" justify="between">
      <Button
        variant="outline"
        onClick={onCancel ?? onClose}
        disabled={isSubmitting}
      >
        취소
      </Button>
      {children}
      <Button onClick={onSubmit} disabled={isSubmitting || !canSubmit}>
        {isSubmitting ? "저장 중..." : "저장"}
      </Button>
    </Stack>
  );
};

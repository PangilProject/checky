import { Button, Stack } from "@/shared/ui/primitives";

interface ButtonSectionProps {
  mode: "VIEW" | "EDIT";
  isSubmitting?: boolean;
  /** VIEW 의 "닫기" — 모달을 닫는다 */
  onClose: () => void;
  /** EDIT 의 "취소" — 수정을 그만둔다. 없으면 닫기와 같게 동작한다 */
  onCancel?: () => void;
  onEdit?: () => void;
  onMove?: () => void;
  /**
   * 저장할 것이 있는가. 고친 데가 없으면 저장 버튼을 막는다.
   *
   * 내용이 비었는지 같은 유효성은 여기에 넣지 않는다. 비활성 버튼은 왜 막혔는지
   * 말해 주지 못하는데, "아무것도 안 고쳤다"와 달리 "제목이 비었다"는 자명하지
   * 않기 때문이다. 그쪽은 눌렀을 때 저장 핸들러가 안내 문구를 띄운다.
   */
  canSubmit?: boolean;
  onSubmit?: () => void;
  onDelete?: () => void;
}

export const ButtonSection = ({
  mode,
  isSubmitting = false,
  onClose,
  onCancel,
  onEdit,
  onMove,
  canSubmit = true,
  onSubmit,
  onDelete,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <Stack gap={2} direction="row" wrap justify="between">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          닫기
        </Button>
        <Button
          variant="outline"
          tone="accent"
          onClick={onMove}
          disabled={isSubmitting}
        >
          이동
        </Button>
        <Button
          variant="outline"
          tone="danger"
          onClick={onDelete}
          disabled={isSubmitting}
        >
          삭제
        </Button>
        <Button onClick={onEdit} disabled={isSubmitting}>
          수정
        </Button>
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
      <Button onClick={onSubmit} disabled={isSubmitting || !canSubmit}>
        {isSubmitting ? "저장 중..." : "저장"}
      </Button>
    </Stack>
  );
};

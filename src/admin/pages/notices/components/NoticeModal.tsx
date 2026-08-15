import { useState } from "react";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { getModalModeTitle } from "@/shared/utils/getModalModeTitle";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import {
  createNotice,
  deleteNotice,
  setNoticePinned,
  updateNotice,
} from "@/shared/api/notice";
import { noticeKeys } from "@/shared/api/keys";
import { toast } from "react-toastify";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type { AdminNotice } from "../hooks/useAdminNotices";
import { Button, Input, Stack, Text, TextArea } from "@/shared/ui/primitives";
import { useDirtyForm } from "@/shared/hooks/useDirtyForm";
import { useEditModalExit } from "@/shared/hooks/useEditModalExit";
import { UnsavedChangesConfirm } from "@/shared/ui/UnsavedChangesConfirm";

const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 2000;

/**
 * 저장했을 때 실제로 나갈 값만 남긴다.
 * 제목과 내용은 trim 해서 저장하므로 공백만 덧붙인 것은 고친 것이 아니다.
 */
const toComparableNoticeValues = (values: {
  title: string;
  content: string;
  pinned: boolean;
}) => ({
  title: values.title.trim(),
  content: values.content.trim(),
  pinned: values.pinned,
});

interface Props {
  mode: "CREATE" | "VIEW" | "EDIT";
  notice?: AdminNotice;
  onClose: () => void;
}

export default function NoticeModal({ mode, notice, onClose }: Props) {
  const queryClient = useQueryClient();

  /** 목록 캐시를 비워 다시 읽게 한다. 사용자 화면도 같은 키를 쓰므로 함께 갱신된다. */
  const refreshNotices = () =>
    queryClient.invalidateQueries({ queryKey: noticeKeys.all });

  const form = useDirtyForm(
    {
      title: notice?.title ?? "",
      content: notice?.content ?? "",
      pinned: notice?.pinned ?? false,
    },
    { comparable: toComparableNoticeValues },
  );
  const { title, content, pinned } = form.values;
  const setTitle = (v: string) => form.patch({ title: v });
  const setContent = (v: string) => form.patch({ content: v });
  const setPinned = (v: boolean) => form.patch({ pinned: v });
  const [currentMode, setCurrentMode] = useState(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isReadOnly = currentMode === "VIEW";
  const { isGuardOpen, requestClose, confirmClose, cancelClose, cancelEdit } =
    useEditModalExit({
      isEditingFromDetail: mode === "VIEW" && currentMode === "EDIT",
      isDirty: form.isDirty,
      onRevertToDetail: () => {
        form.reset();
        setCurrentMode("VIEW");
      },
      onClose,
    });

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("제목을 입력해 주세요.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (currentMode === "CREATE") {
        await createNotice({
          title: trimmedTitle,
          content: content.trim(),
          pinned,
        });
      }

      if (currentMode === "EDIT" && notice) {
        await updateNotice({
          noticeId: notice.id,
          title: trimmedTitle,
          content: content.trim(),
          pinned,
        });
      }

      await refreshNotices();
      onClose();
    } catch {
      toast.error("공지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 상세 화면에서 상단 고정을 바로 전환한다.
   *
   * 고정은 되돌리기 쉬운 설정이라 수정 모드를 거치지 않고 즉시 저장한다.
   * 화면을 먼저 바꾸고 실패하면 되돌려, 저장 결과와 표시가 어긋나지 않게 한다.
   */
  const handleTogglePinned = async () => {
    if (!notice || isSubmitting) return;

    const nextPinned = !pinned;
    setPinned(nextPinned);
    setIsSubmitting(true);
    try {
      await setNoticePinned({ noticeId: notice.id, pinned: nextPinned });
      await refreshNotices();
      // 이미 저장된 값이므로 기준도 함께 옮긴다. 그러지 않으면 닫을 때
      // "수정 중인 내용이 있다"고 잘못 붙잡는다.
      form.commit({ pinned: nextPinned });
    } catch {
      setPinned(!nextPinned);
      toast.error("고정 설정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!notice || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteNotice(notice.id);
      await refreshNotices();
      onClose();
    } catch {
      toast.error("공지 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <ModalWrapper onClose={isSubmitting ? () => {} : requestClose}>
      <ModalTitle text={getModalModeTitle(currentMode, "공지")} />

      {/* 항목 사이 간격은 이 묶음이 소유한다 */}
      <div className="mb-10 flex flex-col gap-10">
        <div>
          <Text variant="body" className="mb-2 font-bold">
            제목
          </Text>
          <Input
            value={title}
            disabled={isReadOnly || isSubmitting}
            maxLength={TITLE_MAX_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Text variant="body" className="mb-2 font-bold">
            내용
          </Text>
          <TextArea
            value={content}
            disabled={isReadOnly || isSubmitting}
            maxLength={CONTENT_MAX_LENGTH}
            onChange={(e) => setContent(e.target.value)}
            className="h-32 resize-none"
          />
        </div>

        {/*
        상세(VIEW)에서는 누르는 즉시 저장하고, 작성·수정 중에는 저장 버튼을 누를 때
        함께 반영한다. 고정 여부를 바꾸려고 수정 모드까지 들어가지 않아도 된다.
      */}
        <Stack gap={2} direction="row" align="center" className="text-sm">
          {/*
          체크박스만 눌리도록 버튼 범위를 아이콘으로 한정한다.
          아이콘이 작아 누르기 어려워지지 않도록 padding 으로 터치 영역을 넓히고,
          음수 margin 으로 보이는 위치는 그대로 유지한다.
          레이블이 버튼 밖으로 나갔으므로 aria-label 로 무엇을 켜는 버튼인지 알린다.
        */}
          <button
            type="button"
            onClick={
              isReadOnly
                ? () => void handleTogglePinned()
                : () => setPinned(!pinned)
            }
            disabled={isSubmitting || (isReadOnly && !notice)}
            aria-pressed={pinned}
            aria-label="상단 고정"
            className="-m-2 p-2 pressable disabled:opacity-40"
          >
            {pinned ? (
              <MdCheckBox size={18} />
            ) : (
              <MdCheckBoxOutlineBlank size={18} />
            )}
          </button>
          <span>상단 고정</span>
        </Stack>
      </div>

      {/* 버튼 */}
      {currentMode === "VIEW" ? (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={requestClose}
            disabled={isSubmitting}
          >
            닫기
          </Button>
          <Button
            variant="outline"
            tone="danger"
            onClick={() => setDeleteOpen(true)}
            disabled={isSubmitting}
          >
            삭제
          </Button>
          <Button
            onClick={() => setCurrentMode("EDIT")}
            disabled={isSubmitting}
          >
            수정
          </Button>
        </div>
      ) : (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={cancelEdit}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={isSubmitting || !form.isDirty}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      )}

      {isGuardOpen && (
        <UnsavedChangesConfirm
          onConfirm={confirmClose}
          onClose={cancelClose}
        />
      )}

      {deleteOpen && (
        <ConfirmModal
          title="공지를 삭제하시겠습니까?"
          description="삭제한 공지는 되돌릴 수 없습니다."
          confirmText="삭제"
          danger
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </ModalWrapper>
  );
}

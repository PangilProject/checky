import { Text } from "@/shared/ui/primitives";
import { BiListCheck } from "react-icons/bi";
import { TaskSettingModal } from "../modals/TaskSettingModal";
import { useState } from "react";
import type { TaskActionType } from "@/shared/constants/taskActions";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateToYmd } from "@/shared/utils/formatDate";
import { useQueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys, taskKeys } from "@/shared/api/keys";
import { moveDay } from "@/shared/utils/dateNavigation";
import {
  collectAffectedMonths,
  recalculateMonthlyStatsByMonth,
} from "@/shared/api/monthlyStats";

import {
  moveUncompletedTasksToDate,
  deleteUncompletedTasks,
  deleteAllTasksByDate,
  copyAllTasksToDate,
} from "@/shared/api/taskSetting";

import { DateSelectModal } from "../modals/DateSelectModal";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { toast } from "react-toastify";

/**
 * 할 일 목록 일괄 작업(이동/복사/삭제) 설정 메뉴를 처리합니다.
 */
export function TaskSetting() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<TaskActionType | null>(
    null,
  );

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();

  const dateString = formatDateToYmd(selectedDate);
  const todayString = formatDateToYmd(new Date());
  const tomorrowDate = moveDay(new Date(), 1);

  const getMonthKey = (date: string) => date.slice(0, 7);

  // 일괄 작업의 집계 반영은 actions.ts 의 증분 패치가 이미 끝냈다.
  // 여기서는 화면이 새 상태를 읽어 오도록 바뀐 날짜·달의 캐시만 정밀하게 비운다.
  // 원본 전체 재계산은 어긋났을 때의 복구 수단("월간 통계 재생성" 메뉴)으로만 쓴다.
  const invalidateTaskCaches = async (dates: string[]) => {
    const uniqueDates = Array.from(new Set(dates));
    const months = collectAffectedMonths({ dates: uniqueDates });
    await Promise.all([
      ...uniqueDates.map((date) =>
        queryClient.invalidateQueries({
          queryKey: taskKeys.byDate(user?.uid ?? "", date),
        }),
      ),
      ...months.map((month) =>
        queryClient.invalidateQueries({
          queryKey: taskKeys.byMonth(user?.uid ?? "", month),
        }),
      ),
      ...months.map((month) =>
        queryClient.invalidateQueries({
          queryKey: monthlyStatsKeys.byMonth(user?.uid ?? "", month),
        }),
      ),
    ]);
  };

  /**
   * 일괄 작업 공통 실행기.
   * 실패 시 조용히 끝나지 않도록 사용자에게 알리고, 모달은 열린 채로 둔다.
   *
   * 대상이 없을 때도 알린다. 옮기거나 지울 할 일이 없으면 API 는 아무 일도 하지
   * 않고 끝나는데, 그대로 두면 확인을 눌러도 화면이 그대로여서 고장으로 보인다.
   * emptyMessage 를 넘긴 작업은 처리 건수가 0일 때 그 이유를 알려 준다.
   */
  const runBulkAction = async (
    action: () => Promise<number | void>,
    failMessage: string,
    emptyMessage?: string,
  ) => {
    try {
      const affected = await action();
      if (emptyMessage && affected === 0) {
        toast.info(emptyMessage);
        return;
      }
      setPendingAction(null);
    } catch {
      toast.error(failMessage);
    }
  };

  const handleConfirmAction = async (action: TaskActionType) => {
    if (!user) return;

    if (
      action === "after" ||
      action === "delete" ||
      action === "delete-all" ||
      action === "copy"
    ) {
      setPendingAction(action);
      setIsOpenModal(false);
      return;
    }

    if (action === "today") {
      await runBulkAction(
        async () => {
          const moved = await moveUncompletedTasksToDate({
            userId: user.uid,
            fromDate: dateString,
            toDate: todayString,
          });
          await invalidateTaskCaches([dateString, todayString]);
          return moved;
        },
        "할 일을 오늘로 옮기지 못했습니다. 잠시 후 다시 시도해 주세요.",
        dateString === todayString
          ? "이미 오늘 목록입니다."
          : "옮길 미완료 할 일이 없습니다.",
      );
    }

    if (action === "recalculate-monthly-stats") {
      const monthKey = getMonthKey(dateString);
      await runBulkAction(async () => {
        await recalculateMonthlyStatsByMonth({
          userId: user.uid,
          month: monthKey,
        });
        await queryClient.invalidateQueries({
          queryKey: monthlyStatsKeys.byMonth(user.uid, monthKey),
        });
      }, "월간 통계 재생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }

    setIsOpenModal(false);
  };

  return (
    <div className="w-full flex items-end flex-col">
      <button
        className="flex items-center gap-1 pressable"
        onClick={() => setIsOpenModal(true)}
      >
        <BiListCheck size={20} />
        <Text variant="bodySm">리스트 메뉴</Text>
      </button>

      {isOpenModal && (
        <TaskSettingModal
          onClose={() => setIsOpenModal(false)}
          onConfirm={handleConfirmAction}
        />
      )}

      {/* after */}
      {pendingAction === "after" && (
        <DateSelectModal
          action={pendingAction}
          initialDate={tomorrowDate}
          onClose={() => setPendingAction(null)}
          onConfirm={async (date) => {
            if (!user) return;
            await runBulkAction(
              async () => {
                const moved = await moveUncompletedTasksToDate({
                  userId: user.uid,
                  fromDate: dateString,
                  toDate: formatDateToYmd(date),
                });
                await invalidateTaskCaches([dateString, formatDateToYmd(date)]);
                return moved;
              },
              "할 일 이동에 실패했습니다. 잠시 후 다시 시도해 주세요.",
              "옮길 미완료 할 일이 없습니다.",
            );
          }}
        />
      )}

      {/* copy */}
      {pendingAction === "copy" && (
        <DateSelectModal
          action={pendingAction}
          initialDate={tomorrowDate}
          onClose={() => setPendingAction(null)}
          onConfirm={async (date) => {
            if (!user) return;
            await runBulkAction(
              async () => {
                const copied = await copyAllTasksToDate({
                  userId: user.uid,
                  fromDate: dateString,
                  toDate: formatDateToYmd(date),
                });
                await invalidateTaskCaches([formatDateToYmd(date)]);
                return copied;
              },
              "할 일 복사에 실패했습니다. 잠시 후 다시 시도해 주세요.",
              "복사할 할 일이 없습니다.",
            );
          }}
        />
      )}

      {/* delete */}
      {pendingAction === "delete" && (
        <ConfirmModal
          title="미완료 할 일을 삭제할까요?"
          description="완료된 할 일은 유지됩니다."
          onClose={() => setPendingAction(null)}
          onConfirm={async () => {
            if (!user) return;
            await runBulkAction(
              async () => {
                const removed = await deleteUncompletedTasks({
                  userId: user.uid,
                  date: dateString,
                });
                await invalidateTaskCaches([dateString]);
                return removed;
              },
              "할 일 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
              "삭제할 미완료 할 일이 없습니다.",
            );
          }}
        />
      )}

      {/* delete-all */}
      {pendingAction === "delete-all" && (
        <ConfirmModal
          title="모든 할 일을 삭제할까요?"
          description="이 작업은 되돌릴 수 없습니다."
          danger
          confirmText="삭제"
          onClose={() => setPendingAction(null)}
          onConfirm={async () => {
            if (!user) return;
            await runBulkAction(
              async () => {
                const removed = await deleteAllTasksByDate({
                  userId: user.uid,
                  date: dateString,
                });
                await invalidateTaskCaches([dateString]);
                return removed;
              },
              "할 일 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
              "삭제할 할 일이 없습니다.",
            );
          }}
        />
      )}
    </div>
  );
}

import { Text2 } from "@/shared/ui/Text";
import { BiListCheck } from "react-icons/bi";
import { TaskSettingModal } from "../modals/TaskSettingModal";
import { useState } from "react";
import type { TaskActionType } from "@/shared/constants/taskActions";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateToYmd } from "@/shared/hooks/formatDate";
import { useQueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys, taskKeys } from "@/shared/api/keys";
import { moveDay } from "@/shared/hooks/dateNavigation";
import {
  collectAffectedMonths,
  rebuildMonthlyStatsByMonth,
  refreshCalendarConsistency,
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
    null
  );

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();

  const dateString = formatDateToYmd(selectedDate);
  const todayString = formatDateToYmd(new Date());
  const tomorrowDate = moveDay(new Date(), 1);

  const getMonthKey = (date: string) => date.slice(0, 7);

  const invalidateTaskCaches = async (dates: string[]) => {
    const uniqueDates = Array.from(new Set(dates));
    const months = collectAffectedMonths({ dates: uniqueDates });
    await Promise.all([
      ...uniqueDates.map((date) =>
        queryClient.invalidateQueries({
          queryKey: taskKeys.byDate(user?.uid ?? "", date),
        })
      ),
      ...months.map((month) =>
        queryClient.invalidateQueries({
          queryKey: taskKeys.byMonth(user?.uid ?? "", month),
        })
      ),
      ...months.map((month) =>
        queryClient.invalidateQueries({
          queryKey: monthlyStatsKeys.byMonth(user?.uid ?? "", month),
        }),
      ),
    ]);

    if (user?.uid) {
      await refreshCalendarConsistency({
        queryClient,
        userId: user.uid,
        affectedMonths: months,
        rebuild: true,
        invalidateTasksByMonth: true,
      });
    }
  };

  /**
   * 일괄 작업 공통 실행기.
   * 실패 시 조용히 끝나지 않도록 사용자에게 알리고, 모달은 열린 채로 둔다.
   */
  const runBulkAction = async (
    action: () => Promise<void>,
    failMessage: string
  ) => {
    try {
      await action();
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
      await runBulkAction(async () => {
        await moveUncompletedTasksToDate({
          userId: user.uid,
          fromDate: dateString,
          toDate: todayString,
        });
        await invalidateTaskCaches([dateString, todayString]);
      }, "할 일을 오늘로 옮기지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (action === "rebuild-monthly-stats") {
      const monthKey = getMonthKey(dateString);
      await runBulkAction(async () => {
        await rebuildMonthlyStatsByMonth({
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
        <Text2 text="리스트 메뉴" />
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
            await runBulkAction(async () => {
              await moveUncompletedTasksToDate({
                userId: user.uid,
                fromDate: dateString,
                toDate: formatDateToYmd(date),
              });
              await invalidateTaskCaches([dateString, formatDateToYmd(date)]);
            }, "할 일 이동에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
            await runBulkAction(async () => {
              await copyAllTasksToDate({
                userId: user.uid,
                fromDate: dateString,
                toDate: formatDateToYmd(date),
              });
              await invalidateTaskCaches([formatDateToYmd(date)]);
            }, "할 일 복사에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
            await runBulkAction(async () => {
              await deleteUncompletedTasks({
                userId: user.uid,
                date: dateString,
              });
              await invalidateTaskCaches([dateString]);
            }, "할 일 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
            await runBulkAction(async () => {
              await deleteAllTasksByDate({
                userId: user.uid,
                date: dateString,
              });
              await invalidateTaskCaches([dateString]);
            }, "할 일 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          }}
        />
      )}
    </div>
  );
}

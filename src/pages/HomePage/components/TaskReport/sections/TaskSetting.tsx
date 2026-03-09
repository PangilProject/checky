import { Text2 } from "@/shared/ui/Text";
import { BiListCheck } from "react-icons/bi";
import { TaskSettingModal } from "../modals/TaskSettingModal";
import { useState } from "react";
import type { TaskActionType } from "@/shared/constants/actionList";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateByDate } from "@/shared/hooks/formatDate";
import { useQueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys, taskKeys } from "@/shared/api/keys";

import {
  moveUncompletedTasksToDate,
  deleteUncompletedTasks,
  deleteAllTasksByDate,
  copyAllTasksToDate,
} from "@/shared/api/taskSetting";

import { DateSelectModal } from "../modals/DateSelectModal";
import { ConfirmModal } from "../modals/ConfirmModal";

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

  const dateString = formatDateByDate(selectedDate);
  const todayString = formatDateByDate(new Date());

  const getMonthKey = (date: string) => date.slice(0, 7);

  const invalidateTaskCaches = async (dates: string[]) => {
    const uniqueDates = Array.from(new Set(dates));
    const months = Array.from(new Set(uniqueDates.map(getMonthKey)));
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
        })
      ),
    ]);
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
      await moveUncompletedTasksToDate({
        userId: user.uid,
        fromDate: dateString,
        toDate: todayString,
      });
      await invalidateTaskCaches([dateString, todayString]);
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
          initialDate={selectedDate}
          onClose={() => setPendingAction(null)}
          onConfirm={async (date) => {
            if (!user) return;
            await moveUncompletedTasksToDate({
              userId: user.uid,
              fromDate: dateString,
              toDate: formatDateByDate(date),
            });
            await invalidateTaskCaches([dateString, formatDateByDate(date)]);
            setPendingAction(null);
          }}
        />
      )}

      {/* copy */}
      {pendingAction === "copy" && (
        <DateSelectModal
          action={pendingAction}
          initialDate={selectedDate}
          onClose={() => setPendingAction(null)}
          onConfirm={async (date) => {
            if (!user) return;
            await copyAllTasksToDate({
              userId: user.uid,
              fromDate: dateString,
              toDate: formatDateByDate(date),
            });
            await invalidateTaskCaches([formatDateByDate(date)]);
            setPendingAction(null);
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
            await deleteUncompletedTasks({
              userId: user.uid,
              date: dateString,
            });
            await invalidateTaskCaches([dateString]);
            setPendingAction(null);
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
            await deleteAllTasksByDate({
              userId: user.uid,
              date: dateString,
            });
            await invalidateTaskCaches([dateString]);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}

import { Text2 } from "@/shared/ui/Text";
import { BiListCheck } from "react-icons/bi";
import { TaskSettingModal } from "./TaskSettingModal";
import { useState } from "react";
import type { TaskActionType } from "@/shared/constants/actionList";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateByDate } from "@/shared/hooks/formatDate";

import {
  moveUncompletedTasksToDate,
  deleteUncompletedTasks,
  deleteAllTasksByDate,
  copyAllTasksToDate,
} from "@/shared/api/taskSetting";

import { DateSelectModal } from "./DateSelectModal";
import { ConfirmModal } from "./ConfirmModal";

export function TaskSetting() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<TaskActionType | null>(
    null
  );

  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();

  const dateString = formatDateByDate(selectedDate);
  const todayString = formatDateByDate(new Date());

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
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}

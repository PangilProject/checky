import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateTaskWithDateMove, type Task } from "@/shared/api/task";
import { taskKeys } from "@/shared/api/keys";
import {
  collectAffectedMonths,
  refreshCalendarConsistency,
} from "@/shared/api/monthlyStats";

/**
 * 할 일을 다른 날짜로 옮기는 경로.
 *
 * 할 일 모달의 "이동"·날짜 수정과 한 주 보기의 끌어 옮기기가 같이 쓴다.
 * 옮긴 뒤 달력 집계를 맞추는 일까지 한 벌로 두어야 어느 쪽으로 옮겨도 달력 숫자가 같다.
 */
export const useTaskDateMove = (userId?: string) => {
  const queryClient = useQueryClient();

  /**
   * 할 일이 다른 날짜로 옮겨진 뒤 달력 집계를 맞춘다.
   *
   * 이동은 두 날짜의 전체·완료·남은 개수가 동시에 움직이고 완료 기록도 따라가므로,
   * 증감을 손으로 계산하지 않고 두 날짜가 걸친 달을 원본에서 다시 센다.
   * 옛 날짜와 새 날짜가 다른 달일 수 있어 둘 다 넘겨야 한다.
   *
   * 다시 세는 쪽이 먼저다. 캐시를 먼저 비우면 아직 낡은 문서를 다시 읽어 온다.
   *
   * 여기서 실패해도 할 일 자체는 이미 옮겨진 뒤다. 실패를 위로 던지면
   * 저장에 실패했다고 잘못 알리게 되므로, 달력만 어긋났다는 사실과
   * 되돌릴 방법을 따로 알린다.
   */
  const syncCalendarAfterDateMove = async (dates: string[]) => {
    if (!userId) return;

    const uniqueDates = Array.from(new Set(dates.filter(Boolean)));

    try {
      await refreshCalendarConsistency({
        queryClient,
        userId,
        affectedMonths: collectAffectedMonths({ dates: uniqueDates }),
        recalculate: true,
        // 할 일만 옮겨졌으므로 task 몫만 다시 세고, 루틴 몫은 기존 집계를 쓴다.
        recalculateScope: "task",
        invalidateTasksByMonth: true,
      });

      await Promise.all(
        uniqueDates.map((date) =>
          queryClient.invalidateQueries({
            queryKey: taskKeys.byDate(userId, date),
          }),
        ),
      );
    } catch {
      toast.error(
        "할 일은 옮겼지만 달력 숫자를 맞추지 못했습니다. 리스트 메뉴의 월간 통계 재생성을 실행해 주세요.",
      );
    }
  };

  /**
   * 제목·시간·분류는 그대로 두고 날짜만 옮긴다.
   *
   * 옮기기 자체가 실패하면 예외를 던진다. 알림과 화면 되돌리기는 호출부가 정한다.
   */
  const moveTaskToDate = async (task: Task, nextDate: string) => {
    if (!userId || !nextDate || nextDate === task.date) return;

    await updateTaskWithDateMove({
      userId,
      taskId: task.id,
      title: task.title,
      ...(task.time ? { time: task.time } : { time: undefined }),
      prevDate: task.date,
      nextDate,
      prevCategoryId: task.categoryId,
      categoryId: task.categoryId,
      categoryColor: task.categoryColor,
    });
    await syncCalendarAfterDateMove([task.date, nextDate]);
  };

  return { syncCalendarAfterDateMove, moveTaskToDate };
};

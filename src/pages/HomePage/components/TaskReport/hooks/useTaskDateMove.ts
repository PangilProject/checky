import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  markTaskMonthsStale,
  updateTaskWithDateMove,
  type Task,
} from "@/shared/api/task";
import { taskKeys } from "@/shared/api/keys";
import {
  collectAffectedMonths,
  patchMonthlyStatsByDayDeltas,
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
   * 옛 날짜에서 하나 빼고 새 날짜에 하나 더한다. 완료였다면 완료 수도 함께 옮긴다.
   * 완료 여부는 updateTaskWithDateMove 가 기록을 옮기며 서버에서 읽은 값이라 화면 캐시에 기대지 않는다.
   * 예전에는 그달 할 일·기록을 전부 다시 셌는데, 끌어 옮기기가 흔해지면서
   * 비용이 그달에 쌓인 할 일 수에 비례해 커져 증분으로 바꿨다 (비용 이슈 15).
   *
   * 두 패치는 차례로 보낸다. 같은 달이면 같은 문서라 동시에 보내면 트랜잭션이 서로 부딪힌다.
   * 집계 문서가 없는 달은 패치가 아무것도 하지 않고, 달력이 열릴 때 원본에서 새로 센다.
   *
   * 여기서 실패해도 할 일 자체는 이미 옮겨진 뒤다. 실패를 위로 던지면
   * 저장에 실패했다고 잘못 알리게 되므로, 달력만 어긋났다는 사실과
   * 되돌릴 방법을 따로 알린다.
   */
  const syncCalendarAfterDateMove = async ({
    prevDate,
    nextDate,
    wasCompleted,
  }: {
    prevDate: string;
    nextDate: string;
    wasCompleted: boolean;
  }) => {
    if (!userId || !prevDate || !nextDate || prevDate === nextDate) return;

    const done = wasCompleted ? 1 : 0;

    try {
      await patchMonthlyStatsByDayDeltas({
        userId,
        month: prevDate.slice(0, 7),
        day: prevDate.slice(8, 10),
        totalDelta: -1,
        completedDelta: -done,
        remainingDelta: -(1 - done),
      });
      await patchMonthlyStatsByDayDeltas({
        userId,
        month: nextDate.slice(0, 7),
        day: nextDate.slice(8, 10),
        totalDelta: 1,
        completedDelta: done,
        remainingDelta: 1 - done,
      });

      await refreshCalendarConsistency({
        queryClient,
        userId,
        affectedMonths: collectAffectedMonths({ dates: [prevDate, nextDate] }),
        invalidateTasksByMonth: true,
      });

      await Promise.all([
        ...[prevDate, nextDate].map((date) =>
          queryClient.invalidateQueries({
            queryKey: taskKeys.byDate(userId, date),
          }),
        ),
        // 완료 기록도 새 날짜로 옮겨졌으므로 기록 화면이 읽는 달 캐시도 낡음 표시한다
        markTaskMonthsStale({
          queryClient,
          userId,
          dates: [prevDate, nextDate],
          tasks: false,
          logs: true,
        }),
      ]);
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

    const { wasCompleted } = await updateTaskWithDateMove({
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
    await syncCalendarAfterDateMove({ prevDate: task.date, nextDate, wasCompleted });
  };

  return { syncCalendarAfterDateMove, moveTaskToDate };
};

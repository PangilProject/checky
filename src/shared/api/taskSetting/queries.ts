import { getDocs, query, where } from "firebase/firestore/lite";
import { taskLogsRef } from "./refs";

/**
 * 하루치 할 일을 읽는 함수는 여기 두지 않는다.
 *
 * 예전에는 이 파일에도 `getTasksByDateOnce` 가 있었다. 이름·매개변수·반환 타입이
 * task 도메인의 것과 완전히 같은데 문서를 옮기는 방식만 달랐다.
 * 그쪽은 `mapTaskDoc` 으로 `createdAt` 을 Date 로 바꿔 주는데 여기는 그러지 않아,
 * `Task` 라고 적혀 있지만 `createdAt` 이 Firestore Timestamp 인 값을 돌려줬다.
 *
 * 겉모습이 같아 자동 완성으로 어느 쪽이 들어와도 타입 검사가 통과했고,
 * 잘못 고르면 화면에서 `createdAt.getFullYear is not a function` 으로 터진다.
 * 그래서 중복을 없애고 `@/shared/api/task` 의 것 하나만 쓴다.
 */

type TaskLogRecord = {
  taskId: string;
  completed: boolean;
};

/**
 * 날짜 기준 완료된 태스크 ID를 조회합니다.
 */
export const getCompletedTaskIdsByDate = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<Set<string>> => {
  const logsSnap = await getDocs(
    query(taskLogsRef(userId), where("date", "==", date))
  );

  const completedTaskIds = new Set(
    logsSnap.docs
      .map((doc) => doc.data() as TaskLogRecord)
      .filter((log) => log.completed)
      .map((log) => log.taskId)
  );

  return completedTaskIds;
};

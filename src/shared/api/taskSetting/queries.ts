import { getDocs, query, where } from "firebase/firestore/lite";
import { taskLogsRef } from "@/shared/api/taskLog/refs";

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

export type TaskLogRecord = {
  id: string;
  taskId: string;
  completed: boolean;
};

/**
 * 하루치 완료 기록을 문서 ID 와 함께 읽는다.
 *
 * 일괄 작업이 완료 여부 판별과 기록 삭제에 같은 결과를 쓴다.
 * ID 를 함께 돌려줘야 지운 할 일의 기록을 추가 조회 없이 같이 지울 수 있다.
 */
export const getTaskLogRecordsByDate = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<TaskLogRecord[]> => {
  const logsSnap = await getDocs(
    query(taskLogsRef(userId), where("date", "==", date))
  );

  return logsSnap.docs.map((doc) => {
    const data = doc.data() as { taskId: string; completed: boolean };
    return { id: doc.id, taskId: data.taskId, completed: data.completed };
  });
};

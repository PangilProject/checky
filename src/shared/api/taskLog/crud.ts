import { serverTimestamp, setDoc, updateDoc } from "firebase/firestore/lite";
import { taskLogRef } from "./refs";
import type { TaskLog } from "./types";

/**
 * 할 일의 완료 여부를 뒤집는다.
 *
 * 문서 ID 를 `{taskId}_{date}` 로 고정해, 같은 날 같은 할 일의 기록이
 * 두 개 생기지 않게 한다. 연타로 요청이 겹쳐도 결과가 하나로 모인다.
 *
 * currentLog 가 없거나 화면이 임시로 만든 값(`temp-` 접두사)이면 곧바로 병합 저장한다.
 * 있으면 갱신을 시도하고, 문서가 이미 사라진 경우에는 고정 ID 로 다시 저장한다.
 */
export const toggleTaskLog = async ({
  userId,
  taskId,
  date,
  currentLog,
}: {
  userId: string;
  taskId: string;
  date: string;
  currentLog?: TaskLog;
}) => {
  const canonicalLogRef = taskLogRef(userId, `${taskId}_${date}`);
  const nextCompleted = currentLog ? !currentLog.completed : true;

  if (!currentLog || currentLog.id.startsWith("temp-")) {
    await setDoc(
      canonicalLogRef,
      {
        taskId,
        date,
        completed: nextCompleted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  try {
    await updateDoc(taskLogRef(userId, currentLog.id), {
      completed: nextCompleted,
      updatedAt: serverTimestamp(),
    });
  } catch {
    await setDoc(
      canonicalLogRef,
      {
        taskId,
        date,
        completed: nextCompleted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

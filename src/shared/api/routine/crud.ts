import {
  addDoc,
  deleteField,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { routineRef, routinesRef } from "./refs";
import { routineLogsRef } from "@/shared/api/routineLog/refs";
import type { RoutineScheduleHistoryItem } from "./types";

/**
 * 루틴을 만든다.
 *
 * 같은 분류에서 순서 값이 가장 큰 루틴 하나만 읽어 그 뒤에 놓는다.
 * routines(categoryId, orderIndex DESC) 복합 인덱스가 필요하다.
 * 개수를 세면 안 된다. 루틴을 하나 지우면 개수가 줄어들어
 * 이미 그 번호를 쓰고 있는 루틴과 값이 겹치고, 새 루틴이 목록 가운데 끼어든다.
 *
 * 시작 시점의 반복 요일을 scheduleHistory 첫 항목으로 함께 남긴다.
 * @returns 생성 결과
 */
export const createRoutine = async ({
  userId,
  title,
  categoryId,
  days,
  startDate,
  endDate,
}: {
  userId: string;
  title: string;
  categoryId: string;
  days: number[];
  startDate: string;
  endDate?: string;
}) => {
  const routinesCollection = routinesRef(userId);

  const snap = await getDocs(
    query(
      routinesCollection,
      where("categoryId", "==", categoryId),
      orderBy("orderIndex", "desc"),
      limit(1)
    )
  );

  const maxOrderIndex = snap.docs[0]?.data().orderIndex;
  const orderIndex =
    typeof maxOrderIndex === "number" ? maxOrderIndex + 1 : 0;

  await addDoc(routinesCollection, {
    title,
    categoryId,
    days,
    scheduleHistory: [{ effectiveFrom: startDate, days }],
    startDate,
    ...(endDate !== undefined && endDate !== "" && { endDate }),
    orderIndex,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });
};

/**
 * 루틴을 고친다.
 *
 * 반복 요일이 바뀌면 scheduleHistory 에 이력을 더해, 지난 기록이 예전 요일 기준으로 남게 한다.
 */
export const updateRoutine = async ({
  userId,
  routineId,
  title,
  days,
  scheduleHistory,
  endDate,
}: {
  userId: string;
  routineId: string;
  title: string;
  days: number[];
  scheduleHistory: RoutineScheduleHistoryItem[];
  endDate?: string | null;
}) => {
  await updateDoc(routineRef(userId, routineId), {
    title,
    days,
    scheduleHistory,
    ...(endDate === undefined
      ? {}
      : endDate
        ? { endDate }
        : { endDate: deleteField() }),
    updatedAt: serverTimestamp(),
  });
};

/**
 * 루틴과 그 수행 기록(routineLogs)을 함께 지운다.
 *
 * 기록을 남겨 두면 화면에는 안 나오지만, 월간 재계산과 주간 리포트가
 * 그 달·그 주의 기록을 읽을 때마다 영원히 과금된다.
 * 배치 한도(500)를 넘지 않도록 나눠 지우고, 루틴 문서는 마지막 배치에 넣어
 * 중간에 실패해도 루틴 없는 고아 기록이 새로 생기지 않게 한다.
 */
export const deleteRoutine = async ({
  userId,
  routineId,
}: {
  userId: string;
  routineId: string;
}) => {
  const logsSnap = await getDocs(
    query(routineLogsRef(userId), where("routineId", "==", routineId))
  );

  // 기록을 앞에, 루틴 문서를 맨 뒤에 두어 중간 실패 시 고아 기록이 늘지 않게 한다.
  const refsToDelete = [
    ...logsSnap.docs.map((logDoc) => logDoc.ref),
    routineRef(userId, routineId),
  ];

  const BATCH_LIMIT = 500;
  for (let start = 0; start < refsToDelete.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    refsToDelete
      .slice(start, start + BATCH_LIMIT)
      .forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
};

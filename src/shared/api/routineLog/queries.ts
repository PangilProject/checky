import { documentId, getDocs, query, where } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { routineLogsRef } from "./refs";
import type { RoutineLog } from "./types";

/**
 * 루틴 하나의 기간 기록을 읽는다. 루틴 기록 창이 쓴다.
 *
 * 문서 ID(`{routineId}_{date}`) 범위로 읽는다. 루틴 기록은 처음 쓰기부터 이 고정 ID 로
 * 만들어졌고(toggleRoutineLog), 루틴 ID 는 밑줄 없는 같은 길이의 자동 ID 라 다른 루틴이 범위에 섞이지 않는다.
 * 필드 조건(routineId == + date 범위)으로 읽으면 복합 인덱스가 필요하고,
 * 인덱스가 만들어지기 전에는 400 으로 실패한다. ID 범위는 인덱스 없이 된다.
 * 읽기는 그 기간에 남긴 기록 수만큼이다(해제한 기록도 문서가 남아 함께 센다).
 */
export const getRoutineLogsByRoutineOnce = async ({
  userId,
  routineId,
  startDate,
  endDate,
}: {
  userId: string;
  routineId: string;
  startDate: string;
  endDate: string;
}): Promise<RoutineLog[]> => {
  const perf = baselineFetch("routineLogs/fetch/byRoutine", {
    userId,
    routineId,
    startDate,
    endDate,
  });
  const q = query(
    routineLogsRef(userId),
    where(documentId(), ">=", `${routineId}_${startDate}`),
    where(documentId(), "<=", `${routineId}_${endDate}`),
  );

  const snap = await getDocs(q);
  const logs = snap.docs
    .map((doc) => mapDoc<RoutineLog>(doc))
    // ID 규칙이 어긋난 문서가 있더라도 다른 루틴의 기록은 세지 않는다
    .filter((log) => log.routineId === routineId);
  perf.end({ count: logs.length });
  return logs;
};

/**
 * 기간의 모든 루틴 기록을 읽는다. 기록 화면이 루틴별 수행을 셀 때 쓴다.
 *
 * date 한 필드의 범위 조건이라 복합 인덱스가 필요 없다.
 */
export const getRoutineLogsByRangeOnce = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<RoutineLog[]> => {
  const perf = baselineFetch("routineLogs/fetch/byRange", {
    userId,
    startDate,
    endDate,
  });
  const q = query(
    routineLogsRef(userId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );

  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => mapDoc<RoutineLog>(doc));
  perf.end({ count: logs.length });
  return logs;
};

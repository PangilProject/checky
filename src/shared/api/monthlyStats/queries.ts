/**
 * @file monthlyStats/queries.ts
 * @description API 모듈
 */

import { getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { monthlyStatsDocRef } from "./refs";
import type { MonthlyActivitySummary, MonthlyStats } from "./types";

export const getMonthlyStatsByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<MonthlyStats | null> => {
  const perf = baselineFetch("monthlyStats/fetch/byMonth", { userId, month });
  const snap = await getDoc(monthlyStatsDocRef(userId, month));

  if (!snap.exists()) {
    perf.end({ count: 0, exists: false });
    return null;
  }

  const data = snap.data() as MonthlyStats;
  perf.end({ count: Object.keys(data.days ?? {}).length, exists: true });
  return data;
};

export const upsertMonthlyStatsByMonth = async ({
  userId,
  month,
  days,
}: {
  userId: string;
  month: string;
  days: Record<string, MonthlyActivitySummary>;
}) => {
  await setDoc(
    monthlyStatsDocRef(userId, month),
    {
      month,
      days,
      version: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const replaceMonthlyStatsByMonth = async ({
  userId,
  month,
  days,
}: {
  userId: string;
  month: string;
  days: Record<string, MonthlyActivitySummary>;
}) => {
  await setDoc(monthlyStatsDocRef(userId, month), {
    month,
    days,
    version: 1,
    updatedAt: serverTimestamp(),
  });
};

export const patchMonthlyStatsCompletionByDay = async ({
  userId,
  month,
  day,
  completedDelta,
}: {
  userId: string;
  month: string;
  day: string;
  completedDelta: 1 | -1;
}) => {
  const ref = monthlyStatsDocRef(userId, month);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as MonthlyStats;
  const current = data.days?.[day];
  if (!current) return;

  const completed = Math.max((current.completed ?? 0) + completedDelta, 0);
  const total = Math.max(current.total ?? 0, 0);
  const remaining = Math.max(total - completed, 0);

  await setDoc(
    ref,
    {
      days: {
        [day]: {
          ...current,
          completed,
          remaining,
          hasActivity: total > 0,
        },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const patchMonthlyStatsByDayDeltas = async ({
  userId,
  month,
  day,
  totalDelta,
  completedDelta,
  remainingDelta,
}: {
  userId: string;
  month: string;
  day: string;
  totalDelta: number;
  completedDelta: number;
  remainingDelta: number;
}) => {
  if (!totalDelta && !completedDelta && !remainingDelta) return;

  const ref = monthlyStatsDocRef(userId, month);
  const snap = await getDoc(ref);
  const data = (snap.exists() ? snap.data() : null) as MonthlyStats | null;
  const current = data?.days?.[day];

  const nextTotal = Math.max((current?.total ?? 0) + totalDelta, 0);
  const nextCompleted = Math.max(
    (current?.completed ?? 0) + completedDelta,
    0
  );
  const nextRemaining = Math.max(
    (current?.remaining ?? 0) + remainingDelta,
    0
  );

  await setDoc(
    ref,
    {
      month,
      days: {
        [day]: {
          total: nextTotal,
          completed: Math.min(nextCompleted, nextTotal),
          remaining: Math.min(nextRemaining, nextTotal),
          hasActivity: nextTotal > 0,
        },
      },
      version: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

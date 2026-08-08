import { getDocs, orderBy, query, where } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { categoriesRef } from "./refs";
import type { Category, CategoryStatus } from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";

/**
 * 분류를 사용자가 정한 순서대로 읽는다.
 *
 * status 를 주면 사용 중인 것만, 또는 종료한 것만 걸러 온다.
 * categories(status, orderIndex) 복합 인덱스가 필요하다.
 */
export const getCategoriesOnce = async ({
  userId,
  status,
}: {
  userId: string;
  status?: CategoryStatus;
}): Promise<Category[]> => {
  const perf = baselineFetch("categories/fetch", { userId, status });

  const baseRef = categoriesRef(userId);
  const q = status
    ? query(baseRef, where("status", "==", status), orderBy("orderIndex", "asc"))
    : query(baseRef, orderBy("orderIndex", "asc"));

  const snap = await getDocs(q);
  const categories = snap.docs.map((doc) => mapDoc<Category>(doc));
  perf.end({ count: categories.length });
  return categories;
};

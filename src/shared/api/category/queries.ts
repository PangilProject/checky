import { getDocs, orderBy, query, where } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { categoriesRef } from "./refs";
import type { Category, CategoryStatus } from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";

/**
 * @description 카테고리를 1회 조회합니다.
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

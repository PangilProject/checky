import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { mapDoc } from "@/shared/api/_common/mappers";
import { categoriesRef } from "./refs";
import type { Category, CategoryStatus } from "./types";

interface GetCategoriesParams {
  userId: string;
  status?: CategoryStatus; // 없으면 전체
  onChange: (categories: Category[]) => void;
}

/**
 * 카테고리 실시간 구독
 * - 전체 / ACTIVE / ENDED 모두 대응
 * - createdAt 기준 최신순 정렬
 */
export const getCategories = ({
  userId,
  status,
  onChange,
}: GetCategoriesParams) => {
  const baseRef = categoriesRef(userId);

  const q = status
    ? query(
        baseRef,
        where("status", "==", status),
        orderBy("orderIndex", "asc"),
      )
    : query(baseRef, orderBy("orderIndex", "asc"));

  const categories = onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => mapDoc<Category>(doc));

    onChange(list);
  });

  return categories;
};

/**
 * @file category/subscribe.ts
 * @description API 모듈
 */

import { orderBy, query, where } from "firebase/firestore/lite";
import { subscribeWithSafariFallback } from "@/shared/api/_common/subscribeWithSafariFallback";
import { mapDoc } from "@/shared/api/_common/mappers";
import { categoriesRef } from "./refs";
import type { Category, CategoryStatus } from "./types";
import { baselineSubscribe } from "@/shared/utils/perfBaseline";

interface GetCategoriesParams {
  userId: string;
  status?: CategoryStatus;
  onChange: (categories: Category[]) => void;
}

/**
 * @description 카테고리를 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
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

  const perf = baselineSubscribe("categories/subscribe", { userId, status });

  const categories = subscribeWithSafariFallback(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => mapDoc<Category>(doc));

    perf.onSnapshot(list.length);
    onChange(list);
  });

  return () => {
    perf.onUnsubscribe();
    categories();
  };
};

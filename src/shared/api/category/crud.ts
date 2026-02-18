/**
 * @file category/crud.ts
 * @description API 모듈
 */

import {
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore/lite";
import { categoriesRef, categoryRef } from "./refs";

interface CreateCategoryParams {
  userId: string;
  name: string;
  color: string;
}

/**
 * @description 카테고리를 생성합니다.
 * @param params 요청 파라미터
 * @returns 생성 결과
 */
export const createCategory = async ({
  userId,
  name,
  color,
}: CreateCategoryParams) => {
  const baseRef = categoriesRef(userId);

  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  const orderIndex = snap.size;

  const nextRef = doc(baseRef);

  await setDoc(nextRef, {
    id: nextRef.id,
    name,
    color,
    status: "ACTIVE",
    orderIndex,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    endedAt: null,
  });
};

/**
 * @description 카테고리 정보를 수정합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const updateCategory = async ({
  userId,
  categoryId,
  name,
  color,
}: {
  userId: string;
  categoryId: string;
  name: string;
  color: string;
}) => {
  await updateDoc(categoryRef(userId, categoryId), {
    name,
    color,
    updatedAt: serverTimestamp(),
  });
};

interface EndCategoryParams {
  userId: string;
  categoryId: string;
}

/**
 * @description 카테고리를 종료 상태로 변경합니다.
 * @param params 요청 파라미터
 * @returns 반환값
 */
export const endCategory = async ({
  userId,
  categoryId,
}: EndCategoryParams) => {
  await updateDoc(categoryRef(userId, categoryId), {
    status: "ENDED",
    updatedAt: serverTimestamp(),
    endedAt: serverTimestamp(),
  });
};

interface RestoreCategoryParams {
  userId: string;
  categoryId: string;
}

/**
 * @description 카테고리를 활성 상태로 복구합니다.
 * @param params 요청 파라미터
 * @returns 반환값
 */
export const restoreCategory = async ({
  userId,
  categoryId,
}: RestoreCategoryParams) => {
  const baseRef = categoriesRef(userId);

  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  await updateDoc(categoryRef(userId, categoryId), {
    status: "ACTIVE",
    orderIndex: snap.size,
    updatedAt: serverTimestamp(),
  });
};

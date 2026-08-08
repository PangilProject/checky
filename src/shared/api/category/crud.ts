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
 * 분류를 만든다.
 *
 * 목록 맨 뒤에 붙이려고 활성 분류 개수를 먼저 읽어 orderIndex 로 쓴다.
 * 읽기 1회 + 쓰기 1회다.
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
 * 종료한 분류를 다시 활성으로 되돌린다.
 *
 * 종료 전 순서는 남겨 두지 않으므로 목록 맨 뒤로 간다.
 * 그 자리를 정하려고 활성 분류 개수를 먼저 읽는다.
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

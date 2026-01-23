import {
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { categoriesRef, categoryRef } from "./refs";

interface CreateCategoryParams {
  userId: string;
  name: string;
  color: string;
}

// 카테고리 생성
export const createCategory = async ({
  userId,
  name,
  color,
}: CreateCategoryParams) => {
  const baseRef = categoriesRef(userId);

  // 현재 ACTIVE 카테고리 개수 가져오기
  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  const orderIndex = snap.size; // 마지막에 추가

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

// 카테고리 수정
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

// 카테고리 삭제
interface EndCategoryParams {
  userId: string;
  categoryId: string;
}

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

// 카테고리 복구
interface RestoreCategoryParams {
  userId: string;
  categoryId: string;
}

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

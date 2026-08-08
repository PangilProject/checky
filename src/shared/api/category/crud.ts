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

/**
 * 목록 맨 뒤에 붙일 순서 값을 구한다.
 *
 * 개수를 세면 안 된다. 가운데 분류를 종료하면 활성 개수가 줄어들어,
 * 이미 그 번호를 쓰고 있는 분류와 값이 겹친다. 겹치면 새 항목이 맨 뒤가 아니라
 * 기존 항목 사이에 끼어든다. 지금 있는 값 중 가장 큰 것에 1 을 더해야 한다.
 */
const nextOrderIndex = (docs: { data: () => { orderIndex?: unknown } }[]) => {
  const indexes = docs
    .map((docSnap) => docSnap.data().orderIndex)
    .filter((value): value is number => typeof value === "number");

  return indexes.length === 0 ? 0 : Math.max(...indexes) + 1;
};

interface CreateCategoryParams {
  userId: string;
  name: string;
  color: string;
}

/**
 * 분류를 만들어 목록 맨 뒤에 붙인다.
 *
 * 붙일 자리를 정하려고 활성 분류를 먼저 읽어 가장 큰 순서 값 뒤에 놓는다.
 * 읽기 1회 + 쓰기 1회다.
 */
export const createCategory = async ({
  userId,
  name,
  color,
}: CreateCategoryParams) => {
  const baseRef = categoriesRef(userId);

  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  const orderIndex = nextOrderIndex(snap.docs);

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
 * 분류의 이름과 색을 바꾼다. 순서와 상태는 건드리지 않는다.
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
 * 분류를 종료 상태로 바꾼다.
 *
 * 지우지 않고 상태만 바꾸므로 이미 쌓인 할 일과 루틴 기록은 그대로 남는다.
 * 새로 만들 때만 고를 수 없게 된다.
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
 * 그 자리를 정하려고 활성 분류를 먼저 읽어 가장 큰 순서 값 뒤에 놓는다.
 */
export const restoreCategory = async ({
  userId,
  categoryId,
}: RestoreCategoryParams) => {
  const baseRef = categoriesRef(userId);

  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  await updateDoc(categoryRef(userId, categoryId), {
    status: "ACTIVE",
    orderIndex: nextOrderIndex(snap.docs),
    updatedAt: serverTimestamp(),
  });
};

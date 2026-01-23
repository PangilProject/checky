import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  getDocs,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

export type CategoryStatus = "ACTIVE" | "ENDED";

export interface Category {
  id: string;
  name: string;
  color: string;
  status: CategoryStatus;
  orderIndex: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  endedAt: Timestamp | null;
}

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
  const baseRef = collection(db, "users", userId, "categories");

  // 현재 ACTIVE 카테고리 개수 가져오기
  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  const orderIndex = snap.size; // 마지막에 추가

  const categoryRef = doc(baseRef);

  await setDoc(categoryRef, {
    id: categoryRef.id,
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
  await updateDoc(doc(db, "users", userId, "categories", categoryId), {
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
  const categoryRef = doc(db, "users", userId, "categories", categoryId);

  await updateDoc(categoryRef, {
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
  const baseRef = collection(db, "users", userId, "categories");

  const snap = await getDocs(query(baseRef, where("status", "==", "ACTIVE")));

  await updateDoc(doc(baseRef, categoryId), {
    status: "ACTIVE",
    orderIndex: snap.size,
    updatedAt: serverTimestamp(),
  });
};

/*

*/

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
  const baseRef = collection(db, "users", userId, "categories");

  const q = status
    ? query(
        baseRef,
        where("status", "==", status),
        orderBy("orderIndex", "asc")
      )
    : query(baseRef, orderBy("orderIndex", "asc"));

  const categories = onSnapshot(q, (snapshot) => {
    const categories: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Category, "id">),
    }));

    onChange(categories);
  });

  return categories;
};

/*
: 위의 코드 사용 예시
useEffect(() => {
  if (!user) return;

  const unsubscribe = subscribeCategories({
    userId: user.uid,
    status: "ACTIVE",
    onChange: setActiveCategories,
  });

  return () => unsubscribe();
}, [user]);
*/

// 카테고리 순번 바꾸기
export const updateCategoryOrder = async ({
  userId,
  categories,
}: {
  userId: string;
  categories: { id: string; orderIndex: number }[];
}) => {
  const batch = writeBatch(db);

  categories.forEach(({ id, orderIndex }) => {
    batch.update(doc(db, "users", userId, "categories", id), { orderIndex });
  });

  await batch.commit();
};

// export const migrateCategoryOrderIndex = async (userId: string) => {
//   const baseRef = collection(db, "users", userId, "categories");

//   // 기존 카테고리 전체 가져오기 (정렬 기준 아무거나)
//   const snap = await getDocs(query(baseRef, orderBy("createdAt", "asc")));

//   const batch = writeBatch(db);

//   snap.docs.forEach((docSnap, index) => {
//     const data = docSnap.data();

//     // 이미 orderIndex 있으면 스킵
//     if (typeof data.orderIndex === "number") return;

//     batch.update(docSnap.ref, {
//       orderIndex: index,
//       updatedAt: serverTimestamp(),
//     });
//   });

//   await batch.commit();
// };

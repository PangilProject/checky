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
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

export type CategoryStatus = "ACTIVE" | "ENDED";

export interface Category {
  id: string;
  name: string;
  color: string;
  status: CategoryStatus;
  createdAt: any;
  updatedAt: any;
  endedAt: any;
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
  const categoryRef = doc(collection(db, "users", userId, "categories"));

  const category: Category = {
    id: categoryRef.id,
    name,
    color,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    endedAt: serverTimestamp(),
  };

  await setDoc(categoryRef, category);

  return category;
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
  const categoryRef = doc(db, "users", userId, "categories", categoryId);

  await updateDoc(categoryRef, {
    status: "ACTIVE",
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
        orderBy("createdAt", "desc")
      )
    : query(baseRef, orderBy("createdAt", "desc"));

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

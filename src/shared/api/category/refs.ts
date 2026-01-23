import { userCollection, userDoc } from "@/shared/api/_common/refs";

export const categoriesRef = (userId: string) =>
  userCollection(userId, "categories");

export const categoryRef = (userId: string, categoryId: string) =>
  userDoc(userId, "categories", categoryId);

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Category } from "./types";

export const mapCategory = (
  docSnap: QueryDocumentSnapshot<DocumentData>
): Category => ({
  id: docSnap.id,
  ...(docSnap.data() as Omit<Category, "id">),
});

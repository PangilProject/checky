import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Routine } from "./types";

export const mapRoutine = (
  docSnap: QueryDocumentSnapshot<DocumentData>
): Routine => ({
  id: docSnap.id,
  ...(docSnap.data() as Omit<Routine, "id">),
});

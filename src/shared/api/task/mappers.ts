import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Task } from "./types";

export const mapTask = (
  docSnap: QueryDocumentSnapshot<DocumentData>
): Task => ({
  id: docSnap.id,
  ...(docSnap.data() as Omit<Task, "id">),
});

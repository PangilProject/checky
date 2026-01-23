import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { TaskLog } from "./types";

export const mapTaskLog = (
  docSnap: QueryDocumentSnapshot<DocumentData>
): TaskLog => ({
  id: docSnap.id,
  ...(docSnap.data() as Omit<TaskLog, "id">),
});

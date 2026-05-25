import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Task } from "./types";

type FirestoreTimestamp = {
  toDate?: () => Date;
};

export const mapTaskDoc = (
  doc: QueryDocumentSnapshot<DocumentData>
): Task => {
  const task = mapDoc<Task>(doc);
  const createdAt = (doc.data().createdAt as FirestoreTimestamp | undefined)?.toDate?.();

  return {
    ...task,
    ...(createdAt ? { createdAt } : {}),
  };
};

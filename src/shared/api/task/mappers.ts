import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Task } from "./types";

/**
 * 할 일 문서를 Task 로 바꾼다.
 *
 * createdAt 의 Timestamp -> Date 변환은 이제 mapDoc 이 공통으로 처리한다.
 * 이 매퍼는 "Task 는 반드시 매퍼를 거친다"는 진입점 규약을 유지하기 위해 남겨 둔다.
 */
export const mapTaskDoc = (doc: QueryDocumentSnapshot<DocumentData>): Task =>
  mapDoc<Task>(doc);

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore/lite";

const isTimestampLike = (value: unknown): value is { toDate: () => Date } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { toDate?: unknown }).toDate === "function";

/**
 * Firestore 문서를 도메인 타입으로 바꾼다.
 *
 * 최상위 필드의 Timestamp 는 Date 로 바꿔 준다. 그대로 흘려보내면
 * Date 라고 선언된 필드에 Timestamp 가 들어가, 소비처가 getFullYear 등을
 * 부르는 순간 터진다 (과거 createdAt 사고가 그 경우다). 중첩 객체 안까지는
 * 들어가지 않으므로, 중첩 필드에 Timestamp 를 두려면 소비처에서 직접 다뤄야 한다.
 *
 * 저장된 데이터가 T 의 모양이라고 믿고 그대로 단언한다. 검증하지 않으므로,
 * 필드를 추가하거나 이름을 바꿀 때 기존 문서에 그 필드가 없으면 런타임에 undefined 가 된다.
 */
export const mapDoc = <T extends { id: string }>(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): T => {
  const converted: DocumentData = {};
  Object.entries(docSnap.data()).forEach(([key, value]) => {
    converted[key] = isTimestampLike(value) ? value.toDate() : value;
  });

  return {
    id: docSnap.id,
    ...converted,
  } as T;
};

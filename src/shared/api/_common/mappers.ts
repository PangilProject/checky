import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore/lite";

/**
 * Firestore 문서를 도메인 타입으로 바꾼다.
 *
 * 저장된 데이터가 T 의 모양이라고 믿고 그대로 단언한다. 검증하지 않으므로,
 * 필드를 추가하거나 이름을 바꿀 때 기존 문서에 그 필드가 없으면 런타임에 undefined 가 된다.
 */
export const mapDoc = <T extends { id: string }>(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): T =>
  ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<T, "id">),
  }) as T;

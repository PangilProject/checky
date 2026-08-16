import { writeBatch, type DocumentReference } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";

/**
 * 정렬 순서를 한 번에 저장한다.
 *
 * 배치 쓰기라 전부 반영되거나 전부 실패한다. 순서가 절반만 바뀌는 일은 없다.
 * Firestore 배치 한도가 500건이므로 한 번에 넘기는 항목이 그보다 적어야 한다.
 *
 * 분류·루틴·할 일이 각자 같은 코드를 들고 있었다. 한도 방어나 배치 방식이
 * 바뀔 때 손댈 곳을 하나로 두려고 여기 모았다.
 *
 * @param docRefOf 항목 id 로 문서 레퍼런스를 만드는 함수
 * @param items 저장할 항목들의 새 orderIndex
 */
export const updateOrderBatch = async (
  docRefOf: (id: string) => DocumentReference,
  items: { id: string; orderIndex: number }[],
) => {
  const batch = writeBatch(db);

  items.forEach(({ id, orderIndex }) => {
    batch.update(docRefOf(id), { orderIndex });
  });

  await batch.commit();
};

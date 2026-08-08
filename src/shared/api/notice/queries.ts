import { getDocs, orderBy, query } from "firebase/firestore/lite";
import { noticesRef } from "./refs";
import type { Notice } from "./types";

/**
 * 공지를 고정 항목이 위로 오도록 정렬해 읽는다.
 *
 * notices(pinned DESC, createdAt DESC) 복합 인덱스가 필요하다.
 * 사용자 화면과 관리자 화면이 같은 목록을 쓰므로 정렬도 한곳에서만 정한다.
 * 결과가 없으면 빈 배열이며 예외를 던지지 않는다.
 */
export const getNoticesOnce = async (): Promise<Notice[]> => {
  const snapshot = await getDocs(
    query(noticesRef(), orderBy("pinned", "desc"), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title as string,
      content: data.content as string,
      pinned: data.pinned as boolean,
      // 작성 직후에는 serverTimestamp 가 아직 확정되지 않아 값이 없을 수 있다
      createdAt: (
        data.createdAt as { toDate?: () => Date } | undefined
      )?.toDate?.(),
    };
  });
};

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore/lite";
import { fetchQueryOnce } from "@/shared/api/_common/fetchQueryOnce";
import { db } from "@/firebase/firebase";

export interface AdminNotice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt?: Date;
}

export const useAdminNotices = () => {
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const noticesQuery = useMemo(
    () =>
      query(
        collection(db, "notices"),
        orderBy("pinned", "desc"),
        orderBy("createdAt", "desc")
      ),
    []
  );

  const mapSnapshotToNotices = useCallback((snapshot: QuerySnapshot<DocumentData>) => {
    const result: AdminNotice[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title as string,
        content: data.content as string,
        pinned: data.pinned as boolean,
        createdAt: (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.(),
      };
    });
    setNotices(result);
    setIsError(false);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const snapshot = await getDocs(noticesQuery);
    mapSnapshotToNotices(snapshot);
  }, [mapSnapshotToNotices, noticesQuery]);

  useEffect(() => {
    const cancel = fetchQueryOnce(
      noticesQuery,
      (snapshot) => {
        mapSnapshotToNotices(snapshot);
      },
      // 실패 시에도 로딩을 종료해 "로딩 중"에서 멈추지 않게 한다
      () => {
        setIsError(true);
        setLoading(false);
      }
    );

    // 화면이 사라진 뒤 도착한 응답으로 상태를 갱신하지 않도록 취소한다
    return () => cancel();
  }, [mapSnapshotToNotices, noticesQuery]);

  return { notices, loading, isError, refresh };
};

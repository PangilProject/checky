import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore/lite";
import { subscribeWithSafariFallback } from "@/shared/api/_common/subscribeWithSafariFallback";
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
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const snapshot = await getDocs(noticesQuery);
    mapSnapshotToNotices(snapshot);
  }, [mapSnapshotToNotices, noticesQuery]);

  useEffect(() => {
    // 🔥 실시간 구독
    const unsubscribe = subscribeWithSafariFallback(noticesQuery, (snapshot) => {
      mapSnapshotToNotices(snapshot);
    });

    // 🔹 cleanup (컴포넌트 unmount 시 구독 해제)
    return () => unsubscribe();
  }, [mapSnapshotToNotices, noticesQuery]);

  return { notices, loading, refresh };
};

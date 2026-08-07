import { useEffect, useState } from "react";
import { collection, orderBy, query } from "firebase/firestore/lite";
import { subscribeWithSafariFallback } from "@/shared/api/_common/subscribeWithSafariFallback";
import { db } from "@/firebase/firebase";

export interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt?: Date;
}

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      orderBy("pinned", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = subscribeWithSafariFallback(
      q,
      (snapshot) => {
        const result = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            pinned: data.pinned,
            createdAt: data.createdAt?.toDate?.(),
          };
        });

        setNotices(result);
        setIsError(false);
        setLoading(false);
      },
      // 실패 시에도 로딩을 종료해 "로딩 중"에서 멈추지 않게 한다
      () => {
        setIsError(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { notices, loading, isError };
};

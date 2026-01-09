import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, "notices"),
      orderBy("pinned", "desc"),
      orderBy("createdAt", "desc")
    );

    // 🔥 실시간 구독
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: AdminNotice[] = snapshot.docs.map((doc) => {
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
      setLoading(false);
    });

    // 🔹 cleanup (컴포넌트 unmount 시 구독 해제)
    return () => unsubscribe();
  }, []);

  return { notices, loading };
};

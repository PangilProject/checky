import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      orderBy("pinned", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { notices, loading };
};

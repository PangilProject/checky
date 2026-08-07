import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setIsError(false);

      const q = query(
        collection(db, "users"),
        orderBy("name", "asc") // 🔹 이름 오름차순
      );

      try {
        const snap = await getDocs(q);

        const result: AdminUser[] = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            createdAt: data.createdAt?.toDate?.(),
            lastLoginAt: data.lastLoginAt?.toDate?.(),
          };
        });

        setUsers(result);
      } catch {
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  return { users, loading, isError };
};

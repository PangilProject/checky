import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const snap = await getDocs(collection(db, "users"));

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
      setLoading(false);
    };

    fetchUsers();
  }, []);

  console.log(users);

  return { users, loading };
};

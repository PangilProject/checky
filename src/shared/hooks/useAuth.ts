import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore/lite";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // 🔹 Firestore users/{uid} 문서 조회
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      const userData = snap.data();

      setUser(firebaseUser);
      setIsAdmin(userData?.isAdmin === true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, isLoading };
}

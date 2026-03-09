import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore/lite";

const adminCache = new Map<string, boolean>();
const adminFetchInFlight = new Map<string, Promise<boolean>>();

const getIsAdminCached = async (uid: string): Promise<boolean> => {
  if (adminCache.has(uid)) {
    return adminCache.get(uid) === true;
  }

  const pending = adminFetchInFlight.get(uid);
  if (pending) return pending;

  const request = (async () => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const isAdmin = snap.data()?.isAdmin === true;
    adminCache.set(uid, isAdmin);
    return isAdmin;
  })();

  adminFetchInFlight.set(uid, request);
  try {
    return await request;
  } finally {
    adminFetchInFlight.delete(uid);
  }
};

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

      setUser(firebaseUser);
      const isAdminValue = await getIsAdminCached(firebaseUser.uid);
      setIsAdmin(isAdminValue);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, isLoading };
}

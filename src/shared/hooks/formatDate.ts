import type { Timestamp } from "firebase/firestore";

export const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateByDate = (date: Date) => date.toISOString().slice(0, 10); // yyyy-mm-dd

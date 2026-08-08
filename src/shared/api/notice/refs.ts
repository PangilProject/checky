import { collection, doc } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";

/**
 * 공지는 사용자별 데이터가 아니라 모두가 함께 보는 최상위 컬렉션이다.
 * 그래서 _common/refs 의 users 하위 경로 헬퍼를 쓰지 않는다.
 */
export const noticesRef = () => collection(db, "notices");

export const noticeRef = (noticeId: string) => doc(db, "notices", noticeId);

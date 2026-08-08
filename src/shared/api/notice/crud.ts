import {
  addDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore/lite";
import { noticeRef, noticesRef } from "./refs";

interface NoticeContent {
  title: string;
  content: string;
  pinned: boolean;
}

/** 공지를 만든다. 쓰기 1회다. */
export const createNotice = async ({
  title,
  content,
  pinned,
}: NoticeContent) => {
  await addDoc(noticesRef(), {
    title,
    content,
    pinned,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/** 공지 내용을 고친다. 쓰기 1회다. */
export const updateNotice = async ({
  noticeId,
  title,
  content,
  pinned,
}: NoticeContent & { noticeId: string }) => {
  await updateDoc(noticeRef(noticeId), {
    title,
    content,
    pinned,
    updatedAt: serverTimestamp(),
  });
};

/**
 * 상단 고정만 바꾼다.
 *
 * 상세 화면에서 수정 모드를 거치지 않고 바로 전환할 때 쓴다.
 * 제목과 내용은 건드리지 않으므로, 편집 중인 값이 실수로 저장되지 않는다.
 */
export const setNoticePinned = async ({
  noticeId,
  pinned,
}: {
  noticeId: string;
  pinned: boolean;
}) => {
  await updateDoc(noticeRef(noticeId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
};

/** 공지를 지운다. 되돌릴 수 없다. */
export const deleteNotice = async (noticeId: string) => {
  await deleteDoc(noticeRef(noticeId));
};

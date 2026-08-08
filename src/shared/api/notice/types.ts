/** 운영자가 올리는 공지. 모든 사용자가 같은 목록을 본다. */
export interface Notice {
  id: string;
  title: string;
  content: string;
  /** 목록 맨 위에 고정할지 여부 */
  pinned: boolean;
  createdAt?: Date;
}

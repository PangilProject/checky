export interface Notice {
  id: string;
  title: string;
  content: string;
  /** 목록 맨 위에 고정할지 여부 */
  pinned: boolean;
  createdAt?: Date;
}

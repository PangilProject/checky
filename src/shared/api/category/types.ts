/** 분류가 쓰이는 중인지, 사용자가 끝낸 것인지 */
export type CategoryStatus = "ACTIVE" | "ENDED";

/** 할 일과 루틴을 묶는 분류. 이름과 색을 가지며 사용자가 순서를 정한다. */
export interface Category {
  id: string;
  name: string;
  color: string;
  status: CategoryStatus;
  orderIndex: number;
  // 읽기는 mapDoc 을 거치므로 Date 다. 저장 시에는 serverTimestamp() 를 쓴다.
  createdAt: Date | null;
  updatedAt: Date | null;
  endedAt: Date | null;
}

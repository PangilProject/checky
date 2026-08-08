/** 특정 날짜에 하기로 한 할 일. date 는 `YYYY-MM-DD`, time 은 정한 경우에만 있다. */
export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
  createdAt?: Date;
  time?: string;
  orderIndex: number;
}

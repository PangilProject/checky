/** 어느 날짜에서 어느 날짜로 옮길지 */
export interface MoveTasksParams {
  userId: string;
  fromDate: string;
  toDate: string;
}

/** 하루를 통째로 다루는 동작에 넘기는 값 */
export interface DateOnlyParams {
  userId: string;
  date: string;
}

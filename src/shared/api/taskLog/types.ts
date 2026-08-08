/** 할 일을 그날 체크했는지 남기는 기록. 할 일 하나와 날짜 하나에 기록도 하나다. */
export interface TaskLog {
  id: string;
  taskId: string;
  date: string;
  completed: boolean;
}

/** 루틴을 그날 했는지 남기는 기록. 루틴 하나와 날짜 하나에 기록도 하나다. */
export interface RoutineLog {
  id: string;
  routineId: string;
  date: string;
  done: boolean;
}

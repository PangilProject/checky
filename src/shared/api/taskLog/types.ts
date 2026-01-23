/**
 * @file taskLog/types.ts
 * @description API 모듈
 */

export interface TaskLog {
  id: string;
  taskId: string;
  date: string;
  completed: boolean;
}

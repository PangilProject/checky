/**
 * @file taskSetting/types.ts
 * @description API 모듈
 */

export interface MoveTasksParams {
  userId: string;
  fromDate: string;
  toDate: string;
}

export interface DateOnlyParams {
  userId: string;
  date: string;
}

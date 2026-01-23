/**
 * @file taskSetting.ts
 * @description API 모듈
 */

export type { MoveTasksParams, DateOnlyParams } from "./taskSetting/types";

export {
  moveUncompletedTasksToToday,
  moveUncompletedTasksToDate,
  deleteUncompletedTasks,
  copyAllTasksToDate,
  deleteAllTasksByDate,
} from "./taskSetting/actions";

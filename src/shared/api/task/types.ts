/**
 * @file task/types.ts
 * @description API 모듈
 */

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

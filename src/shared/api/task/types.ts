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

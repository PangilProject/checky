export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
  time?: string;
  orderIndex: number;
}

import { useSelectedDate } from "@/shared/contexts/useSelectedDate";

export function getMonthLabel() {
  const { selectedDate } = useSelectedDate();
  return `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월`;
}
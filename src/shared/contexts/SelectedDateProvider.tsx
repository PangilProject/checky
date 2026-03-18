import { useState, type ReactNode } from "react";
import { SelectedDateContext } from "./selectedDateContext";

/**
 * 날짜 선택 상태를 관리하는 Provider
 * @param children - Provider로 감쌀 자식 컴포넌트
 */
export function SelectedDateProvider({ children }: { children: ReactNode }) {
  // HomePage 최초 렌더 시 오늘 날짜
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </SelectedDateContext.Provider>
  );
}

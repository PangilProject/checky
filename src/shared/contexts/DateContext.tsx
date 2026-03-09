import { useState, type ReactNode } from "react";
import { DateContext } from "./dateContext";

/**
 * 날짜 선택 상태를 관리하는 Provider
 * @param children - Provider로 감쌀 자식 컴포넌트
 */
export function DateProvider({ children }: { children: ReactNode }) {

  // HomePage 최초 렌더 시 오늘 날짜
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

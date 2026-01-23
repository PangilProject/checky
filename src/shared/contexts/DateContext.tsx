import { useState, type ReactNode } from "react";
import { DateContext } from "./dateContext";

export function DateProvider({ children }: { children: ReactNode }) {
  // ✅ HomePage 최초 렌더 시 오늘 날짜
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

import { createContext, useContext, useState, type ReactNode } from "react";

interface DateContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextValue | null>(null);

export function DateProvider({ children }: { children: ReactNode }) {
  // ✅ HomePage 최초 렌더 시 오늘 날짜
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useSelectedDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useSelectedDate must be used within DateProvider");
  }
  return context;
}

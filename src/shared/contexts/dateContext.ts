import { createContext } from "react";

export interface DateContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const DateContext = createContext<DateContextValue | null>(null);

import { useContext } from "react";
import { DateContext } from "./dateContext";

export function useSelectedDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useSelectedDate must be used within DateProvider");
  }
  return context;
}

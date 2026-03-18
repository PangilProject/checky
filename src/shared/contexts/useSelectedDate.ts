import { useContext } from "react";
import { SelectedDateContext } from "./selectedDateContext";

/**
 * SelectedDateContext에서 selectedDate와 setSelectedDate를 편리하게 사용하기 위한 훅
 *
 * @returns {SelectedDateContextValue} selectedDate와 setSelectedDate
 * @throws {Error} SelectedDateProvider로 감싸지지 않은 곳에서 호출 시 에러 발생
 */
export function useSelectedDate() {
  // 1. SelectedDateContext에서 selectedDate와 setSelectedDate를 가져옴
  const context = useContext(SelectedDateContext);

  // 2. SelectedDateProvider로 감싸지지 않은 곳에서 호출 시 에러 발생
  if (!context) {
    throw new Error("useSelectedDate must be used within SelectedDateProvider");
  }

  // 3. selectedDate와 setSelectedDate를 반환
  return context;
}

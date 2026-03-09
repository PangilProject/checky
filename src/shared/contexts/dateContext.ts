import { createContext } from "react";

/**
 * 애플리케이션 전역에서 관리되는 날짜 상태의 타입 정의
 */
export interface DateContextValue {
  /** 현재 선택된 날짜 객체 */
  selectedDate: Date;
  /** 선택된 날짜를 업데이트하는 함수 */
  setSelectedDate: (date: Date) => void;
}

/**
 * 날짜 선택 상태를 공유하기 위한 React Context
 * Provider를 통해 하위 컴포넌트에서 selectedDate와 setSelectedDate에 접근할 수 있습니다.
 */
export const DateContext = createContext<DateContextValue | null>(null);


import { useEffect, useRef, useState, type ReactNode } from "react";
import { SelectedDateContext } from "./selectedDateContext";
import { formatDateToYmd } from "@/shared/utils/formatDate";

/**
 * 날짜 선택 상태를 관리하는 Provider
 *
 * 세션이 자정을 넘기면 "오늘"이 어제가 된다. 사용자가 오늘을 보고 있었다면
 * 새 오늘로 따라가고, 과거·미래 날짜를 보고 있었다면 건드리지 않는다.
 * @param children - Provider로 감쌀 자식 컴포넌트
 */
export function SelectedDateProvider({ children }: { children: ReactNode }) {
  // HomePage 최초 렌더 시 오늘 날짜
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  // 마지막으로 알고 있던 "오늘". 자정 넘김을 감지하는 기준이다.
  const lastTodayRef = useRef(formatDateToYmd(new Date()));

  useEffect(() => {
    const rollover = () => {
      const now = new Date();
      const todayYmd = formatDateToYmd(now);
      if (todayYmd === lastTodayRef.current) return;

      setSelectedDate((prev) =>
        formatDateToYmd(prev) === lastTodayRef.current ? now : prev
      );
      lastTodayRef.current = todayYmd;
    };

    // 화면이 계속 떠 있는 경우는 자정 타이머가, 백그라운드였다가
    // 돌아오는 경우는 visibilitychange 가 잡는다.
    let timerId: number;
    const armMidnightTimer = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      // 자정 직후 타이머가 자정 직전에 깨는 오차를 피하려고 1초 여유를 둔다.
      timerId = window.setTimeout(() => {
        rollover();
        armMidnightTimer();
      }, nextMidnight.getTime() - now.getTime() + 1000);
    };
    armMidnightTimer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") rollover();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </SelectedDateContext.Provider>
  );
}

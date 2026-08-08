import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCalendar } from "@/shared/hooks/calendar";
import { usePopoverPosition } from "@/shared/hooks/usePopoverPosition";
import {
  formatDateToYmd,
  formatYmdLabel,
  parseYmd,
} from "@/shared/hooks/formatDate";
import { SATURDAY_COLOR, SUNDAY_COLOR } from "@/shared/constants/colors";
import { WEEK_LABELS } from "@/shared/constants/dateLabels";


const getWeekdayColor = (index: number) => {
  if (index % 7 === 0) return SUNDAY_COLOR;
  if (index % 7 === 6) return SATURDAY_COLOR;
  return undefined;
};

interface DatePickerProps {
  /** "YYYY-MM-DD" 형식의 선택 값 */
  value: string;
  onChange: (value: string) => void;
  /** "YYYY-MM-DD" 형식의 선택 가능 하한 */
  min?: string;
  /** "YYYY-MM-DD" 형식의 선택 가능 상한 */
  max?: string;
  disabled?: boolean;
  /** 팝오버가 트리거 기준 어느 쪽으로 펼쳐질지 */
  align?: "left" | "right";
  className?: string;
}

/**
 * 브라우저 기본 <input type="date"> 대신 사용하는 커스텀 날짜 선택 컴포넌트입니다.
 * 값 인터페이스("YYYY-MM-DD" 문자열)는 기존 input과 동일하게 유지합니다.
 */
export const DatePicker = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  align = "left",
  className = "",
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => parseYmd(value), [value]);
  const todayYmd = useMemo(() => formatDateToYmd(new Date()), []);

  // 팝오버에 표시 중인 기준 월 (선택 값이 없으면 오늘 기준)
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());

  // 팝오버를 열 때마다 현재 선택 값(없으면 오늘) 기준 월로 맞춘다.
  const toggleOpen = () => {
    if (!open) setViewDate(selectedDate ?? new Date());
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const { cells } = useCalendar(viewDate);

  const moveMonth = (diff: number) =>
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + diff, 1),
    );

  const isOutOfRange = (ymd: string) =>
    Boolean((min && ymd < min) || (max && ymd > max));

  const selectDate = (ymd: string) => {
    if (isOutOfRange(ymd)) return;
    onChange(ymd);
    setOpen(false);
  };

  usePopoverPosition(open && !disabled, triggerRef, panelRef, align);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`border-b border-gray-300 text-[14px] text-left pb-0.5 min-w-28
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          ${value ? "" : "text-gray-400"}`}
      >
        {formatYmdLabel(value) || "날짜 선택"}
      </button>

      {open &&
        !disabled &&
        createPortal(
          <div
            ref={panelRef}
            // 위치는 usePopoverPosition이 뷰포트 기준으로 잡아준다.
            style={{ top: 0, left: 0 }}
            className="fixed z-1100 max-h-[calc(100vh-16px)] w-70 overflow-y-auto rounded-xl
              border border-gray-200 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
          >
            {/* 월 이동 헤더 */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="h-7 w-7 rounded-md text-sm text-gray-500 hover:bg-gray-100"
                aria-label="이전 달"
              >
                ‹
              </button>
              <span className="text-[14px] font-bold">
                {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
              </span>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="h-7 w-7 rounded-md text-sm text-gray-500 hover:bg-gray-100"
                aria-label="다음 달"
              >
                ›
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="mt-2 grid grid-cols-7">
              {WEEK_LABELS.map((label, index) => (
                <span
                  key={label}
                  className="py-1 text-center text-[11px]"
                  style={{ color: getWeekdayColor(index) ?? "#9CA3AF" }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((cell, index) => {
                const ymd = formatDateToYmd(cell.date);
                const isSelected = ymd === value;
                const isToday = ymd === todayYmd;
                const outOfRange = isOutOfRange(ymd);

                const textColor = isSelected
                  ? "#FFFFFF"
                  : !cell.isCurrentMonth || outOfRange
                    ? "#C4C4C4"
                    : getWeekdayColor(index);

                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={outOfRange}
                    onClick={() => selectDate(ymd)}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px]
                    ${isSelected ? "bg-black font-bold" : ""}
                    ${!isSelected && isToday ? "border border-black font-bold" : ""}
                    ${outOfRange ? "cursor-not-allowed" : "hover:bg-gray-100"}`}
                    style={{ color: textColor }}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* 오늘로 이동 */}
            <div className="mt-2 flex justify-end border-t border-gray-100 pt-2">
              <button
                type="button"
                disabled={isOutOfRange(todayYmd)}
                onClick={() => selectDate(todayYmd)}
                className="rounded-md px-2 py-1 text-[12px] text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                오늘
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

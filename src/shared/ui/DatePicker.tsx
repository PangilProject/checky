import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCalendar } from "@/shared/hooks/calendar";
import { usePopoverPosition } from "@/shared/hooks/usePopoverPosition";
import {
  formatDateToYmd,
  formatYmdLabel,
  parseYmd,
} from "@/shared/utils/formatDate";
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
  /**
   * 무엇의 날짜인지 ("시작 날짜" 등). 버튼 글자가 날짜뿐이라 한 화면에 선택기가 둘이면 구분되지 않는다.
   * 넘기면 버튼 이름이 "시작 날짜 2026. 10. 28." 처럼 지금 값과 함께 붙는다
   */
  label?: string;
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
  label,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => parseYmd(value), [value]);
  // memo 하지 않는다. 빈 deps 로 고정하면 자정을 넘긴 세션에서
  // 어제에 "오늘" 링이 계속 그려진다. 문자열 하나 만드는 값싼 연산이다.
  const todayYmd = formatDateToYmd(new Date());

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
      if (event.key !== "Escape") return;
      // 모달 안의 선택기에서 Esc 는 선택기만 닫는다. 모달도 Esc 를 window 에서 듣기 때문에
      // 여기서 멈추지 않으면 모달까지 닫히거나 "수정 중인 내용" 확인이 뜬다
      event.stopPropagation();
      setOpen(false);
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
        aria-label={label ? (value ? `${label} ${formatYmdLabel(value)}` : `${label} 선택`) : undefined}
        className={`border-b border-content-subtle text-sm text-left pb-0.5 min-w-28
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          ${value ? "" : "text-content-muted"}`}
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
              border border-line bg-surface-raised p-3 shadow-(--shadow-popover)"
          >
            {/* 월 이동 헤더 */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="h-7 w-7 rounded-md text-sm text-content-muted hover:bg-surface-hover"
                aria-label="이전 달"
              >
                ‹
              </button>
              <span className="text-sm font-bold">
                {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
              </span>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="h-7 w-7 rounded-md text-sm text-content-muted hover:bg-surface-hover"
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
                  className="py-1 text-center text-xs"
                  style={{ color: getWeekdayColor(index) ?? "var(--color-content-muted)" }}
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
                  ? "var(--color-on-primary)"
                  : !cell.isCurrentMonth || outOfRange
                    ? "var(--color-content-subtle)"
                    : getWeekdayColor(index);

                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={outOfRange}
                    onClick={() => selectDate(ymd)}
                    // 앞뒤 달 칸도 같은 숫자를 보여 주므로, 숫자만으로는 어느 날인지 알 수 없다
                    aria-label={`${cell.date.getFullYear()}년 ${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일`}
                    aria-pressed={isSelected}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm
                    ${isSelected ? "bg-primary font-bold" : ""}
                    ${!isSelected && isToday ? "border border-line-strong font-bold" : ""}
                    ${outOfRange ? "cursor-not-allowed" : "hover:bg-surface-hover"}`}
                    style={{ color: textColor }}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* 오늘로 이동 */}
            <div className="mt-2 flex justify-end border-t border-line pt-2">
              <button
                type="button"
                disabled={isOutOfRange(todayYmd)}
                onClick={() => selectDate(todayYmd)}
                className="rounded-md px-2 py-1 text-xs text-content-muted hover:bg-surface-hover disabled:opacity-40"
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

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatHmLabel } from "@/shared/hooks/formatDate";
import { usePopoverPosition } from "@/shared/hooks/usePopoverPosition";

const MERIDIEMS = [
  { key: "AM", label: "오전" },
  { key: "PM", label: "오후" },
] as const;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

const MINUTE_STEP = 5;
const MINUTES = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, i) => i * MINUTE_STEP,
);

interface ParsedTime {
  meridiem: "AM" | "PM";
  hour12: number;
  minute: number;
}

/**
 * "HH:MM"(24시간) -> 12시간제 파츠
 */
const parseHm = (value: string): ParsedTime | null => {
  const matched = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!matched) return null;

  const hour24 = Number(matched[1]);
  const minute = Number(matched[2]);
  if (hour24 > 23 || minute > 59) return null;

  return {
    meridiem: hour24 < 12 ? "AM" : "PM",
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute,
  };
};

/**
 * 12시간제 파츠 -> "HH:MM"(24시간)
 */
const toHm = ({ meridiem, hour12, minute }: ParsedTime) => {
  const base = hour12 % 12;
  const hour24 = meridiem === "PM" ? base + 12 : base;

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

interface TimePickerProps {
  /** "HH:MM"(24시간) 형식의 선택 값 */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 팝오버가 트리거 기준 어느 쪽으로 펼쳐질지 */
  align?: "left" | "right";
  className?: string;
}

/**
 * 브라우저 기본 <input type="time"> 대신 사용하는 커스텀 시간 선택 컴포넌트입니다.
 * 값 인터페이스("HH:MM" 24시간 문자열)는 기존 input과 동일하게 유지합니다.
 */
export const TimePicker = ({
  value,
  onChange,
  disabled = false,
  align = "left",
  className = "",
}: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseHm(value), [value]);
  // 값이 없으면 오전 9:00을 기본 선택 후보로 사용한다.
  const current: ParsedTime = parsed ?? {
    meridiem: "AM",
    hour12: 9,
    minute: 0,
  };

  // 기존 데이터에 5분 단위가 아닌 값이 있을 수 있으므로 현재 값은 목록에 항상 포함한다.
  const minuteOptions = useMemo(() => {
    if (current.minute % MINUTE_STEP === 0) return MINUTES;
    return [...MINUTES, current.minute].sort((a, b) => a - b);
  }, [current.minute]);

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

  // 팝오버를 열면 선택된 시/분이 보이도록 각 목록을 스크롤한다.
  useEffect(() => {
    if (!open) return;

    for (const list of [hourListRef.current, minuteListRef.current]) {
      const selected = list?.querySelector<HTMLElement>("[data-selected=true]");
      if (list && selected) list.scrollTop = selected.offsetTop - 8;
    }
  }, [open]);

  const update = (patch: Partial<ParsedTime>) =>
    onChange(toHm({ ...current, ...patch }));

  const columnItemClass = (selected: boolean) =>
    `w-full rounded-md py-1 text-center text-sm
     ${selected ? "bg-primary font-bold text-on-primary" : "hover:bg-surface-sunken"}`;

  usePopoverPosition(open && !disabled, triggerRef, panelRef, align);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`border-b border-content-subtle text-sm text-left pb-0.5 min-w-24
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          ${parsed ? "" : "text-content-muted"}`}
      >
        {formatHmLabel(value) || "시간 선택"}
      </button>

      {open &&
        !disabled &&
        createPortal(
          <div
            ref={panelRef}
            // 위치는 usePopoverPosition이 뷰포트 기준으로 잡아준다.
            style={{ top: 0, left: 0 }}
            className="fixed z-1100 flex max-h-[calc(100vh-16px)] w-48 gap-1 rounded-xl
              border border-line bg-surface-raised p-2 shadow-[var(--shadow-popover)]"
          >
            {/* 오전 / 오후 */}
            <div className="flex w-14 flex-col gap-1">
              {MERIDIEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => update({ meridiem: item.key })}
                  className={columnItemClass(current.meridiem === item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* 시 */}
            <div
              ref={hourListRef}
              className="flex max-h-44 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  data-selected={current.hour12 === hour}
                  onClick={() => update({ hour12: hour })}
                  className={columnItemClass(current.hour12 === hour)}
                >
                  {hour}
                </button>
              ))}
            </div>

            {/* 분 */}
            <div
              ref={minuteListRef}
              className="flex max-h-44 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {minuteOptions.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  data-selected={current.minute === minute}
                  onClick={() => update({ minute })}
                  className={columnItemClass(current.minute === minute)}
                >
                  {String(minute).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

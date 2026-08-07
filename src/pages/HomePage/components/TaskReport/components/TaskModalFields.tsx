import { useEffect, useRef, useState } from "react";
import { Text3 } from "@/shared/ui/Text";
import { DatePicker } from "@/shared/ui/DatePicker";
import { TimePicker } from "@/shared/ui/TimePicker";
import { formatHmLabel, formatYmdLabel } from "@/shared/hooks/formatDate";
import type { Category } from "@/shared/api/category";

export const TaskInput = ({
  value,
  onChange,
  onEnter,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
}) => {
  return (
    <input
      className="w-full border-0 border-b border-gray-300 text-[16px] outline-none ime-fallback"
      placeholder="할 일을 입력하세요"
      value={value}
      maxLength={100}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" || e.nativeEvent.isComposing || disabled) return;
        e.preventDefault();
        onEnter?.();
      }}
    />
  );
};

export const DateField = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex justify-between items-center">
      <Text3 text="날짜" />
      {disabled ? (
        <Text3 text={formatYmdLabel(value)} className="opacity-60" />
      ) : (
        <DatePicker value={value} onChange={onChange} align="right" />
      )}
    </div>
  );
};

export const TimeField = ({
  enabled,
  value,
  onToggle,
  onChange,
  disabled,
}: {
  enabled: boolean;
  value: string;
  onToggle: (v: boolean) => void;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex justify-between items-center">
      <Text3 text="시간" />
      {disabled ? (
        enabled && <Text3 text={formatHmLabel(value)} className="opacity-60" />
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={`text-xs px-2 py-1 rounded border
              ${
                enabled
                  ? "border-black text-black"
                  : "border-gray-300 text-gray-400"
              }`}
          >
            {enabled ? "삭제" : "선택"}
          </button>

          <TimePicker
            value={value}
            disabled={!enabled}
            onChange={onChange}
            align="right"
          />
        </div>
      )}
    </div>
  );
};

export const CategoryField = ({
  value,
  categories,
  onChange,
  disabled,
}: {
  value: string;
  categories: Category[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDisabled = Boolean(disabled) || categories.length === 0;
  const selected = categories.find((c) => c.id === value);
  const selectedTextClass = selected?.color
    ? `text-[${selected.color}]`
    : "text-gray-400";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isOpen = open && !isDisabled;

  return (
    <div className="flex justify-between items-center">
      <Text3 text="카테고리" />
      {isDisabled ? (
        <Text3
          text={selected?.name ?? "-"}
          className={
            selected?.color ? `text-[${selected.color}]` : "opacity-60"
          }
        />
      ) : (
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="min-w-30 border-b border-gray-300 text-[14px] text-left pr-6 relative"
          >
            <span className={selectedTextClass}>{selected?.name ?? "-"}</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">
              ▼
            </span>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 z-10 min-w-30 bg-white border border-gray-200 rounded-md shadow-sm">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onChange(category.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[14px] hover:bg-gray-50 text-[${category.color}] ${
                    category.id === value ? "font-bold" : ""
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

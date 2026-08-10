import { useEffect, useRef, useState } from "react";
import { Input, Stack, Text } from "@/shared/ui/primitives";
import { DatePicker } from "@/shared/ui/DatePicker";
import { TimePicker } from "@/shared/ui/TimePicker";
import { formatHmLabel, formatYmdLabel } from "@/shared/hooks/formatDate";
import type { Category } from "@/shared/api/category";
import { getCategoryColor } from "@/shared/constants/colors";

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
    <Input
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
      <Text variant="body">날짜</Text>
      {disabled ? (
        <Text variant="body" className="opacity-60">
          {formatYmdLabel(value)}
        </Text>
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
      <Text variant="body">시간</Text>
      {disabled ? (
        enabled && (
          <Text variant="body" className="opacity-60">
            {formatHmLabel(value)}
          </Text>
        )
      ) : (
        <Stack gap={3} direction="row" align="center">
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={`text-xs px-2 py-1 rounded border
              ${
                enabled
                  ? "border-line-strong text-content"
                  : "border-content-subtle text-content-muted"
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
        </Stack>
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
  // Tailwind 는 소스에 그대로 적힌 클래스만 만들어 내므로 `text-[${color}]` 처럼
  // 조립하면 색이 나오지 않는다. 값이 실행 중에 정해지므로 style 로 넘긴다.
  const selectedColor = selected?.color
    ? getCategoryColor(selected.color)
    : undefined;

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
      <Text variant="body">카테고리</Text>
      {isDisabled ? (
        <Text
          variant="body"
          style={selectedColor ? { color: selectedColor } : undefined}
          className={selectedColor ? undefined : "opacity-60"}
        >
          {selected?.name ?? "-"}
        </Text>
      ) : (
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="min-w-30 border-b border-content-subtle text-sm text-left pr-6 relative"
          >
            <span
              style={{ color: selectedColor }}
              className={selectedColor ? undefined : "text-content-muted"}
            >
              {selected?.name ?? "-"}
            </span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">
              ▼
            </span>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 z-10 min-w-30 bg-surface-raised border border-line rounded-md shadow-[var(--shadow-popover)]">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onChange(category.id);
                    setOpen(false);
                  }}
                  style={{ color: getCategoryColor(category.color) }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-hover ${
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

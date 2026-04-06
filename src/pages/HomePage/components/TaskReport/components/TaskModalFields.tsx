import { useEffect, useRef, useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import type { Category } from "@/shared/api/category";

export const ModalTitle = ({ mode }: { mode: "CREATE" | "VIEW" | "EDIT" }) => {
  if (mode === "CREATE")
    return <Text5 text="태스크 추가" className="font-bold" />;
  if (mode === "EDIT")
    return <Text5 text="태스크 수정" className="font-bold" />;
  return <Text5 text="태스크 상세" className="font-bold" />;
};

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
        <Text3 text={value} className="opacity-60" />
      ) : (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-b border-gray-300 outline-none text-[14px]"
        />
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
        enabled && <Text3 text={value} className="opacity-60" />
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

          <input
            type="time"
            value={value}
            disabled={!enabled}
            onChange={(e) => onChange(e.target.value)}
            className={`border-b outline-none text-[14px]
              ${!enabled && "opacity-40"}`}
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

/**
 * 두세 개 중 하나를 고르는 전환 버튼 (주간·월간, 하루·한 주 등).
 *
 * 달성 현황에만 있던 생김새를 루틴 기록 창, 할 일 목록, 기록 화면이 함께 쓰게 되어 한 벌로 뺐다.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** 무엇을 고르는지. 화면에는 보이지 않고 보조기기가 읽는다 */
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex shrink-0 rounded-lg bg-surface-hover p-0.5"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-0.5 text-sm ${
              isActive
                ? "bg-surface font-bold text-content shadow-sm"
                : "text-content-muted"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

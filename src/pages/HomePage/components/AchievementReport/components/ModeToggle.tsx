import type { AchievementMode } from "../utils/getAchievementRanges";

const OPTIONS: { value: AchievementMode; label: string }[] = [
  { value: "week", label: "주간" },
  { value: "month", label: "월간" },
];

/** 달성 현황의 주간·월간 전환 */
export const ModeToggle = ({
  mode,
  onChange,
}: {
  mode: AchievementMode;
  onChange: (mode: AchievementMode) => void;
}) => {
  return (
    <div
      role="group"
      aria-label="기간"
      className="inline-flex rounded-lg bg-surface-hover p-0.5"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === mode;
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
};

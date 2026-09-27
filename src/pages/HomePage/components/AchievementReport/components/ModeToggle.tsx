import { SegmentedToggle } from "@/shared/ui/SegmentedToggle";
import type { AchievementMode } from "@/shared/utils/getAchievementRanges";

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
}) => (
  <SegmentedToggle options={OPTIONS} value={mode} onChange={onChange} label="기간" />
);

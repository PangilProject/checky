/**
 * 랜딩 필름에 나오는 주간 루틴 표의 겉모습.
 * 클래스는 RoutineReport/components/RoutineTable.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import type { ReactNode } from "react";
import { Text, cn } from "@/shared/ui/primitives";
import { getWeekendTextClass } from "@/shared/constants/dateLabels";

/** 주간 표 머리의 요일과 날짜 (RoutineTable) */
export const WeekdayLabel = ({ weekday, label }: { weekday: number; label: string }) => (
  <Text variant="caption" className={cn("block", getWeekendTextClass(weekday))}>
    {label}
  </Text>
);

/** 표의 작은 글자 칸 (RoutineTable 의 TD 안쪽) */
export const CellText = ({
  children,
  bold = false,
  className,
}: {
  children: ReactNode;
  bold?: boolean;
  className?: string;
}) => (
  <Text
    variant="bodySm"
    as="span"
    className={cn("block whitespace-nowrap", bold && "font-bold", className)}
  >
    {children}
  </Text>
);

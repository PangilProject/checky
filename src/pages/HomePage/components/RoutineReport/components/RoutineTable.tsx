import { Text } from "@/shared/ui/primitives";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import type { ReactNode } from "react";
import type { RoutineReport } from "@/shared/api/routine";
import { GoDash } from "react-icons/go";
import { getWeekendTextClass } from "@/shared/constants/dateLabels";
import { getCategoryColor } from "@/shared/constants/colors";

interface RoutineTableProps {
  report: RoutineReport;
  onToggle: (routineId: string, date: string, current: boolean) => void;
}

/**
 * 주간 루틴 리포트 테이블을 렌더링합니다.
 * 요일별 체크 상태 토글과 루틴별 합계 표시를 담당합니다.
 */
export const RoutineTable = ({ report, onToggle }: RoutineTableProps) => {
  const { week, rows } = report;

  if (rows.length === 0) {
    return (
      <div className="w-full flex flex-col items-center pt-20">
        <Text variant="bodySm" tone="muted">
          해당 기간에 루틴이 없습니다.
        </Text>
      </div>
    );
  }

  function getDay(dateString: string): string {
    return dateString.split("-")[2];
  }

  return (
    // 좁은 화면에서 페이지 전체가 가로로 밀리지 않도록 표 자체만 스크롤시킨다
    <div className="w-full overflow-x-auto">
      <table border={1} cellPadding={8} className="w-full min-w-85">
        <thead>
          <tr className="border-b border-content-muted">
            <TD className="border-r border-content-muted">루틴</TD>
            {week.days.map((day) => {
              return (
                <TD key={day.date} className={getWeekendTextClass(day.day)}>
                  <div className="flex flex-col items-center">
                    <Text variant="caption">{day.label}</Text>
                    <Text variant="caption">{getDay(day.date)}</Text>
                  </div>
                </TD>
              );
            })}
            <TD className="border-l border-content-muted">합계</TD>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const doneCount = Object.values(row.checks).filter(Boolean).length;
            const totalCount = Object.keys(row.checks).length;

            return (
              <tr key={row.routineId}>
                {/* 1. 루틴 이름 (긴 이름이 표 폭을 밀어내지 않도록 제한) */}
                <TD className="border-r border-content-muted max-w-32 wrap-break-word">
                  {row.routineTitle}
                </TD>

                {/* 2. 일자 별 루틴 현황 */}
                {week.days.map((day) => {
                  const hasCheck = day.date in row.checks;

                  // 2-1. 루틴 반복 요일이 아닌 경우
                  if (!hasCheck) {
                    return (
                      <TD key={day.date}>
                        <GoDash size={20} color="var(--color-content-muted)" />
                      </TD>
                    );
                  }

                  // 체크 여부
                  const checked = row.checks[day.date];

                  // 2-2. 루틴 반복 요일인 경우
                  return (
                    <TD key={day.date}>
                      <button
                        onClick={() =>
                          onToggle(row.routineId, day.date, checked)
                        }
                        className="pressable"
                      >
                        {checked ? (
                          <FaCheckCircle size={20} color={getCategoryColor(row.category.color)} />
                        ) : (
                          <LuCircleDashed
                            size={20}
                            color={getCategoryColor(row.category.color)}
                          />
                        )}
                      </button>
                    </TD>
                  );
                })}

                {/* 3. 루틴 합계 */}
                <TD className="border-l border-content-muted">
                  <Text variant="bodySm">{`${doneCount} / ${totalCount}`}</Text>
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface TDProps {
  children: ReactNode;
  className?: string;
}

const TD = ({ children, className }: TDProps) => {
  return (
    <td
      className={`
        h-10
        hover:bg-surface-hover
        ${className ?? ""}
      `}
    >
      <div className="flex items-center justify-center h-full">
        {typeof children === "string" ? (
          <Text variant="bodySm">{children}</Text>
        ) : (
          children
        )}
      </div>
    </td>
  );
};

import { Text1, Text2 } from "@/shared/ui/Text";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import type { ReactNode } from "react";
import type { RoutineReport } from "@/shared/api/routine";
import { GoDash } from "react-icons/go";
import { Space20 } from "@/shared/ui/Space";

interface RoutineTableProps {
  report: RoutineReport;
  onToggle: (routineId: string, date: string, current: boolean) => void;
}

function getWeekendTextClass(label: string): string | undefined {
  if (label === "일") return "text-[#FF393C]";
  if (label === "토") return "text-[#0088FF]";
  return undefined;
}

/**
 * 주간 루틴 리포트 테이블을 렌더링합니다.
 * 요일별 체크 상태 토글과 루틴별 합계 표시를 담당합니다.
 */
export const RoutineTable = ({ report, onToggle }: RoutineTableProps) => {
  const { week, rows } = report;

  if (rows.length === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <Space20 direction="mb" />
        <Text2 className="text-[#8E8E93]" text="해당 기간에 루틴이 없습니다." />
      </div>
    );
  }

  function getDay(dateString: string): string {
    return dateString.split("-")[2];
  }

  return (
    <table border={1} cellPadding={8} className="w-full">
      <thead>
        <tr className="border-b border-[#8E8E93]">
          <TD className="border-r border-[#8E8E93]">루틴</TD>
          {week.days.map((day) => {
            return (
              <TD key={day.date} className={getWeekendTextClass(day.label)}>
                <div className="flex flex-col items-center">
                  <Text1 text={day.label} />
                  <Text1 text={getDay(day.date)} />
                </div>
              </TD>
            );
          })}
          <TD className="border-l border-[#8E8E93]">합계</TD>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => {
          const doneCount = Object.values(row.checks).filter(Boolean).length;
          const totalCount = Object.keys(row.checks).length;

          return (
            <tr key={row.routineId}>
              {/* 1. 루틴 이름 */}
              <TD className={`border-r border-[#8E8E93]`}>
                {row.routineTitle}
              </TD>

              {/* 2. 일자 별 루틴 현황 */}
              {week.days.map((day) => {
                const hasCheck = day.date in row.checks;

                // 2-1. 루틴 반복 요일이 아닌 경우
                if (!hasCheck) {
                  return (
                    <TD key={day.date}>
                      <GoDash size={20} color="#8E8E93" />
                    </TD>
                  );
                }

                // 체크 여부
                const checked = row.checks[day.date];

                // 2-2. 루틴 반복 요일인 경우
                return (
                  <TD key={day.date}>
                    <button
                      onClick={() => onToggle(row.routineId, day.date, checked)}
                      className="pressable"
                    >
                      {checked ? (
                        <FaCheckCircle size={20} color={row.category.color} />
                      ) : (
                        <LuCircleDashed size={20} color={row.category.color} />
                      )}
                    </button>
                  </TD>
                );
              })}

              {/* 3. 루틴 합계 */}
              <TD className="border-l border-[#8E8E93]">
                <Text2 text={`${doneCount} / ${totalCount}`} />
              </TD>
            </tr>
          );
        })}
      </tbody>
    </table>
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
        hover:bg-[#f4f4f4]
        ${className ?? ""}
      `}
    >
      <div className="flex items-center justify-center h-full">
        {typeof children === "string" ? <Text2 text={children} /> : children}
      </div>
    </td>
  );
};

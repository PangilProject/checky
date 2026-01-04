import { Text2 } from "@/shared/ui/Text";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import type { ReactNode } from "react";
import type { RoutineReport } from "@/shared/api/routine";
import { GoDash } from "react-icons/go";

import { toggleRoutineLog } from "@/shared/api/routineLog";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space20 } from "@/shared/ui/Space";

export const RoutineTable = ({
  report,
  setReport,
}: {
  report: RoutineReport;
  setReport: React.Dispatch<React.SetStateAction<RoutineReport | null>>;
}) => {
  const { user } = useAuth();
  const { week, rows } = report;

  if (rows.length === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <Space20 direction="mb" />
        <Text2 className="text-[#8E8E93]" text="해당 기간에 루틴이 없습니다." />
      </div>
    );
  }

  const handleToggle = async (
    routineId: string,
    date: string,
    current: boolean
  ) => {
    if (!user) return;

    // ✅ 1. UI 먼저 업데이트 (Optimistic)
    setReport((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        rows: prev.rows.map((row) =>
          row.routineId !== routineId
            ? row
            : {
                ...row,
                checks: {
                  ...row.checks,
                  [date]: !current,
                },
              }
        ),
      };
    });

    // ✅ 2. Firestore 반영
    await toggleRoutineLog({
      userId: user.uid,
      routineId,
      date,
      done: !current,
    });
  };
  return (
    <table border={1} cellPadding={8} className="w-full">
      <thead>
        <tr className="border-b border-[#8E8E93]">
          <TD className="border-r border-[#8E8E93]">루틴</TD>
          {week.days.map((day) => {
            const isSunday = day.label === "일";
            const isSaturday = day.label === "토";

            return (
              <TD
                key={day.date}
                className={
                  isSunday
                    ? "text-[#FF393C]"
                    : isSaturday
                    ? "text-[#0088FF]"
                    : undefined
                }
              >
                {day.label}
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
              <TD className={`border-r border-[#8E8E93]`}>
                {row.routineTitle}
              </TD>

              {week.days.map((day) => {
                const hasCheck = day.date in row.checks;

                if (!hasCheck) {
                  return (
                    <TD key={day.date}>
                      <GoDash size={20} color="#8E8E93" />
                    </TD>
                  );
                }

                const checked = row.checks[day.date];

                return (
                  <TD key={day.date}>
                    <button
                      onClick={() =>
                        handleToggle(row.routineId, day.date, checked)
                      }
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

import { Text2 } from "@/shared/ui/Text";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import type { ReactNode } from "react";
import type { RoutineReport } from "@/shared/api/routine";
import { GoDash } from "react-icons/go";

export const RoutineTable = ({ report }: { report: RoutineReport }) => {
  const { week, rows } = report;

  return (
    <table border={1} cellPadding={8} className="w-full">
      {/* 헤더 */}
      <thead>
        <tr className="border-b border-[#8E8E93]">
          <TD className="border-r border-[#8E8E93]" children="루틴" />
          {week.days.map((day) => (
            <TD key={day.date} children={day.label} />
          ))}
          <TD className="border-l border-[#8E8E93]" children="합계" />
        </tr>
      </thead>

      {/* 바디 */}
      <tbody>
        {rows.map((row) => {
          const doneCount = Object.values(row.checks).filter(Boolean).length;
          const totalCount = Object.keys(row.checks).length;
          const textColor = `text-[${row.category.color}]`;
          return (
            <tr key={row.routineId}>
              <TD
                className={`${textColor} border-r border-[#8E8E93]`}
                children={row.routineTitle}
              />

              {week.days.map((day) => {
                const hasCheck = day.date in row.checks;

                if (!hasCheck) {
                  return (
                    <TD key={day.date}>
                      <GoDash size={20} color={"#8E8E93"} />
                    </TD>
                  );
                }

                const checked = row.checks[day.date];

                return (
                  <TD key={day.date}>
                    {checked ? (
                      <FaCheckCircle size={20} color={row.category.color} />
                    ) : (
                      <LuCircleDashed size={20} color={row.category.color} />
                    )}
                  </TD>
                );
              })}

              <TD
                className="border-l border-[#8E8E93]"
                children={`${doneCount} / ${totalCount}`}
              />
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
        hover:bg-gray-500
        ${className ?? ""}
      `}
    >
      <div className="flex items-center justify-center h-full">
        {typeof children === "string" ? <Text2 text={children} /> : children}
      </div>
    </td>
  );
};

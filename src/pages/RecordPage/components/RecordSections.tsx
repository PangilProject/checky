import { useState } from "react";
import type { Routine } from "@/shared/api/routine";
import type { Category } from "@/shared/api/category";
import { toPercent } from "@/shared/api/monthlyStats";
import { getCategoryColor, getCategoryTextColor } from "@/shared/constants/colors";
import { getDayLabel } from "@/shared/constants/dateLabels";
import { parseYmd } from "@/shared/utils/formatDate";
import { RoutineHistoryModal } from "@/shared/ui/RoutineHistory/RoutineHistoryModal";
import { Text } from "@/shared/ui/primitives";
import type { RecordSummary } from "../utils/summarizeRecord";

/** 남은 할 일은 이만큼만 펼치고 나머지는 개수만 적는다 */
const REMAINING_LIMIT = 10;

const formatShortDate = (ymd: string) => {
  const day = parseYmd(ymd)?.getDay();
  const label = `${Number(ymd.slice(5, 7))}/${Number(ymd.slice(8, 10))}`;
  return day === undefined ? label : `${label} (${getDayLabel(day)})`;
};

const SectionTitle = ({ children }: { children: string }) => (
  <Text as="h2" variant="title">
    {children}
  </Text>
);

/** 기간 요약 네 칸 */
export const RecordTiles = ({ summary }: { summary: RecordSummary }) => {
  const total = summary.tasks.total + summary.routines.total;
  const done = summary.tasks.done + summary.routines.done;
  const rate = toPercent(done, total);

  const tiles = [
    { label: "달성률", value: rate === null ? "-" : String(rate), unit: rate === null ? "" : "%" },
    {
      label: "해낸 할 일",
      value: String(summary.tasks.done),
      unit: ` / ${summary.tasks.total}`,
    },
    {
      label: "루틴 수행",
      value: String(summary.routines.done),
      unit: ` / ${summary.routines.total}`,
    },
    { label: "남은 할 일", value: String(summary.tasks.remaining.length), unit: "개" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex flex-col gap-1.5 rounded-xl bg-surface-sunken p-4"
        >
          <dt className="text-sm text-content-muted">{tile.label}</dt>
          <dd className="text-2xl font-bold">
            {tile.value}
            <span className="text-base font-normal text-content-muted">{tile.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
};

/** 해낸 할 일의 분류별 비중 */
export const CategoryBreakdown = ({ summary }: { summary: RecordSummary }) => {
  const doneTotal = summary.tasks.done;

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>분류별로 해낸 할 일</SectionTitle>
      {doneTotal === 0 ? (
        <Text variant="bodySm" tone="muted">
          이 기간에 해낸 할 일이 없어요.
        </Text>
      ) : (
        <>
          <div
            className="flex h-3.5 gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={summary.byCategory
              .map((item) => `${item.name} ${item.done}개`)
              .join(", ")}
          >
            {summary.byCategory.map((item) => (
              <span
                key={item.categoryId}
                style={{
                  width: `${(item.done / doneTotal) * 100}%`,
                  backgroundColor: getCategoryColor(item.color),
                }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            {summary.byCategory.map((item) => (
              <li key={item.categoryId} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: getCategoryColor(item.color) }}
                />
                <b style={{ color: getCategoryTextColor(item.color) }}>{item.name}</b>
                {item.done}개
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

/** 기준일까지 끝내지 못한 할 일 */
export const RemainingTasks = ({
  summary,
  categories,
  todayYmd,
}: {
  summary: RecordSummary;
  categories: Category[];
  todayYmd: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const remaining = summary.tasks.remaining;
  const shown = expanded ? remaining : remaining.slice(0, REMAINING_LIMIT);

  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>남은 할 일</SectionTitle>
      {remaining.length === 0 ? (
        <Text variant="bodySm" tone="muted">
          이 기간의 할 일을 모두 해냈어요.
        </Text>
      ) : (
        <>
          <ul className="flex flex-col">
            {shown.map((task) => {
              const category = categoryById.get(task.categoryId);
              const color = category?.color ?? task.categoryColor;
              return (
                <li
                  key={task.id}
                  className="grid grid-cols-[88px_1fr] items-baseline gap-3 border-b border-line py-2.5 text-sm last:border-b-0 sm:grid-cols-[96px_64px_1fr]"
                >
                  <span className="text-content-muted">
                    {task.date === todayYmd ? "오늘" : formatShortDate(task.date)}
                  </span>
                  <b
                    className="hidden truncate text-xs sm:block"
                    style={{ color: getCategoryTextColor(color) }}
                  >
                    {category?.name ?? "분류 없음"}
                  </b>
                  <span className="min-w-0 break-words text-base">{task.title}</span>
                </li>
              );
            })}
          </ul>
          {remaining.length > REMAINING_LIMIT && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="self-start text-sm text-content-muted pressable"
            >
              {expanded ? "접기" : `${remaining.length - REMAINING_LIMIT}개 더 보기`}
            </button>
          )}
        </>
      )}
    </section>
  );
};

/** 루틴별 수행. 누르면 그 루틴의 기록 창을 연다 */
export const RoutineRows = ({ summary }: { summary: RecordSummary }) => {
  const [opened, setOpened] = useState<{
    routine: Routine;
    category?: Category;
  } | null>(null);

  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>루틴별 수행</SectionTitle>
      {summary.routineRows.length === 0 ? (
        <Text variant="bodySm" tone="muted">
          이 기간에 해야 했던 루틴이 없어요.
        </Text>
      ) : (
        <ul className="flex flex-col">
          {summary.routineRows.map((row) => {
            const rate = toPercent(row.done, row.total) ?? 0;
            return (
              <li key={row.routine.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpened({ routine: row.routine, category: row.category })}
                  aria-label={`${row.routine.title} 기록 보기`}
                  className="grid w-full grid-cols-[minmax(0,1fr)_64px_40px] items-center gap-x-3 py-3 text-left text-sm pressable sm:grid-cols-[180px_1fr_64px_40px]"
                >
                  <span className="min-w-0 truncate text-base">{row.routine.title}</span>
                  <span className="hidden h-2 overflow-hidden rounded-full bg-line sm:block">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${rate}%` }}
                    />
                  </span>
                  <span className="text-right">
                    {row.done} / {row.total}
                  </span>
                  <span className="text-right text-content-muted">{rate}%</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Text variant="caption" tone="muted">
        루틴을 누르면 그 루틴의 수행 달력과 요일별 기록을 볼 수 있어요.
      </Text>

      {opened && (
        <RoutineHistoryModal
          routine={opened.routine}
          category={opened.category}
          onClose={() => setOpened(null)}
        />
      )}
    </section>
  );
};

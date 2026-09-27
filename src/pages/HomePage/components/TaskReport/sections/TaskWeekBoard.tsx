import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import type { Task } from "@/shared/api/task";
import { getCategoryTextColor } from "@/shared/constants/colors";
import { getDayLabel, getWeekendTextClass } from "@/shared/constants/dateLabels";
import { parseYmd } from "@/shared/utils/formatDate";
import { cn } from "@/shared/ui/cn";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { Text } from "@/shared/ui/primitives";
import type { TaskWeekDay, useTaskWeek } from "../hooks/useTaskWeek";

/** 목록 정렬(SortableList)과 같은 감도. 짧게 누른 것은 끌기가 아니라 누르기다 */
const ACTIVATION_CONSTRAINT = { delay: 150, tolerance: 5 };

/**
 * 한 주 보기. 이레를 나란히 놓고 날마다 할 일과 루틴이 얼마나 있는지 보여 준다.
 *
 * 할 일을 다른 날로 끌어 놓으면 그날로 옮긴다. 날짜를 누르면 그날의 하루 보기로 돌아간다.
 * 막대는 이번 주에서 가장 많은 날을 기준으로 한 상대 길이다.
 */
export const TaskWeekBoard = ({
  week,
  todayYmd,
  onSelectDate,
}: {
  week: ReturnType<typeof useTaskWeek>;
  todayYmd: string;
  onSelectDate: (date: string) => void;
}) => {
  const [dragging, setDragging] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: ACTIVATION_CONSTRAINT }),
  );

  const loads = week.days.map(
    (day) => day.tasks.length + (day.routineCount ?? 0),
  );
  const maxLoad = Math.max(...loads, 1);

  const handleDragStart = (event: DragStartEvent) => {
    setDragging((event.active.data.current?.task as Task | undefined) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(null);
    const task = event.active.data.current?.task as Task | undefined;
    const nextDate = event.over?.id;
    if (!task || typeof nextDate !== "string" || nextDate === task.date) return;
    void week.moveTask(task, nextDate);
  };

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-7">
          {week.days.map((day, index) => (
            <DayColumn
              key={day.date}
              day={day}
              isToday={day.date === todayYmd}
              loadRatio={loads[index] / maxLoad}
              movingIds={week.movingIds}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>

        <DragOverlay>
          {dragging && (
            <div className="rotate-[-2deg] rounded-md bg-surface-raised px-1.5 py-2 shadow-(--shadow-drag)">
              <TaskLine task={dragging} completed={false} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Text variant="caption" tone="muted">
        할 일을 길게 눌러 다른 날로 옮길 수 있어요. 날짜를 누르면 그날 목록으로 돌아가요.
      </Text>
    </div>
  );
};

const DayColumn = ({
  day,
  isToday,
  loadRatio,
  movingIds,
  onSelectDate,
}: {
  day: TaskWeekDay;
  isToday: boolean;
  loadRatio: number;
  movingIds: Set<string>;
  onSelectDate: (date: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: day.date });
  const weekday = parseYmd(day.date)?.getDay() ?? 0;
  const dayNumber = Number(day.date.slice(8, 10));

  return (
    <section
      ref={setNodeRef}
      aria-label={`${Number(day.date.slice(5, 7))}월 ${dayNumber}일`}
      className={cn(
        "flex min-w-0 flex-col gap-2.5 rounded-lg px-2 py-3 transition-colors sm:min-h-72",
        isToday ? "bg-surface-sunken" : "bg-surface",
        isOver && "bg-surface-selected",
      )}
    >
      <button
        type="button"
        onClick={() => onSelectDate(day.date)}
        aria-label={`${Number(day.date.slice(5, 7))}월 ${dayNumber}일 하루 보기`}
        className={cn(
          "flex items-baseline gap-1.5 pressable sm:flex-col sm:items-center sm:gap-0.5",
          getWeekendTextClass(weekday),
        )}
      >
        <span className="text-xs">{getDayLabel(weekday)}</span>
        <span className="text-lg font-bold">{dayNumber}</span>
      </button>

      <div className="flex flex-col gap-1">
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(loadRatio * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-content-muted">
          <span>할 일 {day.tasks.length}</span>
          {day.routineCount !== null && <span>루틴 {day.routineCount}</span>}
        </div>
      </div>

      {day.isLoading ? (
        <SkeletonBlock className="h-4 w-full" />
      ) : (
        <ul className="flex flex-col gap-2">
          {day.tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              completed={Boolean(day.logMap.get(task.id)?.completed)}
              disabled={task.id.startsWith("temp-") || movingIds.has(task.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

const DraggableTask = ({
  task,
  completed,
  disabled,
}: {
  task: Task;
  completed: boolean;
  disabled: boolean;
}) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`${task.title}${completed ? " (완료)" : ""}`}
      className={cn(
        "cursor-grab rounded-sm",
        isDragging && "opacity-30",
        disabled && "cursor-default opacity-60",
      )}
    >
      <TaskLine task={task} completed={completed} />
    </li>
  );
};

const TaskLine = ({ task, completed }: { task: Task; completed: boolean }) => {
  const color = getCategoryTextColor(task.categoryColor);
  return (
    <div className="flex items-start gap-1.5 text-[13px] leading-snug">
      <span className="mt-0.5 shrink-0">
        {completed ? (
          <FaCheckCircle size={13} color={color} />
        ) : (
          <LuCircleDashed size={13} color={color} />
        )}
      </span>
      <span className={cn("min-w-0 break-words", completed && "line-through opacity-60")}>
        {task.title}
      </span>
    </div>
  );
};

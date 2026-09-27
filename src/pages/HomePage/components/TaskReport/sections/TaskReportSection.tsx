import { useMemo, useState } from "react";
import TitleSection from "../../TitleSection";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateToYmd, getTodayYmd, parseYmd } from "@/shared/utils/formatDate";
import { moveDay, moveWeek } from "@/shared/utils/dateNavigation";
import { SegmentedToggle } from "@/shared/ui/SegmentedToggle";
import { useTaskList } from "../hooks/useTaskList";
import { useTaskWeek } from "../hooks/useTaskWeek";
import { TaskListSection } from "./TaskList";
import { TaskSetting } from "./TaskSetting";
import { TaskWeekBoard } from "./TaskWeekBoard";

type ViewMode = "day" | "week";

const NO_DATES: string[] = [];

const VIEW_OPTIONS = [
  { value: "day", label: "하루" },
  { value: "week", label: "한 주" },
] as const satisfies readonly { value: ViewMode; label: string }[];

/** 선택 날짜가 든 주의 일요일부터 토요일까지 */
const getWeekDates = (selectedYmd: string) => {
  const base = parseYmd(selectedYmd) ?? new Date();
  const sunday = new Date(base);
  sunday.setDate(base.getDate() - base.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return formatDateToYmd(date);
  });
};

const formatMonthDay = (ymd: string) =>
  `${Number(ymd.slice(5, 7))}월 ${Number(ymd.slice(8, 10))}일`;

/**
 * 홈 화면의 할 일 섹션 컨테이너입니다.
 * 헤더 네비게이션, 하루·한 주 보기, 설정 섹션을 조합합니다.
 *
 * 할 일 데이터는 여기서 한 번 읽어 목록에 내린다. 새로고침 버튼이 이 컴포넌트에
 * 있어서인데, 목록이 자기 refresh 함수를 콜백으로 올려 주던 예전 방식은 렌더마다
 * 새 함수가 만들어져 effect 가 매번 다시 돌았다.
 */
function TaskReportSection() {
  const { user } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const dateString = formatDateToYmd(selectedDate);
  const isWeek = viewMode === "week";

  const taskList = useTaskList({ userId: user?.uid, dateString });

  const weekDates = useMemo(() => getWeekDates(dateString), [dateString]);
  // 하루 보기에서는 주를 읽지 않는다. 날짜 목록을 비우면 쿼리가 하나도 만들어지지 않는다
  const week = useTaskWeek({
    userId: user?.uid,
    weekDates: isWeek ? weekDates : NO_DATES,
  });

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일`;

  // 그날 할 일 중 몇 개를 끝냈는지. 이미 불러온 목록에서 세므로 조회가 늘지 않는다
  const dayTasks = taskList.tasks.filter((task) => task.date === dateString);
  const doneCount = dayTasks.filter(
    (task) => taskList.taskLogMap.get(task.id)?.completed
  ).length;
  const daySubTitle =
    !taskList.isLoading && dayTasks.length > 0
      ? `${label} · ${doneCount} / ${dayTasks.length} 완료`
      : label;

  const weekTaskCount = week.days.reduce((sum, day) => sum + day.tasks.length, 0);
  const weekDoneCount = week.days.reduce((sum, day) => sum + day.doneCount, 0);
  const weekLabel = `${formatMonthDay(weekDates[0])} ~ ${formatMonthDay(weekDates[6])}`;
  const weekSubTitle =
    weekTaskCount > 0
      ? `${weekLabel} · ${weekDoneCount} / ${weekTaskCount} 완료`
      : weekLabel;

  const move = (diff: number) =>
    setSelectedDate(
      isWeek ? moveWeek(selectedDate, diff) : moveDay(selectedDate, diff),
    );

  return (
    <div>
      <TitleSection
        title="할 일 목록"
        subTitle={isWeek ? weekSubTitle : daySubTitle}
        leftOnClick={() => move(-1)}
        rightOnClick={() => move(1)}
        onTodayClick={() => setSelectedDate(new Date())}
        onRefreshClick={() => {
          void (isWeek ? week.refresh() : taskList.refresh());
        }}
        extra={
          <SegmentedToggle
            options={VIEW_OPTIONS}
            value={viewMode}
            onChange={setViewMode}
            label="보기"
          />
        }
      />
      {isWeek ? (
        <div className="mt-4">
          <TaskWeekBoard
            week={week}
            todayYmd={getTodayYmd()}
            onSelectDate={(date) => {
              setSelectedDate(parseYmd(date) ?? selectedDate);
              setViewMode("day");
            }}
          />
        </div>
      ) : (
        <>
          <TaskListSection taskList={taskList} dateString={dateString} />
          {/* 목록 메뉴는 고른 하루에 대한 일괄 동작이라 하루 보기에서만 둔다 */}
          <div className="mt-8 pb-8">
            <TaskSetting />
          </div>
        </>
      )}
    </div>
  );
}

export default TaskReportSection;

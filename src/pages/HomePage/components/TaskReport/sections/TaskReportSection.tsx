import TitleSection from "../../TitleSection";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { moveDay } from "@/shared/hooks/dateNavigation";
import { TaskListSection } from "./TaskList";
import { Space8 } from "@/shared/ui/Space";
import { TaskSetting } from "./TaskSetting";
import { useRef } from "react";

/**
 * 홈 화면의 일간 할 일 리포트 섹션 컨테이너입니다.
 * 헤더 네비게이션, 목록 섹션, 설정 섹션을 조합합니다.
 */
function TaskReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const refreshRef = useRef<(() => Promise<void>) | null>(null);

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일`;

  return (
    <div>
      <TitleSection
        title="할 일 목록"
        subTitle={label}
        leftOnClick={() => setSelectedDate(moveDay(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveDay(selectedDate, 1))}
        onTodayClick={() => setSelectedDate(new Date())}
        onRefreshClick={() => {
          void refreshRef.current?.();
        }}
      />
      <TaskListSection
        onReadyRefresh={(refresh) => {
          refreshRef.current = refresh;
        }}
      />
      <Space8 direction="mb" />
      <TaskSetting />
      <Space8 direction="mb" />
    </div>
  );
}

export default TaskReportSection;

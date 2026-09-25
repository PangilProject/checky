import TitleSection from "../../TitleSection";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateToYmd } from "@/shared/utils/formatDate";
import { moveDay } from "@/shared/utils/dateNavigation";
import { useTaskList } from "../hooks/useTaskList";
import { TaskListSection } from "./TaskList";
import { TaskSetting } from "./TaskSetting";

/**
 * 홈 화면의 일간 할 일 리포트 섹션 컨테이너입니다.
 * 헤더 네비게이션, 목록 섹션, 설정 섹션을 조합합니다.
 *
 * 할 일 데이터는 여기서 한 번 읽어 목록에 내린다. 새로고침 버튼이 이 컴포넌트에
 * 있어서인데, 목록이 자기 refresh 함수를 콜백으로 올려 주던 예전 방식은 렌더마다
 * 새 함수가 만들어져 effect 가 매번 다시 돌았다.
 */
function TaskReportSection() {
  const { user } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const dateString = formatDateToYmd(selectedDate);

  const taskList = useTaskList({ userId: user?.uid, dateString });

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일`;

  // 그날 할 일 중 몇 개를 끝냈는지. 이미 불러온 목록에서 세므로 조회가 늘지 않는다
  const dayTasks = taskList.tasks.filter((task) => task.date === dateString);
  const doneCount = dayTasks.filter(
    (task) => taskList.taskLogMap.get(task.id)?.completed
  ).length;
  const subTitle =
    !taskList.isLoading && dayTasks.length > 0
      ? `${label} · ${doneCount} / ${dayTasks.length} 완료`
      : label;

  return (
    <div>
      <TitleSection
        title="할 일 목록"
        subTitle={subTitle}
        leftOnClick={() => setSelectedDate(moveDay(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveDay(selectedDate, 1))}
        onTodayClick={() => setSelectedDate(new Date())}
        onRefreshClick={() => {
          void taskList.refresh();
        }}
      />
      <TaskListSection taskList={taskList} dateString={dateString} />
      <div className="mt-8 pb-8">
        <TaskSetting />
      </div>
    </div>
  );
}

export default TaskReportSection;

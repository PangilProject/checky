/**
 * 필름 속 화면의 부제. 실제 화면과 같은 형식으로 만든다.
 * (TaskReportSection, getWeekRangeInfo, getMonthLabel)
 */
import { DEMO_MONTH, DEMO_TODAY, DEMO_YEAR } from "../constants/demoData";

export const getDayLabel = (day: number) => `${DEMO_YEAR}년 ${DEMO_MONTH}월 ${day}일`;

/** 할 일 목록의 부제. 그날 할 일이 있으면 완료 수를 붙인다 */
export const getTaskSubTitle = (day: number, done: number, total: number) =>
  total > 0 ? `${getDayLabel(day)} · ${done} / ${total} 완료` : getDayLabel(day);

export const WEEK_LABEL = `${DEMO_MONTH}월 ${DEMO_TODAY}일 ~ ${DEMO_MONTH}월 ${DEMO_TODAY + 6}일`;

export const MONTH_LABEL = `${DEMO_YEAR}년 ${DEMO_MONTH}월`;

/**
 * 시점마다 이야기가 어떤 상태인지 계산한다.
 *
 * 위치·크기 같은 움직임은 tracks.ts 가 맡고, 여기서는 "무엇이 체크됐는가",
 * "달력이 며칠까지 찼는가", "밤인가 낮인가" 처럼 화면 내용을 정하는 값만 다룬다.
 * 모두 시점(time)의 순수 함수라 위로 되감으면 그대로 거꾸로 흐른다.
 */
import {
  DEMO_LAST_DAY,
  DEMO_TODAY,
  HERO_ITEM_ID,
  isWeekCellDone,
  type CellChecked,
} from "../constants/demoData";
import { clamp, lerp, progressBetween } from "./timelineMath";
import { TIMELINE_LENGTH, STORY_LENGTH, at } from "../constants/scenes";

/** 장면 안의 중요한 시점. 움직임(tracks)과 내용(narrative)이 같은 표를 본다 */
export const MARKS = {
  /** 오프닝: 할 일이 하나씩 쌓이기 시작하는 때와 간격 */
  pileStart: at("opening", 0.1),
  pileGap: at("opening", 0.1) - at("opening", 0),

  focusStart: at("check", 0),
  focusEnd: at("check", 0.16),
  /** 직접 누르지 않았을 때 체크 선이 저절로 그려지는 구간 */
  autoDrawStart: at("check", 0.3),
  autoCheckAt: at("check", 0.4),
  escapeStart: at("check", 0.44),
  escapeEnd: at("check", 0.62),
  revealStart: at("check", 0.64),
  characterIn: at("check", 0.74),
  revealEnd: at("check", 0.9),

  enterStart: at("enter", 0),
  enterEnd: at("enter", 0.36),
  phoneOutStart: at("enter", 0.46),
  phoneOutEnd: at("enter", 0.64),
  phoneInStart: at("enter", 0.74),
  phoneInEnd: at("enter", 0.96),

  splitStart: at("split", 0.04),
  splitEnd: at("split", 0.56),

  weekFillStart: at("calendar", 0),
  weekFillEnd: at("calendar", 0.34),
  collapseStart: at("calendar", 0.42),
  collapseEnd: at("calendar", 0.76),
  weeksInEnd: at("calendar", 0.86),

  monthFillStart: at("stats", 0),
  monthFillEnd: at("stats", 0.34),
  barsStart: at("stats", 0.4),
  barsEnd: at("stats", 0.76),

  lineStart: at("ending", 0),
  lineEnd: at("ending", 0.18),
  checkShapeEnd: at("ending", 0.34),
  pullbackStart: at("ending", 0.56),
  pullbackEnd: at("ending", 0.8),
  ctaStart: at("ending", 0.76),
  ctaEnd: at("ending", 0.92),
} as const;

/** 밤이 걷히는 구간과 다시 오는 구간 */
const DAWN = { start: at("check", 0.7), end: at("check", 0.86) };
const DUSK = { start: at("stats", 0.18), end: at("stats", 0.4) };
const TAIL = { start: STORY_LENGTH, end: TIMELINE_LENGTH - 10 };

/**
 * 어두운 정도. 1 이면 다크 토큰, 0 이면 라이트 토큰이다.
 * 밤 → 아침 → 하루 → 한 달 → 밤. 이야기가 끝나면 방문자의 실제 테마로 돌아간다.
 */
export const getNight = (time: number, visitorPrefersDark: boolean) => {
  if (time < DUSK.start) return 1 - progressBetween(time, DAWN.start, DAWN.end);
  if (time < TAIL.start) return progressBetween(time, DUSK.start, DUSK.end);
  return visitorPrefersDark ? 1 : 1 - progressBetween(time, TAIL.start, TAIL.end);
};

/** 오프닝에서 i 번째 할 일이 나타난 정도 (0~1) */
export const getPileAppear = (time: number, index: number) => {
  const start = MARKS.pileStart + MARKS.pileGap * index;
  return progressBetween(time, start, start + MARKS.pileGap * 1.4);
};

/** 오프닝이 얼마나 답답해졌는지 (0~1). 마지막 할 일이 놓인 뒤까지 천천히 차오른다 */
export const getPileWeight = (time: number) =>
  progressBetween(time, MARKS.pileStart, MARKS.focusEnd);

/**
 * 주인공 체크의 선이 그려진 정도 (0~1).
 * 직접 눌렀다면 누른 순간 끝까지 그려지고(짧은 애니메이션은 화면 쪽이 맡는다),
 * 누르지 않았다면 스크롤을 따라 저절로 그려진다. 사용자를 기다리게 하지 않는다.
 */
export const getCheckDraw = (time: number, userChecked: boolean) =>
  userChecked ? 1 : progressBetween(time, MARKS.autoDrawStart, MARKS.autoCheckAt);

export const isHeroChecked = (time: number, userChecked: boolean) =>
  getCheckDraw(time, userChecked) >= 1;

/**
 * 주간 표에서 체크가 채워진 마지막 요일 (0=일).
 * -1 이면 아직 아무 요일도 채워지지 않았다.
 */
export const getWeekFilledUntil = (time: number) => {
  const amount = progressBetween(time, MARKS.weekFillStart, MARKS.weekFillEnd);
  return amount === 0 ? -1 : Math.min(6, Math.floor(amount * 7));
};

/**
 * 그 시점에 주간 표 칸이 체크돼 있는지.
 * 일요일의 물 한 잔은 사용자가 이미 체크한 칸이라, 표가 생길 때부터 채워져 있다.
 */
export const weekCheckedAt =
  (time: number): CellChecked =>
  (routine, weekday) =>
    isWeekCellDone(routine, weekday) &&
    (weekday <= getWeekFilledUntil(time) ||
      (routine.id === HERO_ITEM_ID && weekday === 0));

/** 달력에서 기록이 채워진 마지막 날짜 */
export const getMonthFilledUntil = (time: number) => {
  if (time < MARKS.monthFillStart) {
    // 이번 주가 채워지는 동안에는 이번 주 요일만큼 날짜가 흐른다
    return DEMO_TODAY + Math.max(0, getWeekFilledUntil(time));
  }
  const amount = progressBetween(time, MARKS.monthFillStart, MARKS.monthFillEnd);
  return Math.round(lerp(DEMO_TODAY + 6, DEMO_LAST_DAY, amount));
};

/** 화면 제목에 쓰는 "이야기 속 오늘" */
export const getStoryDay = (time: number) =>
  clamp(getMonthFilledUntil(time), DEMO_TODAY, DEMO_LAST_DAY);

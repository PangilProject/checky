/**
 * 필름의 "내용"을 시점에 맞춰 DOM 에 쓴다. 위치가 아니라 체크 상태·숫자·링·테마다.
 *
 * React state 를 매 프레임 바꾸면 트리 전체가 다시 그려지므로, 처음에 요소를 한 번 찾아 두고
 * 값이 달라졌을 때만 속성을 고친다. 어떤 값을 쓸지는 모두 narrative.ts 의 순수 함수가 정한다.
 */
import { getCategoryTextColor } from "@/shared/constants/colors";
import { CHECK_POINTS, LINE_POINTS } from "../constants/checkShape";
import { RING_LENGTH } from "../constants/calendarRing";
import {
  DEMO_CALENDAR,
  DEMO_CATEGORIES,
  DEMO_ITEMS,
  DEMO_RATE,
  DEMO_ROUTINES,
  DEMO_TASKS,
  DEMO_TODAY,
  DEMO_WEEK,
  DEMO_WEEK_ROW_INDEX,
  HERO_ITEM_ID,
  demoDay,
  getRoutineRowTotal,
  getWeekTotal,
} from "../constants/demoData";
import { getSceneIndex } from "../constants/scenes";
import { cellActor, ringActor } from "./buildTracks";
import {
  MARKS as M,
  getCheckDraw,
  getMonthFilledUntil,
  getNight,
  isHeroChecked,
  weekCheckedAt,
} from "./narrative";
import { getTaskSubTitle } from "./storyLabels";
import { lerp, progressBetween } from "./timelineMath";

export interface EffectContext {
  /** 방문자가 직접 체크했는지 */
  userChecked: () => boolean;
  /** 이야기가 끝난 뒤 돌아갈 테마 */
  visitorPrefersDark: boolean;
  /** 라이트·다크 바탕색 (토큰에서 읽은 값) */
  surface: { light: Rgb; dark: Rgb };
  /** 밤이 깊어져 다크로 넘어갔다·돌아왔다 */
  onNightChange: (isDark: boolean) => void;
  /** 무대 바탕 */
  stage: HTMLElement;
  /** 진행 표시 */
  progress: HTMLElement | null;
}

export type Rgb = readonly [number, number, number];

/** "rgb(20, 20, 20)" → [20, 20, 20] */
export const parseRgb = (value: string): Rgb => {
  const [r = 0, g = 0, b = 0] = value.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  return [r, g, b];
};

const mixRgb = (from: Rgb, to: Rgb, amount: number) =>
  `rgb(${from.map((channel, index) => Math.round(lerp(channel, to[index], amount))).join(", ")})`;

/** 같은 값을 다시 쓰지 않는 작은 쓰기 도구 */
const createWriter = () => {
  const last = new WeakMap<Element, Map<string, string>>();
  const changed = (element: Element, key: string, value: string) => {
    let values = last.get(element);
    if (!values) {
      values = new Map();
      last.set(element, values);
    }
    if (values.get(key) === value) return false;
    values.set(key, value);
    return true;
  };
  return {
    attr(element: Element | null | undefined, name: string, value: string) {
      if (element && changed(element, `a:${name}`, value)) element.setAttribute(name, value);
    },
    text(element: Element | null | undefined, value: string) {
      if (element && changed(element, "text", value)) element.textContent = value;
    },
    style(element: HTMLElement | SVGElement | null | undefined, name: string, value: string) {
      if (element && changed(element, `s:${name}`, value)) element.style.setProperty(name, value);
    },
  };
};

const toPoints = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

export const createFilmEffects = (root: HTMLElement, context: EffectContext) => {
  const write = createWriter();
  const actor = (id: string) =>
    root.querySelector<HTMLElement>(`[data-actor="${CSS.escape(id)}"]`);
  const inside = <T extends Element = HTMLElement>(id: string, selector: string) =>
    actor(id)?.querySelector<T>(selector) ?? null;

  const itemIcons = DEMO_ITEMS.map((item) => ({
    item,
    icon: inside(`icon:${item.id}`, "[data-check-icon]"),
  }));
  const heroTitle = inside(`title:${HERO_ITEM_ID}`, "[data-done]");
  const cells = DEMO_ROUTINES.flatMap((routine) =>
    DEMO_WEEK.slice(1).map((_, index) => ({
      routine,
      weekday: index + 1,
      icon: inside(cellActor(routine.id, index + 1), "[data-check-icon]"),
    })),
  );
  const rowSums = DEMO_ROUTINES.map((routine) => ({
    routine,
    text: inside(`rsum:${routine.id}`, "[data-text]"),
  }));
  const weekTotals = DEMO_WEEK.map((_, weekday) => ({
    weekday,
    actor: actor(ringActor(DEMO_WEEK_ROW_INDEX, weekday)),
  }));
  const weekSum = inside("tt:sum", "[data-text]");
  const rings = DEMO_CALENDAR.flatMap((week, row) =>
    week
      .filter((slot) => slot.inMonth)
      .map((slot) => {
        const ring = inside(ringActor(row, slot.weekday), "[data-ring]");
        return {
          day: slot.day,
          ring,
          arc: ring?.querySelector("[data-ring-arc]") ?? null,
          count: ring?.querySelector("[data-ring-count]") ?? null,
        };
      }),
  );
  const taskSub = inside("taskSub", "[data-text]");
  const catCount = inside("cat", "[data-count]");
  const variants = (id: string) =>
    Array.from(actor(id)?.querySelectorAll<HTMLElement>("[data-variant]") ?? []);
  const mainTitle = variants("mainTitle");
  const mainSub = variants("mainSub");
  const mainCtl = variants("mainCtl");
  const rate = inside("rate", "[data-rate]");
  const check = actor("check");
  const checkLine = inside<SVGPolylineElement>("check", "[data-check-line]");
  const character = actor("char");
  const phoneLine = inside<SVGRectElement>("phone", "[data-phone-line]");
  const hit = actor("hit");
  const hitButton = inside("hit", "[data-hit]");
  const cta = actor("cta");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const dots = Array.from(context.progress?.querySelectorAll<HTMLElement>("[data-scene]") ?? []);

  const splitMid = lerp(M.splitStart, M.splitEnd, 0.5);
  const collapseMid = lerp(M.collapseStart, M.collapseEnd, 0.5);
  const barsMid = lerp(M.barsStart, M.barsEnd, 0.4);
  let wasDark: boolean | null = null;

  const setVariant = (items: HTMLElement[], index: number) =>
    items.forEach((item, position) => write.attr(item, "data-active", String(position === index)));

  return (time: number) => {
    const userChecked = context.userChecked();
    const heroChecked = isHeroChecked(time, userChecked);
    const weekChecked = weekCheckedAt(time);
    const afterSplit = time >= splitMid;

    /* 체크 아이콘 */
    for (const { item, icon } of itemIcons) {
      const isRoutine = item.kind === "routine";
      const checked =
        item.id === HERO_ITEM_ID
          ? heroChecked
          : isRoutine && time >= M.splitStart && weekChecked(item, 0);
      write.attr(icon, "data-checked", String(checked));
      // 정리되며 루틴 칸으로 옮겨 갈 때부터 분류 색이 입혀진다
      write.style(
        icon,
        "color",
        getCategoryTextColor(isRoutine && afterSplit ? DEMO_CATEGORIES[item.category].color : DEMO_CATEGORIES.inbox.color),
      );
    }
    write.attr(heroTitle, "data-done", String(heroChecked && !afterSplit));
    for (const { routine, weekday, icon } of cells) {
      write.attr(icon, "data-checked", String(weekChecked(routine, weekday)));
    }

    /* 표의 합계 */
    for (const { routine, text } of rowSums) {
      const total = getRoutineRowTotal(routine, weekChecked);
      write.text(text, `${total.done} / ${total.total}`);
    }
    let weekDone = 0;
    let weekAll = 0;
    const morph = progressBetween(time, lerp(M.collapseStart, M.collapseEnd, 0.25), lerp(M.collapseStart, M.collapseEnd, 0.7));
    for (const { weekday, actor: element } of weekTotals) {
      const total = getWeekTotal(weekday, weekChecked);
      weekDone += total.done;
      weekAll += total.total;
      write.text(element?.querySelector("[data-text]"), `${total.done}/${total.total}`);
      write.style(element, "--m", morph.toFixed(3));
    }
    write.text(weekSum, `${weekDone} / ${weekAll}`);

    /* 달력 링. 기록이 채워진 날까지만 완료가 찬다 */
    const filledUntil = getMonthFilledUntil(time);
    for (const { day, ring, arc, count } of rings) {
      const { total, completed } = demoDay(day);
      const done = day <= filledUntil ? completed : 0;
      write.attr(arc, "stroke-dasharray", `${total > 0 ? (RING_LENGTH * done) / total : 0} ${RING_LENGTH}`);
      write.text(count, String(total - done));
      write.attr(ring, "data-done", String(total > 0 && done === total));
    }

    /* 머리의 글자 */
    write.text(
      taskSub,
      afterSplit
        ? getTaskSubTitle(DEMO_TODAY, 0, DEMO_TASKS.length)
        : getTaskSubTitle(DEMO_TODAY, heroChecked ? 1 : 0, DEMO_ITEMS.length),
    );
    write.text(catCount, afterSplit ? `0 / ${DEMO_TASKS.length}` : `${heroChecked ? 1 : 0} / ${DEMO_ITEMS.length}`);
    setVariant(mainTitle, time < collapseMid ? 0 : time < barsMid ? 1 : 2);
    setVariant(mainSub, time < collapseMid ? 0 : 1);
    setVariant(mainCtl, time < barsMid ? 0 : 1);
    write.text(rate, String(Math.round(DEMO_RATE * progressBetween(time, M.barsStart, M.barsEnd))));

    /* 이야기의 체크: 그려진 정도, 색, 모양 */
    const draw = time < M.escapeStart ? getCheckDraw(time, userChecked) : 1;
    write.attr(checkLine, "stroke-dashoffset", (1 - draw).toFixed(3));
    // 그려지는 동안은 글자색, 체크가 끝나 원이 채워지면 원의 뚫린 자리(바탕색)가 된다
    const lift =
      time < M.escapeStart
        ? heroChecked
          ? 0
          : 1
        : time < M.enterStart
          ? progressBetween(time, M.escapeStart, lerp(M.escapeStart, M.escapeEnd, 0.4))
          : time < M.lineStart
            ? 1 - progressBetween(time, M.enterStart, M.enterEnd)
            : 1;
    write.style(check, "--lift", lift.toFixed(3));
    const fold = time < M.lineStart ? 1 : progressBetween(time, M.lineEnd, M.checkShapeEnd);
    write.attr(
      checkLine,
      "points",
      toPoints(CHECK_POINTS.map((point, index) => [
        lerp(LINE_POINTS[index][0], point[0], fold),
        lerp(LINE_POINTS[index][1], point[1], fold),
      ] as const)),
    );

    /* 캐릭터: 앱 머리에서는 원 없는 로고 */
    const plain = progressBetween(time, M.enterStart, M.enterEnd) - progressBetween(time, M.pullbackStart, M.pullbackEnd);
    write.style(character, "--plain", plain.toFixed(3));

    /* 휴대폰 테두리가 그려졌다 지워진다 */
    const phone = progressBetween(time, M.phoneOutStart, M.phoneOutEnd) - progressBetween(time, M.phoneInStart, M.phoneInEnd);
    write.attr(phoneLine, "stroke-dashoffset", (1 - phone).toFixed(3));

    /* 누를 수 있는 동안만 키보드 순서에 넣는다 */
    const canCheck = time >= M.focusEnd - 4 && time < M.escapeStart;
    if (hit) hit.inert = !canCheck;
    write.attr(hitButton, "aria-pressed", String(heroChecked));
    if (cta) cta.inert = time < lerp(M.ctaStart, M.ctaEnd, 0.6);

    /* 밤과 낮 */
    const night = getNight(time, context.visitorPrefersDark);
    const background = mixRgb(context.surface.light, context.surface.dark, night);
    write.style(context.stage, "background-color", background);
    if (themeColor) write.attr(themeColor, "content", background);
    const isDark = night >= 0.5;
    if (isDark !== wasDark) {
      wasDark = isDark;
      context.onNightChange(isDark);
    }

    /* 진행 표시 */
    const sceneIndex = getSceneIndex(time);
    dots.forEach((dot, index) => write.attr(dot, "data-active", String(index === sceneIndex)));
  };
};

/**
 * 필름의 배우마다 "언제, 어느 장면의 어느 자리에" 있는지 적은 표.
 *
 * 원칙: 사라지지 않고 변한다. 앞 장면의 요소가 자리를 옮기고 모양을 바꿔 다음 장면의 요소가 된다.
 *   체크 → 캐릭터의 팔 → 목록의 체크 → 요일 칸 → 달력 링 → 주별 막대 → 가로선 → 체크 → 팔
 * 새로 생기는 요소도 가까운 요소에서 떨어져 나오거나(요일 칸) 화면 밖에서 밀려 들어온다(다른 주).
 *
 * 시점은 모두 utils/narrative.ts 의 MARKS 로 적는다. 위치는 프레임의 표식 이름으로 적는다.
 */
import { WEEK_LABELS } from "@/shared/constants/dateLabels";
import { ICON_CHECK_BOX } from "../constants/checkShape";
import {
  DEMO_CALENDAR,
  DEMO_ITEMS,
  DEMO_ROUTINES,
  DEMO_WEEK_ROWS,
  DEMO_WEEK_ROW_INDEX,
  HERO_ITEM_ID,
  LIST_ORDER,
} from "../constants/demoData";
import { at } from "../constants/scenes";
import type { Key, Track } from "./filmPose";
import { MARKS as M } from "./narrative";
import { EASE } from "./timelineMath";

export type Layer = "world" | "hud";

export interface FilmTrack extends Track {
  layer: Layer;
}

/** 할 일이 흩어진 채 쌓이는 순서. 주인공은 이미 가운데 있고 이름만 마지막에 붙는다 */
const pileIndex = (id: string) => DEMO_ITEMS.findIndex((item) => item.id === id);

const appearAt = (index: number) => M.pileStart + M.pileGap * index;

/** 표에서 요일 칸 한 개의 배우 이름. 일요일 칸은 루틴 아이콘 자신이다 */
export const cellActor = (routineId: string, weekday: number) =>
  weekday === 0 ? `icon:${routineId}` : `cell:${routineId}:${weekday}`;

/** 달력 칸의 링 배우. 이번 주 줄은 주간 표의 합계 칸이 접혀 들어온 것이다 */
export const ringActor = (row: number, weekday: number) =>
  row === DEMO_WEEK_ROW_INDEX ? `tot:${weekday}` : `ring:${row}:${weekday}`;

/** 달력 칸의 날짜 배우. 이번 주 줄은 주간 표 머리의 날짜가 내려온 것이다 */
export const dateActor = (row: number, weekday: number) =>
  row === DEMO_WEEK_ROW_INDEX ? `hd:${weekday}` : `date:${row}:${weekday}`;

/** 달성 현황이 끝나고 한 줄로 모일 때, 막대가 아닌 요소들이 함께 접혀 들어가는 자리 */
const intoLine = (t: number): Key => ({ t, frame: "finale", anchor: "big", s: 0.02, o: 0, dx: 0, dy: 0, ax: 0, ay: 0 });

export const buildTracks = ({ wide }: { wide: boolean }): FilmTrack[] => {
  const tracks: FilmTrack[] = [];
  const add = (track: FilmTrack) => tracks.push(track);

  /* ---------- 문장 ---------- */

  add({
    id: "cap:question",
    layer: "hud",
    fit: "height",
    keys: [
      { t: 0, frame: "pile", anchor: "cap:question" },
      { t: M.focusStart },
      { t: M.focusEnd, frame: "focus", o: 0.45 },
      { t: M.escapeStart },
      { t: M.escapeEnd, dy: -0.3, o: 0 },
    ],
  });

  // 문장은 프레임과 같은 폭을 받아 같은 자리에서 줄을 바꾼다 (좁은 화면에서 두 줄이 되는 문장)
  const caption = (id: string, frame: string, inStart: number, inEnd: number, outStart: number, outEnd: number): FilmTrack => ({
    id: `cap:${id}`,
    layer: "hud",
    fit: "box",
    content: true,
    keys: [
      { t: inStart, frame, anchor: `cap:${id}`, o: 0, dy: 0.03 },
      { t: inEnd, o: 1, dy: 0, ease: EASE.out },
      { t: outStart },
      { t: outEnd, o: 0, dy: -0.03, ease: EASE.in },
    ],
  });

  add(caption("tryCheck", "focus", at("check", 0.06), M.focusEnd, M.autoCheckAt, M.escapeStart));
  add(caption("list", "list", at("enter", 0.24), at("enter", 0.36), M.splitStart, at("split", 0.2)));
  add(caption("split", "split", at("split", 0.24), at("split", 0.4), M.weekFillEnd, M.collapseStart));
  add(caption("calendar", "calendar", at("calendar", 0.56), at("calendar", 0.68), M.monthFillEnd, M.barsStart));
  add(caption("stats", "stats", at("stats", 0.6), at("stats", 0.72), at("stats", 0.94), M.lineStart));

  add({
    id: "cap:zero",
    layer: "hud",
    fit: "height",
    keys: [
      { t: at("ending", 0.22), frame: "finale", anchor: "cap:zero", o: 0, dy: 0.03 },
      { t: at("ending", 0.32), o: 1, dy: 0, ease: EASE.out },
      { t: M.pullbackStart },
      { t: at("ending", 0.66), frame: "ending" },
    ],
  });
  add({
    id: "cap:done",
    layer: "hud",
    fit: "height",
    keys: [
      { t: at("ending", 0.38), frame: "finale", anchor: "cap:done", o: 0, dy: 0.03 },
      { t: at("ending", 0.48), o: 1, dy: 0, ease: EASE.out },
      { t: M.pullbackStart },
      { t: at("ending", 0.66), frame: "ending" },
    ],
  });

  /* ---------- 할 일 ---------- */

  for (const item of DEMO_ITEMS) {
    const isHero = item.id === HERO_ITEM_ID;
    const appear = appearAt(pileIndex(item.id));
    const isRoutine = item.kind === "routine";

    // 오프닝: 바깥에서 밀려 들어와 쌓인다. 주인공의 빈 체크는 처음부터 가운데 있다
    const pileKeys = (anchor: string): Key[] =>
      isHero && anchor.startsWith("icon")
        ? [{ t: 0, frame: "pile", anchor }]
        : [
            { t: appear, frame: "pile", anchor, o: 0, s: 0.9, dy: 0.05 },
            { t: appear + M.pileGap * 1.2, o: isHero ? 1 : 0.9, s: 1, dy: 0, ease: EASE.out },
          ];

    // 체크 장면: 주인공만 앞에 서고 나머지는 물러난다. 체크가 앞에 나서면 화면 밖 아래로 비켜 선다
    const focusKeys = (anchor: string): Key[] => [
      { t: M.focusStart, s: isHero ? 1 : 1.06 },
      { t: M.focusEnd, frame: "focus", anchor, s: 1, o: isHero ? 1 : 0.3 },
      { t: M.escapeStart },
      { t: M.escapeEnd, frame: "reveal", o: 1 },
      { t: M.enterStart },
      { t: M.enterEnd, frame: "list" },
    ];

    // 정리: 할 일은 할 일 목록에 남고, 루틴은 옆 표로 빠진다
    const splitKeys = (anchor: string): Key[] => [
      { t: M.splitStart },
      { t: M.splitEnd, frame: "split", anchor },
    ];

    const titleKeys: Key[] = [
      ...pileKeys(`title:${item.id}`),
      ...focusKeys(`title:${item.id}`),
      ...splitKeys(`title:${item.id}`),
      { t: M.collapseStart },
      // 달력으로 접히는 동안 표의 이름 칸은 왼쪽으로 빠진다
      { t: M.collapseEnd, dx: isRoutine ? -0.5 : -0.8, o: 0, ease: EASE.in },
    ];
    add({ id: `title:${item.id}`, layer: "world", fit: "height", origin: "left", keys: titleKeys });

    const iconKeys: Key[] = [
      ...pileKeys(`icon:${item.id}`),
      ...focusKeys(`icon:${item.id}`),
      // 루틴의 체크는 일요일 칸이 된다
      ...splitKeys(isRoutine ? `cell:${item.id}:0` : `icon:${item.id}`),
      { t: M.collapseStart },
      isRoutine
        ? { t: M.collapseEnd, frame: "calendar", anchor: `cal:${DEMO_WEEK_ROW_INDEX}:0`, s: 0.4, o: 0 }
        : { t: M.collapseEnd, dx: -0.8, o: 0, ease: EASE.in },
    ];
    add({ id: `icon:${item.id}`, layer: "world", fit: "width", keys: iconKeys });
  }

  /* ---------- 주인공 체크 ---------- */

  add({
    id: "check",
    layer: "world",
    fit: "width",
    keys: [
      { t: 0, frame: "pile", anchor: `icon:${HERO_ITEM_ID}`, sub: ICON_CHECK_BOX, o: 0 },
      { t: M.focusStart - 1, o: 0 },
      { t: M.focusStart, o: 1 },
      { t: M.focusEnd, frame: "focus" },
      { t: M.escapeStart },
      // 체크가 원 밖으로 빠져나와 화면 한가운데를 차지한다
      { t: M.escapeEnd, frame: "reveal", anchor: "big", sub: null, ease: EASE.inOut },
      { t: M.revealStart },
      // 카메라가 물러나면, 그 체크가 캐릭터의 팔이었다는 것이 드러난다
      { t: M.revealEnd, anchor: "arm" },
      // 팔에 닿으면 그림의 팔에 자리를 넘긴다. 다크에서는 글자색과 그림의 흰색이 조금 달라 겹쳐 보인다
      { t: M.revealEnd + 3, o: 0 },
      { t: M.enterStart, o: 1 },
      // 다시 목록의 체크 아이콘 안으로 들어가 제자리를 찾는다
      { t: M.enterEnd, frame: "list", anchor: `icon:${HERO_ITEM_ID}`, sub: ICON_CHECK_BOX },
      { t: M.enterEnd + 2, o: 0 },
      // 마지막 장면: 막대들이 모인 가로선이 되어 다시 나타난다
      { t: M.lineStart, frame: "finale", anchor: "big", sub: null, o: 0 },
      { t: M.lineEnd, o: 1 },
      { t: M.pullbackStart },
      { t: at("ending", 0.7), frame: "ending", anchor: "arm" },
      { t: M.pullbackEnd },
      { t: M.pullbackEnd + 3, o: 0 },
    ],
  });

  /* ---------- 캐릭터와 워드마크 ---------- */

  const headerHops = (anchor: string): Key[] => [
    { t: M.enterStart },
    { t: M.enterEnd, frame: "list", anchor },
    { t: M.splitStart },
    { t: M.splitEnd, frame: "split" },
    { t: M.collapseStart },
    { t: M.collapseEnd, frame: "calendar" },
    { t: M.barsStart },
    { t: M.barsEnd, frame: "stats" },
    // 체크가 먼저 팔 자리에 가 있고, 앱 머리의 로고가 커지며 그 둘레를 채운다
    { t: at("ending", 0.64) },
    { t: M.pullbackEnd, frame: "ending" },
  ];

  add({
    id: "char",
    layer: "world",
    fit: "width",
    keys: [
      { t: at("check", 0.7), frame: "reveal", anchor: "char", o: 0, s: 0.94 },
      { t: M.revealEnd, o: 1, s: 1, ease: EASE.out },
      ...headerHops("char"),
    ],
  });
  add({
    id: "mark",
    layer: "world",
    fit: "height",
    keys: [
      { t: at("check", 0.8), frame: "reveal", anchor: "mark", o: 0, dy: 0.02 },
      { t: at("check", 0.94), o: 1, dy: 0, ease: EASE.out },
      ...headerHops("mark"),
    ],
  });

  /* ---------- 할 일 목록의 머리 ---------- */

  const born = (frame: string, anchor: string, start: number, end: number, from: Partial<Key> = { dy: 0.03 }): Key[] => [
    { t: start, frame, anchor, o: 0, ...from },
    { t: end, o: 1, dx: 0, dy: 0, s: 1, sw: 1, ease: EASE.out },
  ];

  for (const anchor of ["taskTitle", "taskSub", "taskCtl", "cat"]) {
    add({
      id: anchor,
      layer: "world",
      fit: anchor === "cat" ? "box" : "height",
      content: anchor === "cat",
      origin: anchor === "taskCtl" ? "right" : anchor === "cat" ? "center" : "left",
      keys: [
        ...born("list", anchor, at("enter", 0.14), M.enterEnd),
        { t: M.splitStart },
        { t: M.splitEnd, frame: "split" },
        { t: M.collapseStart },
        { t: M.collapseEnd, dx: -0.8, o: 0, ease: EASE.in },
      ],
    });
  }

  /* ---------- 루틴·달력·달성 현황이 이어 쓰는 머리 ---------- */

  for (const anchor of ["mainTitle", "mainSub", "mainCtl"]) {
    add({
      id: anchor,
      layer: "world",
      fit: "height",
      origin: anchor === "mainCtl" ? "right" : "left",
      keys: [
        ...born("split", anchor, at("split", 0.3), M.splitEnd, { dx: 0.08 }),
        { t: M.collapseStart },
        { t: M.collapseEnd, frame: "calendar" },
        { t: M.barsStart },
        { t: M.barsEnd, frame: "stats" },
        { t: M.lineStart },
        intoLine(M.lineEnd),
      ],
    });
  }

  /* ---------- 주간 표 ---------- */

  const tableBorn = (anchor: string) => born("split", anchor, at("split", 0.2), M.splitEnd, { dx: 0.06 });
  const tableLeaves = (dx: number): Key[] => [
    { t: M.collapseStart },
    { t: M.collapseEnd, dx, o: 0, ease: EASE.in },
  ];

  for (const anchor of ["th:label", "tt:label"]) {
    add({ id: anchor, layer: "world", fit: "height", keys: [...tableBorn(anchor), ...tableLeaves(-0.5)] });
  }
  for (const anchor of ["th:sum", "tt:sum", ...DEMO_ROUTINES.map((routine) => `rsum:${routine.id}`)]) {
    add({ id: anchor, layer: "world", fit: "height", keys: [...tableBorn(anchor), ...tableLeaves(0.5)] });
  }

  // 표의 테두리. 머리 아래 선은 달력 요일 머리의 선이 되고, 나머지는 접혀 들어간다
  for (const line of ["line:foot", "line:v1", "line:v2"]) {
    add({
      id: line,
      layer: "world",
      fit: "box",
      keys: [
        { t: at("split", 0.26), frame: "split", anchor: line, s: 0, o: 0 },
        { t: M.splitEnd, s: 1, o: 1, ease: EASE.out },
        { t: M.collapseStart },
        { t: at("calendar", 0.6), s: 0, o: 0, ease: EASE.in },
      ],
    });
  }
  add({
    id: "line:head",
    layer: "world",
    fit: "box",
    keys: [
      { t: at("split", 0.26), frame: "split", anchor: "line:head", s: 0, o: 0 },
      { t: M.splitEnd, s: 1, o: 1, ease: EASE.out },
      { t: M.collapseStart },
      { t: M.collapseEnd, frame: "calendar" },
      { t: M.barsStart },
      { t: M.barsEnd, frame: "stats", anchor: "panel", sh: 0.004, ay: -0.5, o: 0 },
    ],
  });

  // 요일 이름: 표 머리 → 달력 요일 머리
  WEEK_LABELS.forEach((_, weekday) => {
    add({
      id: `hl:${weekday}`,
      layer: "world",
      fit: "height",
      keys: [
        ...tableBorn(`hl:${weekday}`),
        { t: M.collapseStart },
        { t: M.collapseEnd, frame: "calendar" },
        { t: M.barsStart },
        // 달성 현황에는 요일 머리가 없다. 판이 덮으며 위로 걷힌다
        { t: at("stats", 0.6), dy: -0.04, o: 0, ease: EASE.in },
      ],
    });
  });

  // 요일 칸: 루틴 아이콘에서 떨어져 나와 옆으로 늘어선다
  for (const routine of DEMO_ROUTINES) {
    for (let weekday = 1; weekday < 7; weekday += 1) {
      add({
        id: cellActor(routine.id, weekday),
        layer: "world",
        fit: "width",
        keys: [
          { t: M.splitStart, frame: "list", anchor: `icon:${routine.id}`, o: 0 },
          { t: M.splitStart + 4, o: 1 },
          { t: M.splitEnd, frame: "split", anchor: `cell:${routine.id}:${weekday}` },
          { t: M.collapseStart },
          // 한 주가 압축된다. 요일마다 세로로 쌓인 체크가 그날의 링으로 모인다
          {
            t: M.collapseEnd,
            frame: "calendar",
            anchor: `cal:${DEMO_WEEK_ROW_INDEX}:${weekday}`,
            s: 0.4,
            o: 0,
          },
        ],
      });
    }
  }

  /* ---------- 달력 ---------- */

  DEMO_CALENDAR.forEach((week, row) => {
    week.forEach((slot) => {
      const barRow = row;
      const toBar: Key[] = [
        { t: M.barsStart },
        {
          t: M.barsEnd,
          frame: "stats",
          anchor: `bar:${barRow}`,
          ax: (slot.weekday + 0.5) / 7 - 0.5,
          ay: 0,
          dy: 0,
          s: 0.3,
          o: 0,
        },
      ];
      const toLabel: Key[] = [
        { t: M.barsStart },
        { t: M.barsEnd, frame: "stats", anchor: `barLabel:${barRow}`, s: 0.6, o: 0, dy: 0 },
      ];

      if (row === DEMO_WEEK_ROW_INDEX) {
        // 합계 칸 "3/4" 가 그날의 링이 된다
        add({
          id: ringActor(row, slot.weekday),
          layer: "world",
          fit: "none",
          keys: [
            ...tableBorn(`tot:${slot.weekday}`),
            { t: M.collapseStart },
            { t: M.collapseEnd, frame: "calendar", anchor: `cal:${row}:${slot.weekday}` },
            ...toBar,
          ],
        });
        // 표 머리의 날짜가 달력 칸의 날짜로 내려온다
        add({
          id: dateActor(row, slot.weekday),
          layer: "world",
          fit: "height",
          keys: [
            ...tableBorn(`hd:${slot.weekday}`),
            { t: M.collapseStart },
            { t: M.collapseEnd, frame: "calendar", anchor: `cd:${row}:${slot.weekday}` },
            ...toLabel,
          ],
        });
        return;
      }

      // 다른 주는 위아래에서 밀려 들어와 한 달을 채운다
      const fromY = row < DEMO_WEEK_ROW_INDEX ? -0.06 : 0.22;
      const enter = (anchor: string): Key[] => [
        { t: at("calendar", 0.64), frame: "calendar", anchor, dy: fromY, o: 0 },
        { t: M.weeksInEnd, dy: 0, o: 1, ease: EASE.out },
      ];
      add({ id: ringActor(row, slot.weekday), layer: "world", fit: "none", keys: [...enter(`cal:${row}:${slot.weekday}`), ...toBar] });
      add({ id: dateActor(row, slot.weekday), layer: "world", fit: "height", keys: [...enter(`cd:${row}:${slot.weekday}`), ...toLabel] });
    });
  });

  /* ---------- 달성 현황 ---------- */

  // 판: 달력이 놓였던 자리에서 달성 현황의 판으로 모양을 바꾼다
  add({
    id: "panel",
    layer: "world",
    fit: "box",
    keys: [
      { t: M.barsStart, frame: "calendar", anchor: "calgrid", o: 0 },
      { t: M.barsEnd, frame: "stats", anchor: "panel", o: 1 },
      { t: M.lineStart },
      { t: M.lineEnd, frame: "finale", anchor: "big", sh: 0.19, o: 0 },
    ],
  });

  DEMO_WEEK_ROWS.forEach((_, index) => {
    // 링이 모여 막대가 된다. 막대는 링이 도착하는 왼쪽부터 자란다
    add({
      id: `bar:${index}`,
      layer: "world",
      fit: "box",
      origin: "left",
      keys: [
        { t: at("stats", 0.5), frame: "stats", anchor: `bar:${index}`, sw: 0, o: 0 },
        { t: at("stats", 0.56), o: 1 },
        { t: M.barsEnd, sw: 1, ease: EASE.out },
        { t: M.lineStart },
        // 막대들이 한가운데로 모여 한 줄이 된다
        { t: M.lineEnd, frame: "finale", anchor: "big", sw: 1, sh: 0.19, o: 0, ease: EASE.inOut },
      ],
    });
    for (const part of ["barLabel", "barPct"]) {
      add({
        id: `${part}:${index}`,
        layer: "world",
        fit: "height",
        origin: part === "barLabel" ? "left" : "center",
        keys: [...born("stats", `${part}:${index}`, at("stats", 0.62), at("stats", 0.8), { dx: part === "barLabel" ? -0.03 : 0.03 }), { t: M.lineStart }, intoLine(M.lineEnd)],
      });
    }
  });

  for (const anchor of ["rate", "rateText", "delta", "legend", "split:task", "split:routine"]) {
    const isBox = anchor.startsWith("split:");
    add({
      id: anchor,
      layer: "world",
      fit: isBox ? "box" : "height",
      content: isBox,
      origin: anchor === "rate" || anchor === "rateText" || anchor === "legend" ? "left" : "center",
      keys: [...born("stats", anchor, at("stats", 0.64), at("stats", 0.82)), { t: M.lineStart }, intoLine(M.lineEnd)],
    });
  }

  /* ---------- 마지막 장면 ---------- */

  add({
    id: "slogan",
    layer: "hud",
    fit: "height",
    keys: born("ending", "slogan", at("ending", 0.74), at("ending", 0.86)),
  });
  add({
    id: "cta",
    layer: "hud",
    fit: "none",
    keys: born("ending", "cta", M.ctaStart, M.ctaEnd),
  });

  /* ---------- 직접 체크하는 버튼 ---------- */

  add({
    id: "hit",
    layer: "hud",
    fit: "box",
    keys: [
      { t: M.focusStart, frame: "focus", anchor: "hit", o: 0 },
      { t: M.focusEnd, o: 1 },
      { t: M.escapeStart },
      { t: M.escapeStart + 1, o: 0 },
    ],
  });

  /* ---------- 휴대폰 테두리 (넓은 화면에서만) ---------- */

  if (wide) {
    add({
      id: "phone",
      layer: "world",
      fit: "box",
      keys: [
        { t: M.phoneOutStart - 1, frame: "list", anchor: "phone", o: 0 },
        { t: M.phoneOutStart, o: 1 },
        { t: M.phoneInEnd },
        { t: M.phoneInEnd + 1, o: 0 },
      ],
    });
  }

  return tracks;
};

/** 목록에 보이는 할 일 순서 (배우를 그리는 순서). 겹칠 때 주인공이 위에 온다 */
export const ACTOR_ITEM_ORDER = [...LIST_ORDER].reverse();

/**
 * 카메라. s 는 배율, 표식은 배율의 중심이다. 배율 1 에서는 중심이 어디든 화면이 같으므로
 * 중심을 옮기는 것만으로 화면이 튀지 않는다.
 */
export const buildCameraTrack = ({ wide }: { wide: boolean }): Track => ({
  id: "camera",
  fit: "none",
  keys: [
    { t: 0, frame: "focus", anchor: "hit", s: 1 },
    { t: M.escapeStart },
    // 체크가 빠져나오는 동안 살짝 다가갔다가
    { t: M.escapeEnd, frame: "reveal", anchor: "big", s: 1.06 },
    // 캐릭터가 드러나며 물러난다
    { t: M.revealEnd, anchor: "char", s: 1, ease: EASE.out },
    { t: M.phoneOutStart, frame: "list", anchor: "phone" },
    // 넓은 화면: 이 화면이 휴대폰 속 Checky 였다는 것을 보여 주고 다시 들어간다
    { t: M.phoneOutEnd, s: wide ? 0.8 : 0.94 },
    { t: M.phoneInStart },
    { t: M.phoneInEnd, s: 1 },
  ],
});

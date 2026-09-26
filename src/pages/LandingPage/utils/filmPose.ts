/**
 * 필름 속 요소(배우)의 위치를 시점마다 계산한다.
 *
 * 배우는 장면 프레임의 표식(anchor) 사이를 옮겨 다닌다. 표식의 위치는 실제 컴포넌트를
 * 그려 잰 값이라, 화면 폭이 달라져도 좌표를 따로 적을 필요가 없다.
 * 여기 있는 함수는 모두 순수 함수다. DOM 을 읽고 쓰는 일은 hooks/useFilmEngine.ts 가 맡는다.
 */
import { EASE, lerp, type Ease } from "./timelineMath";

/** 무대 기준 좌표로 잰 표식 하나 */
export interface AnchorRect {
  left: number;
  top: number;
  w: number;
  h: number;
  /** 표식이 무대에 맞춰 줄어든 앱 화면 안에 있으면 그 비율 */
  k?: number;
}

export type AnchorMap = Record<string, Record<string, AnchorRect>>;

/**
 * 배우가 표식에 맞춰 크기를 정하는 방식.
 * width/height: 그 변의 비율만큼 통째로 키운다 (글자·아이콘)
 * box: 표식의 폭과 높이를 그대로 가진다 (면·선·막대)
 * none: 크기를 바꾸지 않고 자리만 옮긴다
 */
export type Fit = "width" | "height" | "box" | "none";

/** 배우의 어느 점을 표식에 맞추는지. 왼쪽 정렬 글자는 글자 수가 바뀌어도 왼쪽이 흔들리지 않아야 한다 */
export type Origin = "center" | "left" | "right";

/** 표식 안의 작은 정사각형 (체크 아이콘 안의 체크 글리프 등) */
export interface SubBox {
  left: number;
  top: number;
  size: number;
}

/**
 * 한 시점의 자세. 적지 않은 값은 바로 앞 자세에서 이어받는다.
 * 첫 자세의 기본값은 s=1, o=1, 나머지 0 이다.
 */
export interface Key {
  t: number;
  frame?: string;
  anchor?: string;
  sub?: SubBox | null;
  /** 크기 배율 */
  s?: number;
  /** box 배우의 폭·높이 배율 */
  sw?: number;
  sh?: number;
  o?: number;
  /** 무대 폭·높이에 대한 비율만큼 옮긴다 */
  dx?: number;
  dy?: number;
  /** 표식 폭·높이에 대한 비율만큼 옮긴다 */
  ax?: number;
  ay?: number;
  r?: number;
  /** 앞 자세에서 이 자세로 올 때의 가속 */
  ease?: Ease;
}

export interface Track {
  id: string;
  fit: Fit;
  origin?: Origin;
  /**
   * box 배우 안에 글자가 있는지. 무대에 맞춰 줄어든 화면에서는 폭만 좁히면 글자가 원래 크기로 남으므로,
   * 줄어들기 전 크기로 두고 같은 비율로 통째로 줄인다.
   */
  content?: boolean;
  keys: Key[];
}

export interface Pose {
  /** origin 이 가리키는 점의 무대 좌표 */
  x: number;
  y: number;
  s: number;
  o: number;
  r: number;
  /** box 배우의 크기 */
  w: number;
  h: number;
}

export interface ResolvedKey {
  t: number;
  pose: Pose;
  ease: Ease;
}

export interface Size {
  w: number;
  h: number;
}

type Filled = Required<Omit<Key, "frame" | "anchor" | "sub" | "ease">> & {
  frame?: string;
  anchor?: string;
  sub?: SubBox | null;
  ease: Ease;
};

const DEFAULTS: Omit<Filled, "t"> = {
  s: 1,
  sw: 1,
  sh: 1,
  o: 1,
  dx: 0,
  dy: 0,
  ax: 0,
  ay: 0,
  r: 0,
  sub: null,
  ease: EASE.inOut,
};

/** 적지 않은 값을 앞 자세에서 채운다. ease 만은 이어받지 않는다(구간마다 다르다) */
export const fillKeys = (keys: Key[]): Filled[] => {
  const filled: Filled[] = [];
  keys.forEach((key, index) => {
    const previous = index === 0 ? { ...DEFAULTS, t: key.t } : filled[index - 1];
    filled.push({
      ...previous,
      ...Object.fromEntries(Object.entries(key).filter(([, value]) => value !== undefined)),
      ease: key.ease ?? EASE.inOut,
    } as Filled);
  });
  return filled;
};

const applySub = (rect: AnchorRect, sub: SubBox | null): AnchorRect =>
  sub
    ? {
        left: rect.left + rect.w * sub.left,
        top: rect.top + rect.h * sub.top,
        w: rect.w * sub.size,
        h: rect.h * sub.size,
      }
    : rect;

/** 표식과 배우 크기로 자세 하나를 숫자로 바꾼다. 표식이 없으면 무대 가운데로 둔다 */
export const resolveKey = (
  key: Filled,
  track: Pick<Track, "fit" | "origin" | "content">,
  anchors: AnchorMap,
  natural: Size,
  stage: Size,
): Pose => {
  const found = key.frame && key.anchor ? anchors[key.frame]?.[key.anchor] : undefined;
  const rect = applySub(
    found ?? { left: stage.w / 2 - natural.w / 2, top: stage.h / 2 - natural.h / 2, ...natural },
    key.sub ?? null,
  );

  const base =
    track.fit === "width"
      ? rect.w / Math.max(natural.w, 1)
      : track.fit === "height"
        ? rect.h / Math.max(natural.h, 1)
        : 1;

  const origin = track.origin ?? "center";
  const anchorX =
    origin === "left" ? rect.left : origin === "right" ? rect.left + rect.w : rect.left + rect.w / 2;

  // 크기를 표식에서 가져오지 않는 배우(none·content)는 프레임이 줄어든 비율을 따로 따라야 한다
  const fitScale = track.content || track.fit === "none" ? (found?.k ?? 1) : 1;
  const boxScale = track.fit === "box" ? (track.content ? 1 : key.s) / fitScale : 1;

  return {
    x: anchorX + key.ax * rect.w + key.dx * stage.w,
    y: rect.top + rect.h / 2 + key.ay * rect.h + key.dy * stage.h,
    s: track.fit === "box" ? (track.content ? fitScale * key.s : 1) : base * key.s * (track.fit === "none" ? fitScale : 1),
    o: key.o,
    r: key.r,
    w: rect.w * key.sw * boxScale,
    h: rect.h * key.sh * boxScale,
  };
};

export const resolveTrack = (
  track: Track,
  anchors: AnchorMap,
  natural: Size,
  stage: Size,
): ResolvedKey[] =>
  fillKeys([...track.keys].sort((a, b) => a.t - b.t)).map((key) => ({
    t: key.t,
    pose: resolveKey(key, track, anchors, natural, stage),
    ease: key.ease,
  }));

const mix = (from: Pose, to: Pose, amount: number): Pose => ({
  x: lerp(from.x, to.x, amount),
  y: lerp(from.y, to.y, amount),
  s: lerp(from.s, to.s, amount),
  o: lerp(from.o, to.o, amount),
  r: lerp(from.r, to.r, amount),
  w: lerp(from.w, to.w, amount),
  h: lerp(from.h, to.h, amount),
});

/** 시점 time 의 자세. 첫 자세 앞과 마지막 자세 뒤에서는 끝 자세에 머문다 */
export const samplePose = (keys: ResolvedKey[], time: number): Pose => {
  if (time <= keys[0].t) return keys[0].pose;
  for (let index = 1; index < keys.length; index += 1) {
    const next = keys[index];
    if (time < next.t) {
      const previous = keys[index - 1];
      const amount = next.ease((time - previous.t) / (next.t - previous.t));
      return mix(previous.pose, next.pose, amount);
    }
  }
  return keys[keys.length - 1].pose;
};

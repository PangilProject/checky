/** 타임라인 계산에 쓰는 작은 수학 도구. 모두 순수 함수다. */

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

/** value 가 start~end 사이에서 어디쯤인지 0~1 로 돌려준다. 범위 밖은 끝값에 붙는다. */
export const progressBetween = (value: number, start: number, end: number) =>
  end === start ? (value >= end ? 1 : 0) : clamp((value - start) / (end - start));

export type Ease = (amount: number) => number;

export const EASE = {
  linear: (t: number) => t,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out: (t: number) => 1 - (1 - t) ** 3,
  in: (t: number) => t * t * t,
} satisfies Record<string, Ease>;

/**
 * 프레임 간격과 무관하게 같은 속도로 목표에 다가가는 감쇠.
 * 스크롤 값을 그대로 쓰면 휠 한 칸마다 화면이 튀므로, 이 값으로 부드럽게 따라간다.
 * timeConstant 초가 지나면 남은 거리의 약 63% 를 좁힌다.
 */
export const damp = (
  current: number,
  target: number,
  timeConstant: number,
  deltaSeconds: number,
) => lerp(target, current, Math.exp(-deltaSeconds / timeConstant));

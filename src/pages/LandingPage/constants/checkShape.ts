/**
 * 이야기의 주인공인 체크(✓)의 모양.
 *
 * 체크는 0~100 정사각형 안의 세 점(왼쪽 끝 → 꺾이는 점 → 오른쪽 끝)으로 그린다.
 * 같은 세 점을 캐릭터의 팔 위에 겹치고, 마지막 장면에서는 막대가 모인 가로선에서 이 모양으로 접힌다.
 */
export type Point = readonly [number, number];

export const CHECK_POINTS: readonly [Point, Point, Point] = [
  [9, 62],
  [40, 90],
  [90, 12],
];

/** 막대들이 모여 만든 가로선. 체크와 같은 세 점을 쓰므로 둘 사이를 그대로 보간한다 */
export const LINE_POINTS: readonly [Point, Point, Point] = [
  [0, 50],
  [50, 50],
  [100, 50],
];

/** 선 굵기 (0~100 기준) */
export const CHECK_STROKE = 19;

/**
 * 캐릭터 그림 안에서 팔(✓)이 차지하는 정사각형. 그림 한 변을 1 로 본 비율이다.
 * logoRound-white.png 를 기준으로 맞췄다. 그림을 바꾸면 이 값도 다시 맞춰야 한다.
 */
export const ARM_BOX = { left: 0.36, top: 0.3, size: 0.42 } as const;

/** 체크 아이콘(FaCheckCircle) 안에서 체크 글리프가 차지하는 정사각형 */
export const ICON_CHECK_BOX = { left: 0.22, top: 0.19, size: 0.58 } as const;

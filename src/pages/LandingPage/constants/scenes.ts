/**
 * 랜딩 필름의 장면 목록.
 *
 * 시간의 단위는 "화면 높이의 1%" 다. 100 이면 화면 한 장 높이만큼 스크롤했다는 뜻이다.
 * 장면 안의 시점은 모두 at(장면, 0~1) 로 적으므로, 장면 길이를 바꿔도
 * 안쪽 타이밍을 하나하나 고칠 필요가 없다.
 */
export const SCENES = [
  { id: "opening", label: "막막함", length: 150 },
  { id: "check", label: "하나부터", length: 210 },
  { id: "enter", label: "Checky 안으로", length: 140 },
  { id: "split", label: "정리", length: 130 },
  { id: "calendar", label: "기록", length: 180 },
  { id: "stats", label: "축적", length: 170 },
  { id: "ending", label: "성취", length: 190 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

/** 마지막 장면 뒤, 필름이 실제 테마로 돌아가며 멈춰 있는 구간 */
const TAIL_LENGTH = 50;

const starts = new Map<SceneId, number>();
let cursor = 0;
for (const scene of SCENES) {
  starts.set(scene.id, cursor);
  cursor += scene.length;
}

/** 장면들의 길이 합 */
export const STORY_LENGTH = cursor;
/** 스크롤 가능한 전체 길이 */
export const TIMELINE_LENGTH = STORY_LENGTH + TAIL_LENGTH;

/** 장면 안의 한 시점을 전체 타임라인 위치로 바꾼다. fraction 은 0(시작)~1(끝) */
export const at = (scene: SceneId, fraction: number) => {
  const start = starts.get(scene) ?? 0;
  const length = SCENES.find((item) => item.id === scene)?.length ?? 0;
  return start + length * fraction;
};

/** 지금 시점이 어느 장면인지. 끝을 넘으면 마지막 장면으로 본다 */
export const getSceneIndex = (time: number) => {
  for (let index = SCENES.length - 1; index >= 0; index -= 1) {
    if (time >= at(SCENES[index].id, 0)) return index;
  }
  return 0;
};

/** 전체 진행률 0~1 */
export const getStoryProgress = (time: number) =>
  Math.min(1, Math.max(0, time / STORY_LENGTH));

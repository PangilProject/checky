/**
 * 집계 문서가 없어 반영하지 못하고 건너뛴 조작을 달마다 센다.
 *
 * 문서 없는 달은 달력이 열릴 때 원본에서 세어 만든다. 그런데 만드는 사이(원본을 읽고 쓰기까지)에
 * 할 일을 추가하거나 체크하면, 그 조작의 반영은 문서가 없어 건너뛰고 곧이어 저장되는 문서는
 * 조작 전에 센 값이라 조작이 집계에서 영구히 빠진다.
 * 문서를 만드는 쪽이 시작할 때와 저장을 마친 뒤의 수를 비교해, 달라졌을 때만 원본에서 다시 센다.
 * 같은 탭 안의 경쟁만 막는다. 메모리에만 두므로 새로고침하면 사라진다.
 */
const missed = new Map<string, number>();

const keyOf = (userId: string, month: string) => `${userId}/${month}`;

export const noteMissedPatch = (userId: string, month: string) => {
  const key = keyOf(userId, month);
  missed.set(key, (missed.get(key) ?? 0) + 1);
};

export const countMissedPatches = (userId: string, month: string) =>
  missed.get(keyOf(userId, month)) ?? 0;

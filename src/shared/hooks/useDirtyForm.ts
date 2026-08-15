import { useCallback, useMemo, useState } from "react";

/**
 * 편집 폼의 값과 "고쳐졌는지"를 함께 들고 있는다.
 *
 * dirty 판정과 취소 복원은 반드시 같은 출처에서 나와야 한다. 둘을 따로 만들면
 * 필드를 하나 추가할 때 한쪽에만 넣어도 타입 검사에 걸리지 않아, 고쳤는데 저장
 * 버튼이 안 켜지거나 취소했는데 값이 남는 식으로 조용히 어긋난다.
 * 그래서 처음 값(기준)을 이 훅이 쥐고, 비교와 되돌리기를 모두 여기서 한다.
 */

interface UseDirtyFormOptions<T> {
  /**
   * 비교하기 전에 값을 다듬는다.
   *
   * 화면의 값과 실제로 저장되는 값이 다를 수 있다. 제목은 저장할 때 trim 되므로
   * 공백만 덧붙인 것은 고친 것이 아니고, 시간을 끈 상태에서는 시간 값이 저장에
   * 아예 실리지 않으므로 그 변화도 고친 것이 아니다. "저장하면 나갈 값"을
   * 돌려주면 dirty 판정이 저장 결과와 어긋나지 않는다.
   */
  comparable?: (values: T) => Record<string, unknown>;
}

const isSameShallow = (
  a: Record<string, unknown>,
  b: Record<string, unknown>,
) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (!Object.is(a[key], b[key])) return false;
  }
  return true;
};

export const useDirtyForm = <T extends Record<string, unknown>>(
  initialValues: T,
  { comparable }: UseDirtyFormOptions<T> = {},
) => {
  // 기준은 처음 값으로 잡는다. 렌더마다 다시 잡으면 영원히 깨끗한 폼이 된다.
  // (저장이 끝난 필드만 commit 으로 기준을 옮긴다)
  const [baseline, setBaseline] = useState(initialValues);
  const [values, setValues] = useState(initialValues);

  /** 바꿀 필드만 넘긴다. 이전 값이 필요하면 함수를 넘길 수 있다. */
  const patch = useCallback(
    (next: Partial<T> | ((prev: T) => Partial<T>)) => {
      setValues((prev) => ({
        ...prev,
        ...(typeof next === "function" ? next(prev) : next),
      }));
    },
    [],
  );

  /**
   * 이미 저장이 끝난 값이라고 알린다. 값과 기준을 함께 옮기므로 dirty 가 아니게 된다.
   *
   * 저장 버튼을 거치지 않고 누르는 즉시 저장되는 항목(예: 공지의 상단 고정)이
   * 있는데, 그런 항목까지 처음 값과 비교하면 이미 저장된 것을 두고 "수정 중"이라고
   * 잘못 붙잡는다.
   */
  const commit = useCallback((saved: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...saved }));
    setBaseline((prev) => ({ ...prev, ...saved }));
  }, []);

  /** 기준값으로 되돌린다. 수정 취소가 쓴다. */
  const reset = useCallback(() => {
    setValues(baseline);
  }, [baseline]);

  const isDirty = useMemo(() => {
    const toComparable = comparable ?? ((v: T) => v);
    return !isSameShallow(toComparable(values), toComparable(baseline));
  }, [baseline, comparable, values]);

  return { values, patch, commit, reset, isDirty };
};

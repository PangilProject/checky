import {
  type DocumentData,
  getDocs,
  type Query,
  type QuerySnapshot,
} from "firebase/firestore/lite";

/**
 * 쿼리를 한 번 조회하고 취소 함수를 돌려준다.
 *
 * 이 프로젝트는 `firebase/firestore/lite` 를 쓰므로 실시간 구독(onSnapshot)이 없다.
 * 호출부는 useEffect 안에서 부르고 정리 함수를 반환하는 형태이므로,
 * 구독과 같은 모양의 취소 함수를 돌려주어 그대로 정리할 수 있게 한다.
 *
 * 취소된 뒤에는 콜백을 호출하지 않는다.
 * 화면이 사라진 뒤 도착한 응답으로 상태를 갱신하지 않기 위해서다.
 */
export const fetchQueryOnce = <T extends DocumentData>(
  queryRef: Query<T>,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  onError?: (error: unknown) => void,
) => {
  let cancelled = false;

  void getDocs(queryRef)
    .then((snapshot) => {
      if (cancelled) return;
      onNext(snapshot);
    })
    .catch((error) => {
      if (cancelled) return;
      onError?.(error);
    });

  return () => {
    cancelled = true;
  };
};

/**
 * 두 날짜가 걸쳐 있는 달의 키 목록을 만든다.
 *
 * 할 일을 다른 달로 옮기면 두 달의 집계가 함께 바뀌므로, 갱신 대상을 정할 때 쓴다.
 * 순수 계산이며 Firestore 를 읽지 않는다. 범위가 뒤집혀 있으면 빈 배열이다.
 */
export const buildMonthKeysBetween = (startDate: string, endDate: string) => {
  if (!startDate || !endDate || startDate > endDate) return [] as string[];

  const [startYear, startMonth] = startDate.slice(0, 7).split("-").map(Number);
  const [endYear, endMonth] = endDate.slice(0, 7).split("-").map(Number);
  const result: string[] = [];

  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      y += 1;
      m = 1;
    }
  }

  return result;
};

// 공통: 해당 주의 일요일 구하기
const getSundayOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = 일요일
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 월 단위 이동 (항상 1일로)
export const moveMonth = (date: Date, diff: number) => {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + diff);
  return next;
};

// 주 단위 이동 (⭐ 항상 일요일 기준)
export const moveWeek = (date: Date, diff: number) => {
  const sunday = getSundayOfWeek(date);
  const next = new Date(sunday);
  next.setDate(sunday.getDate() + diff * 7);
  return next;
};

// 일 단위 이동
// moveWeek/getSundayOfWeek 처럼 자정으로 맞춘다. 시각을 보존하면 이동 수단에
// 따라 같은 날짜가 다른 시각을 갖게 되어, getTime() 비교가 생기는 순간 함정이 된다.
export const moveDay = (date: Date, diff: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

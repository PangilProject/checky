// 월 단위 이동
export const moveMonth = (date: Date, diff: number) => {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + diff);
  return next;
};

// 주 단위 이동 (일요일 기준)
export const moveWeek = (date: Date, diff: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + diff * 7);
  return next;
};

// 일 단위 이동
export const moveDay = (date: Date, diff: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + diff);
  return next;
};

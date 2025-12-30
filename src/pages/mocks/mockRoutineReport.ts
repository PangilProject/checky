import type { RoutineReport } from "@/shared/api/routine";

export const mockRoutineReport: RoutineReport = {
  week: {
    startDate: "2026-01-04",
    endDate: "2026-01-10",
    days: [
      { date: "2026-01-04", day: 0, label: "일" },
      { date: "2026-01-05", day: 1, label: "월" },
      { date: "2026-01-06", day: 2, label: "화" },
      { date: "2026-01-07", day: 3, label: "수" },
      { date: "2026-01-08", day: 4, label: "목" },
      { date: "2026-01-09", day: 5, label: "금" },
      { date: "2026-01-10", day: 6, label: "토" },
    ],
  },

  rows: [
    {
      routineId: "routine-1",
      routineTitle: "운동하기",

      category: {
        id: "category-health",
        name: "건강",
        color: "#FF393C",
      },

      startDate: "2026-01-01",
      repeatDays: [1, 4], // 월, 목

      checks: {
        "2026-01-05": true, // 월
        "2026-01-08": false, // 목
      },
    },

    {
      routineId: "routine-2",
      routineTitle: "QT 묵상",

      category: {
        id: "category-faith",
        name: "말씀 읽기",
        color: "#CB30E0",
      },

      startDate: "2026-01-03",
      repeatDays: [0, 1, 2, 3, 4, 5, 6], // 매일

      checks: {
        "2026-01-05": true,
        "2026-01-06": true,
        "2026-01-07": false,
        "2026-01-08": false,
        "2026-01-09": false,
        "2026-01-10": false,
        "2026-01-11": false,
      },
    },
  ],
};

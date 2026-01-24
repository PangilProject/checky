export const categoryKeys = {
  all: ["categories"] as const,
  list: (userId: string, status?: string) =>
    [...categoryKeys.all, userId, status ?? "all"] as const,
};

export const taskKeys = {
  all: ["tasks"] as const,
  byDate: (userId: string, date: string) =>
    [...taskKeys.all, userId, date] as const,
  byMonth: (userId: string, month: string) =>
    [...taskKeys.all, userId, "month", month] as const,
};

export const taskLogKeys = {
  all: ["taskLogs"] as const,
  byDate: (userId: string, date: string) =>
    [...taskLogKeys.all, userId, date] as const,
  byMonth: (userId: string, month: string) =>
    [...taskLogKeys.all, userId, "month", month] as const,
};

export const routineKeys = {
  all: ["routines"] as const,
  byMonth: (userId: string, month: string) =>
    [...routineKeys.all, userId, "month", month] as const,
};

export const routineLogKeys = {
  all: ["routineLogs"] as const,
  byMonth: (userId: string, month: string) =>
    [...routineLogKeys.all, userId, "month", month] as const,
};

export const routineReportKeys = {
  all: ["routineReport"] as const,
  byWeek: (userId: string, startDate: string, endDate: string) =>
    [...routineReportKeys.all, userId, startDate, endDate] as const,
};

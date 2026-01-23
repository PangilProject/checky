export type PerfLog =
  | {
      type: "profiler";
      id: string;
      phase: "mount" | "update";
      actualDuration: number;
      baseDuration: number;
      startTime: number;
      commitTime: number;
    }
  | {
      type: "render";
      id: string;
      count: number;
    };

type PerfWindow = Window & {
  __perfLogs?: PerfLog[];
};

export const isPerfEnabled = () => {
  if (typeof window === "undefined") return false;
  const urlEnabled = new URLSearchParams(window.location.search).get("perf");
  const localEnabled = window.localStorage.getItem("perf:enabled");
  return urlEnabled === "1" || localEnabled === "1";
};

export const logPerf = (entry: PerfLog) => {
  if (typeof window === "undefined") return;
  if (!isPerfEnabled()) return;

  const w = window as PerfWindow;
  if (!w.__perfLogs) w.__perfLogs = [];
  w.__perfLogs.push(entry);

  // 콘솔 로그는 수집/분석에 활용
  console.info("[PERF]", entry);
};

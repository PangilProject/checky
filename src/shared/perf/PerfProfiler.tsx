import { Profiler, type ReactNode } from "react";
import { logPerf } from "./logger";

export const PerfProfiler = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  return (
    <Profiler
      id={id}
      onRender={(profilingId, phase, actualDuration, baseDuration, startTime, commitTime) => {
        logPerf({
          type: "profiler",
          id: profilingId,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        });
      }}
    >
      {children}
    </Profiler>
  );
};

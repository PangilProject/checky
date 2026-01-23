import { useEffect, useRef } from "react";
import { logPerf } from "./logger";

export const useRenderCounter = (id: string) => {
  const countRef = useRef(0);
  countRef.current += 1;

  useEffect(() => {
    logPerf({
      type: "render",
      id,
      count: countRef.current,
    });
  });
};

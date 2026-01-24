import { useEffect, useRef } from "react";
import { logPerf } from "./logger";

export const useRenderCounter = (id: string) => {
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current += 1;
    logPerf({
      type: "render",
      id,
      count: countRef.current,
    });
  });
};

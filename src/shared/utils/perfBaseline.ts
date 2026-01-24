type BaselineMeta = Record<string, unknown>;

const isBaselineEnabled = () => Boolean(import.meta.env.DEV);

const nowMs = () => Math.round(performance.now());

export const baselineSubscribe = (label: string, meta?: BaselineMeta) => {
  if (!isBaselineEnabled()) {
    return {
      onSnapshot: () => {},
      onUnsubscribe: () => {},
    };
  }

  const prefix = `[perf][baseline] ${label}`;
  const start = nowMs();
  let first = true;

  console.count(`${prefix} subscribe`);
  console.info(`${prefix} subscribe`, meta);

  return {
    onSnapshot: (count: number) => {
      console.count(`${prefix} snapshot`);

      if (first) {
        const elapsed = nowMs() - start;
        console.info(`${prefix} firstSnapshot ${elapsed}ms`, {
          ...meta,
          count,
        });
        first = false;
        return;
      }

      console.info(`${prefix} snapshot`, { ...meta, count });
    },
    onUnsubscribe: () => {
      console.info(`${prefix} unsubscribe`, meta);
    },
  };
};

export const baselineFetch = (label: string, meta?: BaselineMeta) => {
  if (!isBaselineEnabled()) {
    return {
      end: () => {},
    };
  }

  const prefix = `[perf][baseline] ${label}`;
  const start = nowMs();

  console.count(`${prefix} fetch`);
  console.info(`${prefix} start`, meta);

  return {
    end: (extra?: BaselineMeta) => {
      const elapsed = nowMs() - start;
      console.info(`${prefix} end ${elapsed}ms`, { ...meta, ...extra });
    },
  };
};

export const baselineCacheCheck = (label: string, meta?: BaselineMeta) => {
  if (!isBaselineEnabled()) return;
  const prefix = `[perf][baseline] ${label}`;
  console.info(`${prefix} cache`, meta);
};

type BaselineMeta = Record<string, unknown>;

const isBaselineEnabled = () => Boolean(import.meta.env.DEV);

const nowMs = () => Math.round(performance.now());

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

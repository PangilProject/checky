import fs from "node:fs";

export const loadPerfFile = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

export const groupLogs = (logs) => {
  const profiler = logs.filter((l) => l.type === "profiler");
  const render = logs.filter((l) => l.type === "render");

  const byId = {};

  for (const entry of profiler) {
    if (!byId[entry.id]) byId[entry.id] = { profiler: [], render: [] };
    byId[entry.id].profiler.push(entry);
  }

  for (const entry of render) {
    if (!byId[entry.id]) byId[entry.id] = { profiler: [], render: [] };
    byId[entry.id].render.push(entry);
  }

  return byId;
};

export const calcStats = (entries) => {
  if (!entries || entries.length === 0) {
    return { count: 0, avg: 0, max: 0, min: 0 };
  }
  const count = entries.length;
  const values = entries.map((e) => e.actualDuration ?? e.count ?? 0);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count,
    avg: sum / count,
    max: Math.max(...values),
    min: Math.min(...values),
  };
};

export const summarize = (grouped) => {
  const result = {};
  for (const [id, data] of Object.entries(grouped)) {
    const prof = data.profiler || [];
    const render = data.render || [];
    const renderCount = render.length ? render[render.length - 1].count : 0;

    result[id] = {
      profilerCount: prof.length,
      renderCount,
      actualDurationAvg: calcStats(prof).avg,
      actualDurationMax: calcStats(prof).max,
      commitTimeAvg: prof.length
        ? prof.reduce((s, e) => s + (e.commitTime ?? 0), 0) / prof.length
        : 0,
    };
  }
  return result;
};

export const formatNumber = (n) =>
  Number.isFinite(n) ? n.toFixed(2) : "0.00";

import { loadPerfFile, groupLogs, summarize, formatNumber } from "./perf-utils.mjs";

const beforePath = process.argv[2];
const afterPath = process.argv[3];

if (!beforePath || !afterPath) {
  console.error("Usage: node scripts/perf-diff.mjs <before.json> <after.json>");
  process.exit(1);
}

const before = loadPerfFile(beforePath);
const after = loadPerfFile(afterPath);

const beforeSummary = summarize(groupLogs(before.logs || []));
const afterSummary = summarize(groupLogs(after.logs || []));

const allIds = Array.from(new Set([
  ...Object.keys(beforeSummary),
  ...Object.keys(afterSummary),
]));

const diff = allIds.map((id) => {
  const b = beforeSummary[id] || {};
  const a = afterSummary[id] || {};
  const renderDelta = (a.renderCount ?? 0) - (b.renderCount ?? 0);
  const commitDelta = (a.commitTimeAvg ?? 0) - (b.commitTimeAvg ?? 0);
  const actualDelta = (a.actualDurationAvg ?? 0) - (b.actualDurationAvg ?? 0);
  return { id, renderDelta, commitDelta, actualDelta };
});

console.log("Perf Diff Summary\n");
for (const d of diff) {
  console.log(
    `${d.id}: render ${d.renderDelta >= 0 ? "+" : ""}${d.renderDelta}, ` +
      `commit avg ${formatNumber(d.commitDelta)}ms, ` +
      `actual avg ${formatNumber(d.actualDelta)}ms`
  );
}

import fs from "node:fs";
import path from "node:path";
import { loadPerfFile, groupLogs, summarize, formatNumber } from "./perf-utils.mjs";

const beforePath = process.argv[2];
const afterPath = process.argv[3];

if (!beforePath || !afterPath) {
  console.error("Usage: node scripts/perf-report.mjs <before.json> <after.json>");
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

const rows = allIds.map((id) => {
  const b = beforeSummary[id] || {};
  const a = afterSummary[id] || {};
  return {
    id,
    bRender: b.renderCount ?? 0,
    aRender: a.renderCount ?? 0,
    bCommit: b.commitTimeAvg ?? 0,
    aCommit: a.commitTimeAvg ?? 0,
    bActual: b.actualDurationAvg ?? 0,
    aActual: a.actualDurationAvg ?? 0,
  };
});

const md = [];
md.push(`# Perf Report`);
md.push("");
md.push(`- before: ${beforePath}`);
md.push(`- after: ${afterPath}`);
md.push("");
md.push("| component | render (before) | render (after) | commit avg (before ms) | commit avg (after ms) | actual avg (before ms) | actual avg (after ms) |");
md.push("|---|---:|---:|---:|---:|---:|---:|");

for (const r of rows) {
  md.push(
    `| ${r.id} | ${r.bRender} | ${r.aRender} | ${formatNumber(r.bCommit)} | ${formatNumber(r.aCommit)} | ${formatNumber(r.bActual)} | ${formatNumber(r.aActual)} |`
  );
}

const outDir = path.resolve("perf-logs");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
const outPath = path.join(outDir, "perf-report.md");
fs.writeFileSync(outPath, md.join("\n"));
console.log(`Saved: ${outPath}`);

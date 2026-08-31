/**
 * 타입·린트·테스트를 한 번에 돌리고 끝에 결과를 표로 찍는다.
 *
 * `npm run typecheck && npm run lint && npm run test` 는 앞에서 하나가
 * 깨지면 뒤가 아예 돌지 않아, 고칠 것이 몇 군데인지 한 번에 알 수 없다.
 * 여기서는 세 단계를 모두 돌린 뒤 어느 단계가 깨졌는지 모아 보여 준다.
 * 각 단계의 출력은 그대로 흘려 보내고, 하나라도 깨지면 1 로 끝낸다.
 * `npm run check` 로 실행한다.
 */

import { spawn } from "node:child_process";

/** package.json 의 스크립트를 그대로 부른다 — 명령어가 두 곳에 갈라지지 않게. */
const steps = [
  { label: "타입", script: "typecheck" },
  { label: "린트", script: "lint" },
  { label: "테스트", script: "test" },
];

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

/** 종료 코드를 던지지 않고 돌려준다 — 뒤 단계도 돌려야 하므로. */
function run(script) {
  return new Promise((resolve) => {
    const child = spawn(npm, ["run", "--silent", script], {
      stdio: "inherit",
    });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

const results = [];
for (const step of steps) {
  console.log(`\n▶ ${step.label} 검사 (npm run ${step.script})\n`);
  const startedAt = Date.now();
  const code = await run(step.script);
  results.push({ ...step, ok: code === 0, seconds: (Date.now() - startedAt) / 1000 });
}

const failed = results.filter((r) => !r.ok);

console.log("\n검사 결과");
for (const r of results) {
  const mark = r.ok ? "✓" : "✗";
  console.log(`  ${mark} ${r.label.padEnd(3, " ")}  ${r.seconds.toFixed(1)}s`);
}
console.log(
  failed.length === 0
    ? `✓ ${results.length}단계 모두 통과`
    : `✗ ${results.length}단계 중 ${failed.length}개 실패 — ${failed
        .map((r) => r.label)
        .join(", ")} 출력을 확인하세요`,
);

process.exit(failed.length > 0 ? 1 : 0);

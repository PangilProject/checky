/**
 * eslint 를 돌리고 끝에 요약 한 줄을 붙인다.
 *
 * `eslint .` 은 문제가 없으면 아무것도 출력하지 않아 검사가 돌았는지
 * 알 수 없다. 그렇다고 두 번 돌리면 4초가 8초가 되므로 한 번만 돌리고
 * 결과를 직접 세어 요약한다. 에러 출력과 종료 코드는 eslint 그대로다.
 * `npm run lint` 로 실행한다.
 */

import { ESLint } from "eslint";

const eslint = new ESLint();
const results = await eslint.lintFiles(["."]);

const formatter = await eslint.loadFormatter("stylish");
const report = await formatter.format(results);
if (report) process.stdout.write(report);

const errors = results.reduce((sum, r) => sum + r.errorCount, 0);
const warnings = results.reduce((sum, r) => sum + r.warningCount, 0);

/** 검사 대상은 실행 시점에 따라 달라지므로 고정된 수가 아니다. */
const summary =
  errors === 0 && warnings === 0
    ? `✓ ESLint 통과 — 파일 ${results.length}개 검사, 문제 없음`
    : `파일 ${results.length}개 검사 — 에러 ${errors}개, 경고 ${warnings}개`;

console.log(summary);

process.exit(errors > 0 ? 1 : 0);

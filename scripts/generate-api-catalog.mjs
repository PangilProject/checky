/**
 * shared/api 가 밖으로 내주는 것들을 한 장으로 모은다.
 *
 * 손으로 적은 목록은 반드시 실제 코드와 어긋나므로 생성해서 쓴다.
 * `npm run api:catalog` 로 다시 만들 수 있다.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API_DIR = "src/shared/api";
const OUT = join(API_DIR, "CATALOG.md");

/** 도메인 폴더에 붙일 한 줄 설명. 여기 없는 폴더는 이름만 표시된다. */
const DOMAIN_NOTE = {
  category: "분류",
  task: "날짜가 정해진 할 일",
  taskLog: "할 일 완료 기록",
  routine: "반복 루틴",
  routineLog: "루틴 수행 기록",
  monthlyStats: "월간 집계 캐시",
  taskSetting: "할 일 설정 화면의 복합 동작",
  notice: "공지 (사용자별이 아닌 최상위 컬렉션)",
  auth: "로그인, 프로필, 계정 삭제",
  _common: "도메인 공통 유틸",
};

const listTsFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listTsFiles(full);
    return name.endsWith(".ts") && !name.endsWith(".d.ts") ? [full] : [];
  });

/** JSDoc 블록에서 태그가 아닌 첫 문장을 뽑는다. 없으면 빈 문자열. */
const summaryFromDoc = (block) => {
  if (!block) return "";
  for (const raw of block.split("\n")) {
    // 여는 `/**` 와 줄머리 `*` 를 떼고, 한 줄 주석이면 닫는 `*/` 까지 뗀다
    const line = raw
      .replace(/^\s*\/?\*+/, "")
      .replace(/\*\/\s*$/, "")
      .trim();
    if (!line || line.startsWith("@")) continue;
    return line;
  }
  return "";
};

/** 파일에서 export 된 심볼과 바로 위 JSDoc 요약을 찾는다. */
const collectExports = (file) => {
  const source = readFileSync(file, "utf8");
  // JSDoc 과 export 사이에 빈 줄이 있으면 그 선언에 붙은 주석이 아니다.
  // 파일 머리말이 바로 아래 함수의 설명으로 잘못 붙는 것을 막는다.
  // 주석 안에서 `*/` 를 넘지 못하게 해 블록 하나만 잡는다.
  // 넘게 두면 앞선 블록부터 뒤 선언까지 통째로 삼켜 사이에 있는 export 가 사라진다.
  const pattern =
    /(\/\*\*(?:(?!\*\/)[\s\S])*\*\/[ \t]*\r?\n[ \t]*)?export\s+(?:const|function|async function|interface|type|class)\s+(\w+)/g;

  const found = new Map();
  for (const match of source.matchAll(pattern)) {
    found.set(match[2], summaryFromDoc(match[1]));
  }
  return found;
};

/** index.ts 가 있으면 그것이 공개 목록이다. 없으면 파일의 export 전체를 쓴다. */
const publicNames = (domainDir, files) => {
  const barrel = files.find((f) => f.endsWith("index.ts"));
  if (!barrel) return null;

  const source = readFileSync(barrel, "utf8");
  const names = new Set();
  for (const m of source.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) names.add(name);
    }
  }
  return names.size ? names : null;
};

const domains = readdirSync(API_DIR)
  .filter((name) => statSync(join(API_DIR, name)).isDirectory())
  .sort();

const lines = [
  "# shared/api 목록",
  "",
  "`npm run api:catalog` 로 생성한다. 직접 고치지 말 것.",
  "구조와 사용 규칙은 [README](./README.md) 를 볼 것.",
  "",
];

let total = 0;

for (const domain of domains) {
  const dir = join(API_DIR, domain);
  const files = listTsFiles(dir);
  const allowed = publicNames(dir, files);

  const rows = [];
  for (const file of files.sort()) {
    if (file.endsWith("index.ts")) continue;
    for (const [name, summary] of collectExports(file)) {
      if (allowed && !allowed.has(name)) continue;
      rows.push({ name, summary, file: file.slice(dir.length + 1) });
    }
  }
  if (!rows.length) continue;

  total += rows.length;
  const note = DOMAIN_NOTE[domain];
  lines.push(`## ${domain}${note ? ` — ${note}` : ""}`, "");
  if (!allowed) {
    lines.push("배럴이 없어 파일에서 직접 가져다 쓴다.", "");
  }
  lines.push("| 이름 | 하는 일 | 파일 |", "| --- | --- | --- |");
  for (const row of rows.sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`| \`${row.name}\` | ${row.summary || "—"} | \`${row.file}\` |`);
  }
  lines.push("");
}

lines.push("---", "", `공개 항목 ${total}개.`, "");

writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`${OUT} 생성 — 도메인 ${domains.length}개, 공개 항목 ${total}개`);

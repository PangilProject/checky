import fs from "node:fs";
import path from "node:path";

const targetUrl = process.argv[2] || "http://localhost:5173/home";
const label = process.argv[3] || "run"; // before/after 등

const run = async () => {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (err) {
    console.error(
      "Playwright가 설치되어 있지 않습니다.\n" +
        "설치 후 다시 실행하세요: npm i -D playwright"
    );
    process.exit(1);
  }

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // perf 플래그 강제 활성화
  await page.addInitScript(() => {
    window.localStorage.setItem("perf:enabled", "1");
  });

  await page.goto(targetUrl, { waitUntil: "networkidle" });

  // 로그 수집까지 대기
  try {
    await page.waitForFunction(
      () => (window.__perfLogs?.length ?? 0) > 0,
      { timeout: 10000 }
    );
  } catch {
    // 로그가 없더라도 파일은 저장
  }

  const logs = await page.evaluate(() => window.__perfLogs || []);

  const outDir = path.resolve("perf-logs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeLabel = String(label).replace(/[^a-zA-Z0-9_-]/g, "_");
  const outPath = path.join(outDir, `perf-${safeLabel}-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ url: targetUrl, label, logs }, null, 2));

  await browser.close();
  console.log(`Saved: ${outPath}`);
};

run();

# Perf 측정 흐름

## 1) 로그 수집

```bash
node scripts/collect-profiler.mjs http://localhost:5173/home before
node scripts/collect-profiler.mjs http://localhost:5173/home after
```

- 결과는 `perf-logs/perf-<label>-<timestamp>.json`로 저장됨

## 2) 비교 리포트 생성 (Markdown)

```bash
node scripts/perf-report.mjs perf-logs/perf-before-<timestamp>.json perf-logs/perf-after-<timestamp>.json
```

- 결과: `perf-logs/perf-report.md`

## 3) 콘솔 요약 diff

```bash
node scripts/perf-diff.mjs perf-logs/perf-before-<timestamp>.json perf-logs/perf-after-<timestamp>.json
```

# monthlyStats 개선기

## 1) 배경 / 문제 정의

기존 홈 화면의 월간 캘린더는 아래 4개 월 조회 결과를 프론트에서 합산해 렌더링했다.

- `tasks` (월 범위)
- `taskLogs` (월 범위)
- `routines` (월 범위)
- `routineLogs` (월 범위)

Firestore는 문서 단위 read 과금/쿼터 구조이기 때문에, 사용자 데이터가 누적될수록 월 화면 1회 진입 시 read 수가 빠르게 증가했다.
특히 Spark 플랜의 일일 read 무료 한도(50,000)에 근접하는 문제가 있었다.

## 2) 목표

- 월간 캘린더 read 비용 절감
- 기존 UX 유지(토글 즉시 반영)
- 점진 도입(기존 로직 fallback 유지)

## 3) 기존 구조 vs 변경 구조

### Before

- 월간 캘린더 진입 시 4개 월 쿼리 실행
- 프론트에서 날짜별 `total/completed/remaining` 계산

### After

- 우선 `users/{uid}/monthlyStats/{YYYY-MM}` 1문서 조회
- 문서가 없을 때만 기존 4개 월 쿼리 fallback
- fallback으로 계산한 결과를 `monthlyStats`에 자동 upsert

## 4) 데이터 모델

문서 경로:

- `users/{uid}/monthlyStats/{YYYY-MM}`

스키마:

```ts
type MonthlyActivitySummary = {
  total: number;
  completed: number;
  remaining: number;
  hasActivity?: boolean;
};

type MonthlyStats = {
  month: string; // "2026-03"
  days: Record<string, MonthlyActivitySummary>; // "01"~"31"
  version?: number;
  updatedAt?: Timestamp;
};
```

## 5) 핵심 구현 포인트

### 5.1 월간 조회 경로 최적화

- `useMonthlyData`에서 `monthlyStats`를 우선 조회
- `monthlyStats`가 존재하면 월간 캘린더는 해당 문서만 사용
- 없으면 기존 4개 월 쿼리 fallback

관련 파일:

- `src/shared/hooks/calendar.ts`
- `src/shared/api/monthlyStats/*`
- `src/shared/query/keys.ts`

### 5.2 fallback 결과 자동 저장

- fallback 4쿼리 성공 시 기존 계산 로직으로 월 집계 맵 생성
- 집계 맵을 `monthlyStats` 문서로 `upsert`
- 다음 진입부터 read 절감 효과가 바로 적용됨

### 5.3 토글 시 day 단위 부분 업데이트

- 루틴 토글: `patchMonthlyStatsCompletionByDay` 호출
- 태스크 토글: `patchMonthlyStatsCompletionByDay` 호출
- `days.{DD}`만 `merge` 업데이트 (월 전체 overwrite 아님)

## 6) 트러블슈팅 기록

### 이슈 A: 루틴 토글 후 월간 캘린더 미반영

원인:

- 루틴 토글 시 `routineReport`/`routineLogs` 캐시만 업데이트
- `monthlyStats` 캐시/문서 갱신이 누락됨

조치:

- 루틴 토글 경로에서 `monthlyStats` 캐시 optimistic 업데이트 추가
- Firestore `monthlyStats` day patch 동기화 추가

### 이슈 B: 일일 태스크 토글 시 404(`documents:commit`)

원인:

- 빠른 토글 상황에서 임시 로그 ID(`temp-*`)가 `updateDoc` 대상이 되며 문서 미존재 404 발생

조치:

- taskLog를 canonical ID(`{taskId}_{date}`) 기준으로 저장
- `updateDoc` 실패 시 `setDoc` fallback으로 복구

## 7) 기대 효과

- 월간 캘린더 read 패턴이 `대량 4쿼리` -> `요약 1문서` 중심으로 전환
- 데이터가 커질수록 효과가 커짐(스케일 구간에서 read 완화)
- 기존 화면 동작을 유지한 상태로 단계적 전환 가능

## 8) 정량 측정 계획

우선순위 지표:

1. Firestore Console `Document reads` 일/시간 추이
2. 월간 화면 진입당 평균 read 추정치
3. `monthlyStats` fallback 비율(문서 미존재율)

권장 비교 방법:

- 배포 전 3~7일 평균 vs 배포 후 3~7일 평균
- 같은 요일/같은 시간대 기준으로 비교

## 9) 한계 / 리스크

- 현재는 클라이언트 경로에서 집계를 유지하므로, 예외 케이스에서 원본과 집계 불일치 가능성 존재
- 멀티 디바이스/동시 수정이 많은 경우 서버 측 집계(Cloud Functions) 도입이 더 안정적

## 10) 다음 개선 과제

1. 태스크 생성/삭제/날짜 이동 시 `total/remaining` 증분 업데이트 연결
2. 루틴 생성/수정/삭제(스케줄 변경 포함) 시 월 집계 동기화 강화
3. 백필 스크립트로 과거 N개월 `monthlyStats` 선생성
4. 주기적 재계산(rebuild) 작업으로 집계 정합성 점검
5. Firestore 보안 규칙에 `monthlyStats` read/write 정책 명시


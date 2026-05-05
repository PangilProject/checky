# 월간 캘린더 정합성 개선 TODO

목표: 태스크/루틴 변경 이후 월간 캘린더(`monthlyStats`)가 실제 데이터와 불일치하는 문제를 제거한다.

## 작업 원칙
- 월간 집계의 단일 진실 소스는 `monthlyStats`로 유지한다.
- 단순 토글은 day delta patch를 사용하고, 구조 변경은 월 재빌드로 처리한다.
- 영향 월 계산과 캐시 무효화 경로를 공통 유틸로 통합한다.
- 실패 시 롤백 + 강제 재동기화 경로를 반드시 둔다.

## TODO
- [x] 1. 공통 유틸 추가
- [x] 1-1. `collectAffectedMonths` 유틸 추가 (날짜/범위 기반 영향 월 계산)
- [x] 1-2. `refreshCalendarConsistency` 유틸 추가 (옵션 기반 리빌드+무효화)
- [x] 1-3. `monthlyStats/index.ts` export 정리

- [x] 2. 구조 변경 액션 경로 통합
- [x] 2-1. TaskSetting 일괄 이동/삭제/복사 액션에서 공통 유틸 사용
- [x] 2-2. RoutineModal 저장/삭제 액션에서 공통 유틸 사용

- [x] 3. 토글 정합성 강화
- [x] 3-1. `toggleTask` 실패 롤백 추가
- [x] 3-2. `toggleRoutine` 실패 롤백 추가
- [x] 3-3. day 데이터가 없을 때 기본 day 생성 후 반영

- [x] 4. 월 데이터 self-healing 보강
- [x] 4-1. `useMonthlyData.refresh()`에서 필요 시 강제 리빌드 경로 추가
- [x] 4-2. 기존 fallback과 충돌 없는지 검증

- [x] 5. 마무리 검증
- [x] 5-1. 타입체크/빌드 검증
- [x] 5-2. 시나리오 체크리스트 점검

## 시나리오 체크리스트
- [x] 미완료 태스크를 다음 날로 이동 시 양쪽 날짜의 월 집계 반영
- [x] 루틴 종료일 변경 시 해당 월(들) 잔여/완료 수 재계산
- [x] 루틴 반복요일 변경(effectiveFrom 포함) 시 월 집계 정합성 유지
- [x] 토글 중 서버 실패 시 UI/월 집계 롤백
- [x] 월 경계(말일/익월) 케이스 정상 반영

## 검증 메모
- 빌드 검증: `npm run -s build` 성공 (2026-05-05).
- 시나리오 점검 방식: 수동 UI 테스트가 아닌 코드 경로 점검 기준.
- fallback 충돌 검증: `useMonthlyData.refresh()`는 `monthlyStats` 부재 시에만 원천 리패치 + 리빌드를 수행하며, 기존 `shouldUseLegacyFallback` 분기와 충돌하지 않음.

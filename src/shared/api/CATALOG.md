# shared/api 목록

`npm run api:catalog` 로 생성한다. 직접 고치지 말 것.
구조와 사용 규칙은 [README](./README.md) 를 볼 것.

## _common — 도메인 공통 유틸

배럴이 없어 파일에서 직접 가져다 쓴다.

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `fetchQueryOnce` | 쿼리를 한 번 조회하고 취소 함수를 돌려준다. | `fetchQueryOnce.ts` |
| `mapDoc` | Firestore 문서를 도메인 타입으로 바꾼다. | `mappers.ts` |
| `userCollection` | 사용자 하위 컬렉션 레퍼런스를 반환합니다. | `refs.ts` |
| `userDoc` | 사용자 하위 문서 레퍼런스를 반환합니다. | `refs.ts` |

## auth — 로그인, 프로필, 계정 삭제

배럴이 없어 파일에서 직접 가져다 쓴다.

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `AccountDeletionIncompleteError` | 계정 삭제가 데이터 삭제까지는 성공했지만 Auth 계정 삭제에서 실패한 경우. | `auth.ts` |
| `clearAdminCache` | 캐시를 비웁니다. | `adminAccess.ts` |
| `createUser` | — | `user.ts` |
| `deleteAccount` | 계정 완전 삭제 | `auth.ts` |
| `deleteAllUserData` | 사용자와 연관된 Firestore 데이터를 정리합니다. | `userCleanup.ts` |
| `deleteUserDoc` | — | `user.ts` |
| `getUserAccessInfoCached` | 사용자 문서를 한 번만 읽어 권한과 접속 기록을 함께 반환합니다. | `adminAccess.ts` |
| `getUserDoc` | — | `user.ts` |
| `signInWithGoogle` | Google 로그인 + 사용자 문서 동기화 | `auth.ts` |
| `updateLastActive` | 마지막 접속 시각을 갱신합니다. | `user.ts` |
| `updateLastLogin` | — | `user.ts` |
| `UserAccessInfo` | — | `adminAccess.ts` |

## category — 분류

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `Category` | — | `types.ts` |
| `CategoryStatus` | — | `types.ts` |
| `createCategory` | 분류를 만든다. | `crud.ts` |
| `endCategory` | 카테고리를 종료 상태로 변경합니다. | `crud.ts` |
| `getCategoriesOnce` | 카테고리를 1회 조회합니다. | `queries.ts` |
| `invalidateCategoryQueries` | 카테고리 변경에 영향을 받는 모든 쿼리를 무효화합니다. | `invalidate.ts` |
| `restoreCategory` | 종료한 분류를 다시 활성으로 되돌린다. | `crud.ts` |
| `updateCategory` | 카테고리 정보를 수정합니다. | `crud.ts` |
| `updateCategoryOrder` | 분류 정렬 순서를 한 번에 저장한다. | `order.ts` |

## monthlyStats — 월간 집계 캐시

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `buildMonthKeysBetween` | 두 날짜가 걸쳐 있는 달의 키 목록을 만든다. | `rebuild.ts` |
| `collectAffectedMonths` | — | `helpers/collectAffectedMonths.ts` |
| `getMonthlyStatsByMonthOnce` | 한 달치 집계 문서를 읽는다. | `queries.ts` |
| `MonthlyActivitySummary` | — | `types.ts` |
| `MonthlyStats` | — | `types.ts` |
| `patchMonthlyStatsByDayDeltas` | 하루의 집계를 증감값만큼 조정한다. | `queries.ts` |
| `patchMonthlyStatsCompletionByDay` | 하루의 완료 수만 고친다. | `queries.ts` |
| `rebuildMonthlyStatsByMonth` | 원본 기록에서 한 달치 집계를 다시 계산해 덮어쓴다. | `rebuild.ts` |
| `refreshCalendarConsistency` | — | `helpers/refreshCalendarConsistency.ts` |
| `replaceMonthlyStatsByMonth` | 한 달치를 통째로 바꾼다. | `queries.ts` |
| `upsertMonthlyStatsByMonth` | 넘긴 날짜만 덮어쓰고 나머지 날짜는 그대로 둔다. | `queries.ts` |

## routine — 반복 루틴

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `createRoutine` | 루틴을 생성합니다. | `crud.ts` |
| `deleteRoutine` | 루틴을 삭제합니다. | `crud.ts` |
| `getRoutineLogsByMonthOnce` | 월 기준 루틴 로그를 1회 조회합니다. | `queries.ts` |
| `getRoutineReportByWeek` | 주간 루틴 리포트를 조회합니다. | `report.ts` |
| `getRoutinesByCategory` | 한 분류에 속한 루틴을 순서대로 읽는다. | `crud.ts` |
| `getRoutinesByMonthOnce` | 월 기준 루틴을 1회 조회합니다. | `queries.ts` |
| `migrateRoutineOrderIndex` | orderIndex 가 없던 시절에 만들어진 루틴에 순서를 채워 넣는다. | `order.ts` |
| `Routine` | — | `types.ts` |
| `RoutineCategory` | — | `types.ts` |
| `RoutineReport` | — | `types.ts` |
| `RoutineReportRow` | — | `types.ts` |
| `RoutineReportWeek` | — | `types.ts` |
| `RoutineScheduleHistoryItem` | — | `types.ts` |
| `updateRoutine` | 루틴 정보를 수정합니다. | `crud.ts` |
| `updateRoutineOrder` | 루틴 정렬 순서를 한 번에 저장한다. | `order.ts` |

## routineLog — 루틴 수행 기록

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `RoutineLog` | — | `types.ts` |
| `toggleRoutineLog` | 루틴의 특정 날짜 수행 여부를 저장한다. | `crud.ts` |

## task — 날짜가 정해진 할 일

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `createTask` | 할 일을 만든다. | `crud.ts` |
| `deleteTaskWithLogs` | 할 일과 그 완료 기록을 함께 지운다. | `crud.ts` |
| `getTasksByDateOnce` | 날짜 기준 태스크를 1회 조회합니다. | `queries.ts` |
| `getTasksByMonthOnce` | 월 기준 태스크를 1회 조회합니다. | `queries.ts` |
| `migrateTaskOrderIndex` | orderIndex 가 없던 시절에 만들어진 할 일에 순서를 채워 넣는다. | `order.ts` |
| `Task` | — | `types.ts` |
| `updateTaskOrder` | 할 일 정렬 순서를 한 번에 저장한다. | `order.ts` |
| `updateTaskWithDateMove` | 태스크 수정과 날짜 이동을 처리합니다. | `crud.ts` |

## taskLog — 할 일 완료 기록

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `getTaskLogsByDateOnce` | 날짜 기준 태스크 로그를 1회 조회합니다. | `queries.ts` |
| `getTaskLogsByMonthOnce` | 월 기준 태스크 로그를 1회 조회합니다. | `queries.ts` |
| `TaskLog` | — | `types.ts` |
| `toggleTaskLog` | 할 일의 완료 여부를 뒤집는다. | `crud.ts` |

## taskSetting — 할 일 설정 화면의 복합 동작

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `copyAllTasksToDate` | 모든 태스크를 다른 날짜로 복사합니다. | `actions.ts` |
| `DateOnlyParams` | — | `types.ts` |
| `deleteAllTasksByDate` | 해당 날짜의 모든 태스크를 삭제합니다. | `actions.ts` |
| `deleteUncompletedTasks` | 미완료 태스크를 삭제합니다. | `actions.ts` |
| `MoveTasksParams` | — | `types.ts` |
| `moveUncompletedTasksToDate` | 미완료 태스크를 지정 날짜로 이동합니다. | `actions.ts` |
| `moveUncompletedTasksToToday` | 미완료 태스크를 오늘 날짜로 이동합니다. | `actions.ts` |

---

공개 항목 72개.

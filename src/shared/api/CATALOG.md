# shared/api 목록

`npm run api:catalog` 로 생성한다. 직접 고치지 말 것.
구조와 사용 규칙은 [README](./README.md) 를 볼 것.

## _common — 도메인 공통 유틸

배럴이 없어 파일에서 직접 가져다 쓴다.

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `mapDoc` | Firestore 문서를 도메인 타입으로 바꾼다. | `mappers.ts` |
| `userCollection` | users/{uid} 아래 컬렉션을 가리키는 경로를 만든다. | `refs.ts` |
| `userDoc` | users/{uid} 아래 문서 하나를 가리키는 경로를 만든다. | `refs.ts` |

## auth — 로그인, 프로필, 계정 삭제

배럴이 없어 파일에서 직접 가져다 쓴다.

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `AccountDeletionIncompleteError` | 계정 삭제가 데이터 삭제까지는 성공했지만 Auth 계정 삭제에서 실패한 경우. | `auth.ts` |
| `clearAdminCache` | 권한 조회 캐시를 비운다. | `adminAccess.ts` |
| `createUser` | 최초 로그인한 사용자의 프로필 문서를 만든다. Google 계정에서 받은 값을 그대로 담는다. | `user.ts` |
| `deleteAccount` | 계정과 데이터를 모두 지운다. | `auth.ts` |
| `deleteAllUserData` | 사용자에게 딸린 Firestore 데이터를 전부 지운다. | `userCleanup.ts` |
| `deleteUserDoc` | 사용자 프로필 문서를 지운다. 하위 데이터는 따로 지워야 한다. | `user.ts` |
| `getUserAccessInfoCached` | 사용자 문서를 한 번만 읽어 권한과 접속 기록을 함께 돌려준다. | `adminAccess.ts` |
| `getUserDoc` | 사용자 문서를 읽는다. 최초 로그인인지 판단할 때 쓴다. | `user.ts` |
| `signInWithGoogle` | Google 계정으로 로그인하고 사용자 문서를 맞춘다. | `auth.ts` |
| `updateLastActive` | 마지막 접속 시각을 기록한다. | `user.ts` |
| `updateLastLogin` | 구글 인증을 다시 거쳤을 때 마지막 로그인 시각을 갱신한다. | `user.ts` |
| `UserAccessInfo` | 사용자 문서에서 뽑아낸 관리자 여부와 마지막 접속 시각 | `adminAccess.ts` |

## category — 분류

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `Category` | 할 일과 루틴을 묶는 분류. 이름과 색을 가지며 사용자가 순서를 정한다. | `types.ts` |
| `CategoryStatus` | 분류가 쓰이는 중인지, 사용자가 끝낸 것인지 | `types.ts` |
| `createCategory` | 분류를 만들어 목록 맨 뒤에 붙인다. | `crud.ts` |
| `endCategory` | 분류를 종료 상태로 바꾼다. | `crud.ts` |
| `getCategoriesOnce` | 분류를 사용자가 정한 순서대로 읽는다. | `queries.ts` |
| `invalidateCategoryQueries` | 분류 변경 뒤 다시 읽어야 하는 캐시를 모두 무효화한다. | `invalidate.ts` |
| `restoreCategory` | 종료한 분류를 다시 활성으로 되돌린다. | `crud.ts` |
| `updateCategory` | 분류의 이름과 색을 바꾼다. 순서와 상태는 건드리지 않는다. | `crud.ts` |
| `updateCategoryOrder` | 분류 정렬 순서를 한 번에 저장한다. | `order.ts` |

## monthlyStats — 월간 집계 캐시

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `buildMonthKeysBetween` | 두 날짜가 걸쳐 있는 달의 키 목록을 만든다. | `recalculate.ts` |
| `collectAffectedMonths` | 바뀐 날짜들이 걸쳐 있는 달을 모은다. | `helpers/collectAffectedMonths.ts` |
| `getMonthlyStatsByMonthOnce` | 한 달치 집계 문서를 읽는다. | `queries.ts` |
| `getMonthlyStatsMonthsOnce` | 집계 문서가 이미 만들어져 있는 달의 목록을 읽는다. | `queries.ts` |
| `MonthlyActivitySummary` | 하루치 요약. 그날 할 일과 루틴을 합쳐 전체·완료·남은 개수를 센다. | `types.ts` |
| `MonthlyStats` | 한 달치 요약을 담는 문서. | `types.ts` |
| `patchMonthlyStatsByDayDeltas` | 하루의 집계를 증감값만큼 조정한다. 할 일 경로 전용이다. | `queries.ts` |
| `patchMonthlyStatsCompletionByDay` | 하루의 완료 수만 고친다. | `queries.ts` |
| `recalculateMonthlyStatsByMonth` | 원본 기록에서 한 달치 집계를 다시 계산해 덮어쓴다. | `recalculate.ts` |
| `refreshCalendarConsistency` | 달력과 리포트가 실제 기록과 어긋나지 않게 맞춘다. | `helpers/refreshCalendarConsistency.ts` |
| `replaceMonthlyStatsByMonth` | 한 달치를 통째로 바꾼다. | `queries.ts` |
| `upsertMonthlyStatsByMonth` | 넘긴 날짜만 덮어쓰고 나머지 날짜는 그대로 둔다. | `queries.ts` |

## notice — 공지 (사용자별이 아닌 최상위 컬렉션)

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `createNotice` | 공지를 만든다. 쓰기 1회다. | `crud.ts` |
| `deleteNotice` | 공지를 지운다. 되돌릴 수 없다. | `crud.ts` |
| `getNoticesOnce` | 공지를 고정 항목이 위로 오도록 정렬해 읽는다. | `queries.ts` |
| `Notice` | 운영자가 올리는 공지. 모든 사용자가 같은 목록을 본다. | `types.ts` |
| `setNoticePinned` | 상단 고정만 바꾼다. | `crud.ts` |
| `updateNotice` | 공지 내용을 고친다. 쓰기 1회다. | `crud.ts` |

## routine — 반복 루틴

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `createRoutine` | 루틴을 만든다. | `crud.ts` |
| `deleteRoutine` | 루틴 문서를 지운다. | `crud.ts` |
| `getRoutineLogsByMonthOnce` | 그달의 루틴 수행 기록을 읽는다. | `queries.ts` |
| `getRoutineReportByWeek` | 한 주 동안의 루틴 수행 현황을 표 형태로 만든다. | `report.ts` |
| `getRoutinesByMonthOnce` | 그달에 걸쳐 있는 루틴을 읽는다. | `queries.ts` |
| `getRoutinesOnce` | 사용자의 루틴을 모두 읽는다. 루틴 화면이 분류별로 묶어 그릴 때 쓴다. | `queries.ts` |
| `Routine` | 정해진 요일마다 되풀이하는 습관. | `types.ts` |
| `RoutineCategory` | 한 분류와 그 분류에 속한 루틴들. 루틴 화면이 분류별로 묶어 보여줄 때 쓴다. | `types.ts` |
| `RoutineReport` | 주간 리포트 전체. 한 주 정보와 루틴별 줄 목록으로 이루어진다. | `types.ts` |
| `RoutineReportRow` | 리포트의 루틴 한 줄. checks 는 날짜별 수행 여부다. | `types.ts` |
| `RoutineReportWeek` | 리포트가 다루는 한 주. 시작·끝 날짜와 요일 일곱 칸을 담는다. | `types.ts` |
| `RoutineScheduleHistoryItem` | 반복 요일을 바꾼 이력 한 건. effectiveFrom 부터 days 가 적용된다. | `types.ts` |
| `updateRoutine` | 루틴을 고친다. | `crud.ts` |
| `updateRoutineOrder` | 루틴 정렬 순서를 한 번에 저장한다. | `order.ts` |

## routineLog — 루틴 수행 기록

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `RoutineLog` | 루틴을 그날 했는지 남기는 기록. 루틴 하나와 날짜 하나에 기록도 하나다. | `types.ts` |
| `toggleRoutineLog` | 루틴의 특정 날짜 수행 여부를 저장한다. | `crud.ts` |

## task — 날짜가 정해진 할 일

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `createTask` | 할 일을 만들어 그날 그 분류의 맨 뒤에 붙인다. | `crud.ts` |
| `deleteTaskWithLogs` | 할 일과 그 완료 기록을 함께 지운다. | `crud.ts` |
| `getTasksByDateOnce` | 하루치 할 일을 읽는다. 홈 화면이 오늘 목록을 그릴 때 쓴다. | `queries.ts` |
| `getTasksByMonthOnce` | 그달의 할 일을 읽는다. 달력과 월간 집계를 다시 셀 때 쓴다. | `queries.ts` |
| `Task` | 특정 날짜에 하기로 한 할 일. date 는 `YYYY-MM-DD`, time 은 정한 경우에만 있다. | `types.ts` |
| `updateTaskOrder` | 할 일 정렬 순서를 한 번에 저장한다. | `order.ts` |
| `updateTaskWithDateMove` | 할 일을 고치고, 날짜나 분류가 바뀌면 옮긴다. | `crud.ts` |

## taskLog — 할 일 완료 기록

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `getTaskLogsByDateOnce` | 하루치 완료 기록을 읽는다. 할 일 목록에 체크 표시를 그릴 때 쓴다. | `queries.ts` |
| `getTaskLogsByMonthOnce` | 그달의 완료 기록을 읽는다. | `queries.ts` |
| `TaskLog` | 할 일을 그날 체크했는지 남기는 기록. 할 일 하나와 날짜 하나에 기록도 하나다. | `types.ts` |
| `toggleTaskLog` | 할 일의 완료 여부를 뒤집는다. | `crud.ts` |

## taskSetting — 할 일 설정 화면의 복합 동작

| 이름 | 하는 일 | 파일 |
| --- | --- | --- |
| `copyAllTasksToDate` | 하루치 할 일을 다른 날짜로 복사한다. | `actions.ts` |
| `DateOnlyParams` | 하루를 통째로 다루는 동작에 넘기는 값 | `types.ts` |
| `deleteAllTasksByDate` | 하루치 할 일을 모두 지운다. | `actions.ts` |
| `deleteUncompletedTasks` | 끝내지 못한 할 일을 지운다. | `actions.ts` |
| `MoveTasksParams` | 어느 날짜에서 어느 날짜로 옮길지 | `types.ts` |
| `moveUncompletedTasksToDate` | 끝내지 못한 할 일을 고른 날짜로 옮긴다. | `actions.ts` |
| `moveUncompletedTasksToToday` | 끝내지 못한 할 일을 오늘로 가져온다. | `actions.ts` |

---

공개 항목 76개.

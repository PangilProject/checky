# 케이스 구현 전에 필요한 것

케이스 후보를 뽑으며 찾은, 테스트를 막는 지점이다. 해결하면 지운다.

## 마크업에 이름 붙이기

역할이나 이름이 없어 테스트가 사람처럼 찾을 수 없는 요소. 스크린 리더 사용자도 같은 이유로 쓰기 어렵다.

| 위치 | 문제 | 제안 |
| --- | --- | --- |
| src/pages/HomePage/components/TaskReport/components/TaskItemsList.tsx:106 | 할 일 체크가 `div` onClick | `button` + `aria-pressed` + `aria-label="{제목} 완료"` |
| 같은 파일 :142 | ⋯ 버튼에 이름 없음 | `aria-label="{제목} 자세히"` |
| src/pages/HomePage/components/RoutineReport/components/RoutineTable.tsx:89 | 루틴 체크 버튼에 이름 없음 | `aria-label="{루틴} {M월 D일}"` + `aria-pressed` |
| src/pages/HomePage/components/TaskReport/components/AddCategory.tsx:31 | 할 일 추가가 `Stack` onClick | `button` + `aria-label="{분류}에 할 일 추가"` |
| src/pages/HomePage/components/TitleSection.tsx:56, 59 | ◀▶ 가 `div` onClick | `button` + `aria-label="이전"`/`"다음"` |
| 같은 파일 | 섹션 제목이 heading 이 아니라 "오늘"·"새로고침" 을 섹션별로 좁혀 잡을 수 없다 | `section aria-labelledby` 로 감싸기 |
| src/pages/HomePage/components/MonthlyReport/components/CalendarCell.tsx:48 | 이름이 "1"+"21" → "121" | `aria-label="{M}월 {D}일, 남은 일 {n}개"` |
| src/pages/HomePage/components/TaskReport/modals/TaskSettingModal.tsx:101 | 선택 버튼이 빈 `button` | `role="radio"` + `aria-checked` |
| src/pages/RoutinePage/components/RoutineList/components/RoutineItem.tsx:78 | 더보기 버튼에 이름 없음 | `aria-label="{제목} 더보기"` |
| src/pages/RoutinePage/.../EndDateField.tsx:31-35 | "추가"/"삭제" 가 다른 버튼과 이름이 겹침 | `aria-label="종료 날짜 추가"` |
| src/pages/RoutinePage/.../RepeatDaysField.tsx:27, 44 | 요일 선택 상태를 알 수 없음 | `aria-pressed` |
| src/pages/RoutinePage/.../TitleField.tsx:22-27, src/pages/CategoryPage/components/CategoryModal.tsx:245 | 입력란과 레이블이 연결되지 않음 | `label htmlFor` 또는 `aria-label` |
| src/pages/CategoryPage/components/CategoryModal.tsx:284-328 | 색 선택 토글·견본에 이름 없음 | `button` + `aria-label={색 이름}` + `aria-pressed` |
| src/shared/ui/Modal.tsx:92 | dialog 에 이름 없음 | `aria-labelledby` 로 제목 연결 |
| src/shared/ui/DatePicker.tsx:180-191 | 날짜 버튼 이름이 숫자뿐 | `aria-label="2026년 10월 20일"` |
| src/shared/ui/notices/components/NoticeList.tsx:27 | 공지 항목이 클릭만 되는 `div` | `button` |

## seed 확장

- `routineLog`: 루틴 체크 기록 (`users/{uid}/routineLogs/{routineId}_{date}`)
- `category` 의 `status: "ENDED"` 와 `endedAt`
- `routine` 의 `endDate`, 여러 구간의 `scheduleHistory`
- `task` 의 `time`
- `monthlyStats`: 마이 화면 달성률과 월간 통계 회귀 케이스용
- `notice`: 최상위 `notices` 컬렉션 (모든 사용자가 함께 본다)
- 관리자 권한 조회: 탈퇴 뒤 데이터가 지워졌는지 확인

## 실패 흉내

- 쓰기 실패: `page.route("**/documents:commit*", ...)`. 읽기는 `:runQuery`, `:batchGet`
- 일부러 실패시키는 케이스는 콘솔 에러가 나므로 `pageErrors` 에 허용 목록이 필요하다

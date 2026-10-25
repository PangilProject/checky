# 기록 (돌아보기)

계산 자체는 summarizeRecord.test.ts 가 맡는다. 여기서는 기간 경계, 다른 화면에서 한 일이 새로고침 없이 반영되는지를 본다.
날짜를 따로 적지 않으면 today 2026-10-21(수), 그 주는 10/18(일)~10/24(토).

### TC-RECORD-001 홈에서 할 일을 체크하면 기록 숫자가 새로고침 없이 바뀐다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 전제: "공부" 에 오늘 할 일 A·B. 기록 화면을 먼저 연다
- 절차: 홈 → A 체크 → 기록
- 기대: 해낸 할 일 1 / 2, 남은 할 일 1개(B), 분류별 "공부 1개", 달성률 50%
- 근거: src/pages/HomePage/components/TaskReport/hooks/useTaskList.ts:320, 3ffaee6

### TC-RECORD-002 홈에서 루틴을 체크하면 루틴 수행이 바로 바뀐다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 전제: 10-18 부터 매일 루틴 "독서". 기록 화면을 먼저 연다
- 절차: 홈에서 오늘 독서 체크 → 기록 → 주간 → (다시 홈에서 해제 → 기록)
- 기대: 루틴 수행 1 / 4, 독서 행 1 / 4 25%. 해제하면 0 / 4
- 근거: src/pages/HomePage/components/RoutineReport/hooks/useRoutineToggle.ts:76-93

### TC-RECORD-003 할 일을 다른 달로 옮기면 두 달 모두 맞게 센다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 전제: 10-21 에 완료한 할 일 X. 기록에서 10월과 9월을 한 번씩 연다
- 절차: 홈에서 X 를 09-30 으로 옮긴다 → 기록 10월, 9월
- 기대: 10월 0 / 0. 9월 1 / 1, 남은 할 일 0개
- 근거: src/pages/HomePage/components/TaskReport/hooks/useTaskDateMove.ts:70-91, 7292181

### TC-RECORD-004 오늘 뒤의 날은 세지 않는다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 전제: 할 일 10-20, 10-21, 10-22. 10-18 부터 매일 루틴
- 절차: 기록 → 주간
- 기대: "10월 18일 ~ 10월 24일 · 10월 21일까지". 해낸 할 일 0 / 2, 남은 할 일 2개, 10-22 할 일은 없다. 루틴 0 / 4
- 근거: src/pages/RecordPage/index.tsx:61-64, src/shared/utils/getAchievementRanges.ts:77-82

### TC-RECORD-005 주는 일요일에 시작하고, 두 달에 걸친 주를 합쳐 센다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 전제: today 2026-10-01(목). 할 일 09-26(토), 09-27(일, 완료), 10-01
- 절차: 기록 → 주간
- 기대: "9월 27일 ~ 10월 3일 · 10월 1일까지". 해낸 할 일 1 / 2, 09-26 은 빠진다
- 근거: src/pages/RecordPage/hooks/useRecordData.ts:42-45

### TC-RECORD-006 이전·다음으로 오가며 기간이 바뀌고, 미래 기간은 세지 않는다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 절차: 월간 "이전 달" → "다음 달" → "다음 달" → "이번 달"
- 기대: 2026년 9월 → 10월 → 11월 "아직 오지 않은 기간이에요." → 10월
- 근거: src/pages/RecordPage/index.tsx:66-69, 111-114

### TC-RECORD-007 연도가 바뀌는 달로 이동한다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 전제: today 2027-01-05. 2026-12-31 에 완료한 할 일
- 기대: "이전 달" 은 2026년 12월, 해낸 할 일 1 / 1. 주간 "이번 주" 는 1월 3일 ~ 1월 9일
- 근거: src/shared/utils/dateNavigation.ts:11-16

### TC-RECORD-008 주간·월간을 바꿔도 고른 날짜가 유지된다
- 우선순위: P3 / 태그: @feature / 상태: 제안
- 절차: 월간 "이전 달"(9월) → 주간
- 기대: 8월 30일 ~ 9월 5일. 달을 옮기면 날짜가 1일로 맞춰지므로 그 달 1일이 속한 주가 나온다 (의도한 동작)
- 근거: src/shared/utils/dateNavigation.ts:13

### TC-RECORD-009 루틴 행을 누르면 체크한 날이 "했음" 으로 보인다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 전제: 매일 루틴 "독서". 기록에서 독서 기록 창을 한 번 열었다 닫는다
- 절차: 홈에서 10-20 체크 → 기록 → "독서 기록 보기"
- 기대: "10월 20일 했음"
- 근거: useRoutineToggle.ts:96-114

### TC-RECORD-010 홈에서 추가·삭제한 할 일이 반영된다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 전제: 오늘 완료한 할 일 C. 기록을 먼저 연다
- 절차: 홈에서 D 추가 → 기록 → 홈에서 C 삭제 → 기록
- 기대: 1 / 2 와 남은 할 일 D → 0 / 1 과 "이 기간에 해낸 할 일이 없어요."
- 근거: useTaskList.ts:227, useTaskModalHandlers.ts:193

### TC-RECORD-011 홈에서 일괄 이동하면 반영된다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 전제: 10-20 에 미완료 2개. 기록을 먼저 연다
- 절차: 홈 리스트 메뉴로 오늘로 옮긴다 → 기록
- 기대: 남은 할 일 2개가 모두 "오늘"
- 근거: src/pages/HomePage/components/TaskReport/sections/TaskSetting.tsx:50-76

### TC-RECORD-012 남은 할 일이 10개를 넘으면 접고 펼친다
- 우선순위: P3 / 태그: @feature / 상태: 제안
- 전제: 이번 달 미완료 12개
- 기대: 10개 → "2개 더 보기" 12개 → "접기" 10개
- 근거: src/pages/RecordPage/components/RecordSections.tsx:13, 162-170

### TC-RECORD-013 빈 사용자는 "-" 와 안내 문구를 본다
- 우선순위: P3 / 태그: @feature / 상태: 제안
- 기대: 달성률 "-", 세 영역의 빈 안내
- 근거: RecordSections.tsx:34, 73-76, 133-136, 187-190

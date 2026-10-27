# 케이스 구현 전에 필요한 것

케이스 후보를 뽑으며 찾은, 테스트를 막는 지점이다. 해결하면 지운다.

## 마크업에 이름 붙이기

역할이나 이름이 없어 테스트가 사람처럼 찾을 수 없는 요소. 스크린 리더 사용자도 같은 이유로 쓰기 어렵다.
P1 케이스가 거치는 요소는 이름을 붙였다. 남은 것은 P2·P3 케이스용이다.

| 위치 | 문제 | 제안 |
| --- | --- | --- |
| src/pages/HomePage/components/TitleSection.tsx:56, 59 | ◀▶ 가 `div` onClick | `button` + `aria-label="이전"`/`"다음"` |
| 같은 파일 | 섹션 제목이 heading 이 아니라 "오늘"·"새로고침" 을 섹션별로 좁혀 잡을 수 없다 | `section aria-labelledby` 로 감싸기 |
| src/pages/HomePage/components/TaskReport/modals/TaskSettingModal.tsx:101 | 선택 버튼이 빈 `button` | `role="radio"` + `aria-checked` |
| src/pages/RoutinePage/.../EndDateField.tsx:31-35 | "추가"/"삭제" 가 다른 버튼과 이름이 겹침 | `aria-label="종료 날짜 추가"` |
| src/shared/ui/notices/components/NoticeList.tsx:27 | 공지 항목이 클릭만 되는 `div` | `button` |

## seed 확장

- `category` 의 `status: "ENDED"` 와 `endedAt`
- `routine` 의 `endDate`, 여러 구간의 `scheduleHistory`
- `task` 의 `time`
- `monthlyStats`: 마이 화면 달성률과 월간 통계 회귀 케이스용
- `notice`: 최상위 `notices` 컬렉션 (모든 사용자가 함께 본다)

## 확인이 필요한 앱 동작

- **다시 받아 온 집계가 진행 중인 체크 표시를 덮는다**: 체크하면 캘린더 숫자를 먼저 고쳐 두는데, 그사이 다른 곳(첫 문서 생성 뒤 재계산 등)이 월간 통계를 다시 받아 오면 고쳐 둔 값이 덮여 새로고침 전까지 옛 숫자가 보인다. 저장된 값은 맞다. 부하가 클 때 TC-HOME-004 에서 한 번 관찰했다. 체크가 끝났을 때 그사이 통계를 다시 받아 왔으면 한 번 더 받아 오는 식으로 막을 수 있으나, 재현을 고정하는 테스트를 먼저 만들어야 한다.

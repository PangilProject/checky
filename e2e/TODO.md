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

## 실패 흉내

- 쓰기 실패: `page.route("**/documents:commit*", ...)`. 읽기는 `:runQuery`, `:batchGet`
- 일부러 실패시키는 케이스는 콘솔 에러가 나므로 `pageErrors` 에 허용 목록이 필요하다

## 결정이 필요한 버그

- **월간 통계 첫 저장 경쟁** (TC-HOME-016): 그 달의 통계 문서를 처음 만드는 사이에 할 일을 추가하거나 체크하면 그 조작이 집계에서 영구히 빠진다. 문서가 없을 때 하루치 문서를 만들지 않는다는 기존 설계와 얽혀 있어 수정 방식을 정해야 한다.

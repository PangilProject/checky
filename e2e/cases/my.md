# 마이

### TC-MY-001 탈퇴하면 계정과 데이터가 모두 지워진다
- 우선순위: P1 / 태그: @regression / 상태: 제안
- 전제: 카테고리·루틴·할 일 1개씩
- 절차: 회원탈퇴 → "탈퇴" → 에뮬레이터 본인 확인 팝업에서 같은 계정 선택
- 기대: /login 으로 이동, "회원탈퇴가 완료되었습니다." 관리자 권한으로 조회하면 users/{uid} 와 하위 컬렉션이 모두 비어 있고, Auth 계정도 없다
- 근거: src/shared/api/auth/auth.ts:65-83, src/shared/api/auth/userCleanup.ts:9-16, 3e54175, ab12329
- 메모: 본인 확인 팝업은 에뮬레이터가 띄우는 페이지라 자동화할 수 있다고 보지만, 구현하며 확인한다

### TC-MY-002 본인 확인 팝업을 닫으면 탈퇴가 진행되지 않는다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 전제: 카테고리 "건강"
- 절차: 회원탈퇴 → "탈퇴" → 팝업을 닫는다
- 기대: "본인 확인이 취소되었습니다. 탈퇴가 진행되지 않았습니다." /my 에 머물고 "건강" 이 남아 있다
- 근거: src/pages/MyPage/MyPage.tsx:78-80

### TC-MY-003 로그아웃하면 보호된 화면에 다시 들어갈 수 없다
- 우선순위: P1 / 태그: @feature / 상태: 제안
- 절차: 로그아웃 → 뒤로 가기 → /my 직접 진입
- 기대: "로그아웃 되었습니다." 세 경우 모두 /login
- 근거: src/pages/MyPage/MyPage.tsx:102-116, src/shared/ui/PrivateRoute.tsx:30

### TC-MY-004 다른 계정으로 다시 로그인하면 이전 계정의 데이터가 보이지 않는다
- 우선순위: P1 / 태그: @regression / 상태: 제안
- 전제: 사용자 A 의 카테고리 "A전용". A 로 /category 를 한 번 연다
- 절차: 로그아웃 → 사용자 B 로 로그인 → /category
- 기대: "A전용" 이 없다
- 근거: src/pages/MyPage/MyPage.tsx:96-99, 3e54175

### TC-MY-005 다크 테마를 고르면 바로 바뀌고 새로고침해도 유지된다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 기대: "다크" 가 눌린 상태, html 에 dark 클래스. 새로고침 후에도 같다
- 근거: src/pages/MyPage/components/ThemeSection.tsx:31-37, 40d07b7

### TC-MY-006 프로필과 최근 6개월 달성률을 보여 준다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 전제: today 2026-10-21. 9월 월간 통계(10건 중 7건 완료) (seed 확장 필요)
- 기대: 이름 "E2E 사용자", 5월~10월, 9월 70%, 기록 없는 달은 "기록 없음"
- 근거: src/pages/MyPage/components/MonthlyHistorySection.tsx:89-104, 1fce43f, 9a95573

### TC-MY-007 탈퇴 확인에서 취소하면 아무것도 바뀌지 않는다
- 우선순위: P3 / 태그: @feature / 상태: 제안
- 기대: 모달이 닫히고 팝업이 열리지 않는다
- 근거: src/pages/MyPage/MyPage.tsx:138-147

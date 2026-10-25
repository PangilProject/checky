# 공통 (헤더·푸터·로그인 흐름)

### TC-COMMON-001 처음 로그인하면 프로필 문서가 자동으로 생긴다
- 우선순위: P1 / 태그: @regression / 상태: 제안
- 절차: 로그인만 하고 /home 이 뜨기를 기다린 뒤 관리자 권한으로 users/{uid} 를 읽는다
- 기대: 문서가 있고 uid, name 이 있으며 isAdmin 은 없다
- 근거: src/shared/stores/authStore.ts:95-101, firestore.rules:83-87, de153af

### TC-COMMON-002 로그인한 사용자가 / 나 /login 에 가면 /home 으로 간다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 기대: 두 경우 모두 /home, "달성 현황" 이 보인다
- 근거: src/pages/LandingPage/LandingPage.tsx:22, src/pages/LoginPage/LoginPage.tsx:19

### TC-COMMON-003 공지는 고정 공지가 먼저, 상세에서 이전·다음으로 오간다
- 우선순위: P2 / 태그: @feature / 상태: 제안
- 전제: 고정 1건, 일반 2건 (seed 확장 필요. 공지는 모든 사용자가 같이 보므로 제목에 고유값을 넣는다)
- 절차: 헤더 "공지" → 두 번째 공지 → "다음 공지" → 목록으로 → "닫기"
- 기대: 고정 공지 → 최신순. 상세 제목이 바뀌고 모달이 닫힌다
- 근거: src/shared/api/notice/queries.ts:14, src/shared/ui/notices/index.tsx:23-30

### TC-COMMON-004 푸터에서 약관으로 가고, 인스타그램은 새 창으로 열린다
- 우선순위: P3 / 태그: @feature / 상태: 제안
- 기대: /terms 로 이동. "checky 인스타그램 (새 창)" 은 target=_blank
- 근거: src/shared/ui/Footer.tsx:21-32, 10d7c86

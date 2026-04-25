# Checky

![OG](public/OG.png)

## 서비스 개요

Checky는 개인의 일상 실행력을 기록하기 위해 만든 웹 서비스입니다.  
핵심 아이디어는 해야 할 일을 다음 두 종류로 분리해 관리하는 것입니다.

- `Task`: 날짜가 고정된 일회성 할 일
- `Routine`: 반복 규칙(요일/기간)을 가진 습관형 할 일

이 구조를 통해 하루 단위 실행과 월 단위 추이를 동시에 관리할 수 있습니다.

## 이 서비스가 해결하려는 문제

일반적인 할 일 앱은 단기 할 일과 반복 습관이 한 리스트에 섞여 관리 피로가 큽니다.  
Checky는 Task와 Routine을 분리해 다음을 명확히 합니다.

- 오늘 반드시 처리해야 하는 일(Task)
- 장기적으로 유지해야 하는 반복 행동(Routine)

결과적으로, 사용자는 `오늘 실행`과 `장기 습관 유지`를 동시에 추적할 수 있습니다.

## 핵심 사용자 흐름

1. Google 로그인
2. 카테고리 생성/정리
3. Task 추가(해당 날짜 할 일)
4. Routine 추가(반복 요일/기간 설정)
5. 홈에서 하루 단위 완료 체크
6. 월간 리포트에서 수행 패턴 확인

## 화면/기능 구성

- `/`: 로그인
- `/home`: 일일 실행 허브(Task/Routine/월간 요약)
- `/category`: 카테고리 관리(활성/종료/정렬)
- `/routine`: 루틴 등록/수정/정렬
- `/my`: 사용자 정보/계정 관련 메뉴
- `/admin`: 관리자 대시보드
- `/admin/users`: 사용자 관리
- `/admin/notices`: 공지 관리
- `/admin/reports`: 운영 리포트

## 데이터 관점 요약

사용자 하위 컬렉션 중심으로 데이터가 분리됩니다.

- `tasks`, `taskLogs`
- `routines`, `routineLogs`
- `categories`
- `monthlyStats` (월간 집계 캐시)

특히 `monthlyStats`는 월간 화면 비용을 줄이기 위한 요약 문서이며, 상세 내용은 [docs/monthlyStats.md](/Users/kimkwang-il/Desktop/checky/checky/docs/monthlyStats.md)에서 확인할 수 있습니다.

## 기술 구성

- Frontend: `React 19`, `TypeScript`, `Vite`
- Styling: `Tailwind CSS`
- Routing: `react-router-dom`
- State/Data: `@tanstack/react-query`, `React Context`, `zustand`
- Backend: `Firebase Auth`, `Firestore`

## 프로젝트 구조

```text
src
├─ pages/          # 사용자 화면
├─ admin/          # 관리자 화면
├─ shared/api/     # 도메인 API 계층
├─ shared/ui/      # 공통 UI
├─ shared/hooks/   # 공통 훅
├─ firebase/       # Firebase 초기화/인증
└─ router.tsx      # 라우팅 정의
```

## 참고 문서

- 월간 집계 최적화: [docs/monthlyStats.md](/Users/kimkwang-il/Desktop/checky/checky/docs/monthlyStats.md)
- 성능 리포트: [docs/performance-report.md](/Users/kimkwang-il/Desktop/checky/checky/docs/performance-report.md)
- 리팩터 기록: [docs/refactor/260310.md](/Users/kimkwang-il/Desktop/checky/checky/docs/refactor/260310.md)

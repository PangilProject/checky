# Checky

![OG](public/OG.png)

## 1. 프로젝트 소개

Checky는 Task(일회성 할 일)와 Routine(반복 습관)을 분리해 관리하는 성장 기록 웹 서비스입니다.  
인증 기반 라우팅, 날짜 중심 조회, 카테고리 관리 구조를 갖춘 React + Firebase 프로젝트입니다.

## 2. 핵심 기능

- Google 로그인 기반 사용자 인증
- 인증 상태 기반 보호 라우팅
- 홈/카테고리/루틴/마이페이지 중심 라우팅 구조
- Task, Routine, Category 도메인 API 계층 구성
- 날짜 전역 상태 공유(Context) + 서버 상태 관리(React Query)

## 3. 기술 스택

- Frontend: `React 19`, `TypeScript`, `Vite`
- Styling: `Tailwind CSS`
- Routing: `react-router-dom`
- State: `React Context`, `@tanstack/react-query`, `zustand`
- Backend: `Firebase (Auth, Firestore)`
- 기타: `dnd-kit`, `recharts`, `react-toastify`

## 4. 빠른 시작

```bash
npm install
npm run dev
```

- 기본 개발 서버: `http://localhost:5173`

## 5. 환경 변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 설정합니다.

```env
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_APP_ID=your_app_id
```

## 6. 프로젝트 구조

```text
src
├─ admin/           # 관리자 화면
├─ firebase/        # Firebase 초기화 및 인증 연동
├─ pages/           # 페이지 단위 UI
├─ services/        # 도메인 서비스 레이어
├─ shared/          # 공통 API, 훅, UI, 유틸
└─ styles/          # 전역 스타일
```

## 7. 배포 방법

```bash
npm run deploy
```

- `build` 후 Firebase Hosting 배포를 수행합니다.

## 8. 로드맵

- Task/Routine CRUD UX 개선
- 캘린더 기반 월간 리포트 고도화
- 사용자별 통계/시각화 확장
- 테스트 코드 및 품질 자동화 강화

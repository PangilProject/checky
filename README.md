# Checky :: 당신의 성장을 기록하는 똑똑한 투두리스트

![OG](public/OG.png)

## 1. 프로젝트 소개 (Overview)

**Checky**는 단순한 할 일 목록(To-do List)을 넘어, 사용자의 **지속 가능한 성장**을 돕기 위해 설계된 웹 애플리케이션입니다. 일회성 태스크 관리, 주기적인 루틴 형성, 그리고 월별 회고를 통한 성취 시각화 기능의 구현을 목표로 합니다.

React와 TypeScript를 기반으로, Feature-Sliced Design에 영감을 받은 확장 가능한 아키텍처를 구축했습니다. Firebase를 통한 사용자 인증 기능이 구현되었으며, React Router를 통해 사용자의 인증 상태에 따른 접근 제어를 관리합니다. 현재는 핵심 기능 구현을 위한 견고한 기반을 다진 상태입니다.

**주요 목표:**
- **분리된 관리:** 일회성 '태스크'와 반복적인 '루틴'을 명확히 구분하여 관리의 복잡성을 줄입니다. (계획)
- **동기 부여:** 캘린더를 통해 월별 성취도를 한눈에 파악하고, 시각적 피드백으로 동기를 부여합니다. (계획)
- **직관적 UX:** 사용자가 기능에 압도되지 않고, 쉽고 빠르게 자신의 할 일을 기록하고 추적할 수 있는 사용자 경험을 제공합니다. (계획)

## 2. 문제 정의 & 기획 의도

기존 투두리스트 앱들은 '오늘 할 일'과 '꾸준히 해낼 습관'을 구분하지 않아 장기적인 목표 관리에 한계가 있었습니다. 또한, 지난 기록을 돌아보며 성취감을 느끼기 어려운 구조였습니다.

**Checky의 기획 의도:**
1.  **Task와 Routine의 개념적 분리:** 단기 목표(`Task`)와 장기 습관(`Routine`)을 구분하여 사용자가 자신의 활동을 더 명확하게 인지하고 관리할 수 있는 구조를 제공합니다. (구현 예정)
2.  **시각적 회고 기능:** `Calendar` 뷰를 통해 과거의 활동 기록을 시각적으로 제공함으로써, 사용자가 자신의 성실도를 돌아보고 지속적인 동기를 얻을 수 있도록 돕습니다. (구현 예정)
3.  **핵심에 집중한 UI/UX:** 복잡한 기능 대신, 본질적인 '기록'과 '확인'이라는 행위에 집중할 수 있는 단순하고 직관적인 사용자 경험을 제공하는 것을 목표로 합니다.

## 3. 핵심 기능 (구현 및 계획)

- **✅ **[구현 완료]** Firebase 기반 사용자 인증**
  - Google 계정을 이용한 간편하고 안전한 소셜 로그인 (`useAuth` 훅)
  - `PrivateRoute`를 통한 인증 기반 라우팅 접근 제어

- **✅ **[기반 구현]** 페이지 라우팅 및 레이아웃**
  - `react-router-dom`을 사용한 명확한 페이지 분리 (홈, 카테고리, 루틴 등)
  - 재사용 가능한 `Header` 등 공통 UI 컴포넌트 시스템 (`shared/ui`)

- **📅 **[구현 목표]** 태스크 관리 (Task Management)**
  - 날짜별 `Task` 생성, 조회, 수정, 삭제 (CRUD) 기능 구현 예정

- **🔁 **[구현 목표]** 루틴 관리 (Routine Management)**
  - 매일 반복하는 `Routine` 생성, 조회, 수정, 삭제 (CRUD) 기능 구현 예정

- **📁 **[구현 목표]** 카테고리 설정 (Category Management)**
  - `Task`와 `Routine`을 그룹화할 수 있는 카테고리 생성 및 관리 기능 구현 예정

## 4. 기술 스택

- **Core:** `React 18`, `TypeScript`
- **Build Tool:** `Vite`
- **Styling:** `Tailwind CSS`, `PostCSS`
- **State Management:** `React Context API`
- **Routing:** `React Router DOM`
- **Backend & Database:** `Firebase (Authentication, Firestore 설정)`
- **Linting & Formatting:** `ESLint`

## 5. 프로젝트 구조

이 프로젝트는 **페이지 중심 아키텍처(Page-centric Architecture)**를 채택하여, 각 페이지가 하나의 독립적인 기능 단위(feature) 역할을 하도록 설계되었습니다. 이를 통해 코드의 응집도를 높이고, 다른 페이지에 미치는 영향을 최소화했습니다.

```
/src
├───assets/             # 폰트, 이미지 등 정적 에셋
├───firebase/           # Firebase 설정 및 초기화
├───pages/              # 라우팅 단위의 페이지 컴포넌트 (핵심 기능 단위)
│   ├───HomePage/       # 홈 페이지 (대시보드)
│   │   └───components/ # HomePage에서만 사용하는 컴포넌트
│   ├───CategoryPage/   # 카테고리 관리 페이지
│   │   └───components/
│   └───...
├───router.tsx          # React Router 설정
├───shared/             # 여러 페이지에서 공유되는 공통 코드
│   ├───api/            # 백엔드 API 통신 계층
│   ├───constants/      # 공통 상수
│   ├───contexts/       # React Context (전역 날짜 관리)
│   ├───hooks/          # 공통 커스텀 훅
│   └───ui/             # 공통 UI 컴포넌트
├───stores/             # (현재 플레이스홀더)
└───styles/             # 전역 CSS 및 스타일 설정
```

- **`pages`**: 애플리케이션의 핵심 구성 단위입니다. 각 디렉토리(`HomePage`, `CategoryPage` 등)는 하나의 완전한 페이지이자 기능 단위를 의미합니다. 각 페이지는 자신만의 `components` 하위 디렉토리를 가짐으로써, 해당 페이지에서만 사용되는 컴포넌트를 캡슐화합니다.
- **`shared`**: 여러 `pages`에서 공통으로 사용되는 재사용 가능한 코드의 집합입니다.
  - **`shared/api`**: Firestore와의 모든 통신을 담당하는 함수들을 모아놓은 서비스 레이어입니다.
  - **`shared/hooks`**: 인증, 날짜 조작 등 여러 컴포넌트에서 재사용 가능한 로직을 담은 커스텀 훅입니다.
  - **`shared/ui`**: `Button`, `Modal` 등 애플리케이션 전반의 디자인 일관성을 유지하는 순수 UI 컴포넌트입니다.

## 6. 주요 구현 포인트

핵심 기능 구현에 앞서, 유지보수성과 확장성을 극대화하는 아키텍처를 구축하는 데 중점을 두었습니다.

### 1. 페이지 중심 아키텍처 (Page-centric Architecture)
별도의 `features` 디렉토리 대신, `pages` 디렉토리가 애플리케이션의 핵심 기능 단위를 구성합니다. `HomePage`는 '대시보드 기능', `CategoryPage`는 '카테고리 관리 기능'으로 작동하며, 각 페이지에 필요한 하위 컴포넌트들은 해당 페이지 폴더 내에 위치시켜 응집도를 높였습니다. 이 구조는 특정 페이지와 관련된 모든 파일을 한 곳에서 관리할 수 있어 코드 추적과 유지보수가 용이합니다.

### 2. 중앙화된 API 서비스 레이어 (`shared/api`)
Firestore와의 모든 데이터 통신은 `shared/api` 디렉토리 내의 파일들(`task.ts`, `routine.ts` 등)로 추상화했습니다. 컴포넌트는 `getTasks`, `addRoutine`과 같은 API 함수를 호출할 뿐, Firebase의 구체적인 구현을 알 필요가 없습니다. 이 설계는 다음과 같은 장점을 가집니다.
- **UI와 데이터 로직의 분리:** 컴포넌트는 UI 렌더링에만 집중할 수 있습니다.
- **유지보수 용이성:** 향후 백엔드 교체나 API 스펙 변경 시, 수정 범위가 `shared/api`로 한정됩니다.

### 3. 인증 기반의 보안 라우팅
- **`useAuth` 훅:** `onAuthStateChanged` 리스너를 사용하여 사용자의 로그인 상태를 실시간으로 감지하고, `user` 객체와 `isLoading` 상태를 제공합니다.
- **`PrivateRoute` 컴포넌트:** `useAuth` 훅을 사용하여 로그인하지 않은 사용자가 보호된 페이지에 접근할 경우, 로그인 페이지로 리다이렉트시키는 역할을 합니다. `react-router-dom`의 `Outlet`과 결합되어 선언적으로 라우트를 보호합니다.

### 4. `React Context API`를 활용한 전역 날짜 관리
`DateContext.tsx`를 통해 애플리케이션 전반에서 공유되어야 하는 '현재 선택된 날짜'(`selectedDate`) 상태를 효과적으로 관리합니다. 이 Context를 구독하는 컴포넌트들은 날짜 변경 시 자동으로 업데이트되며, 이는 캘린더 및 날짜 기반 UI를 유연하게 구성할 수 있는 기반이 됩니다.

## 7. Firebase 아키텍처

Checky 프로젝트는 백엔드 서비스로 Firebase를 활용하여 사용자 인증 및 데이터베이스 기능을 구현했습니다. Firebase는 빠른 개발 속도와 확장성, 그리고 관리의 용이성 측면에서 선택되었습니다.

-   **`src/firebase/firebase.ts`**:
    Firebase 프로젝트 설정 정보를 기반으로 `initializeApp`을 통해 Firebase 앱을 초기화합니다. `getAuth()`를 통해 인증 인스턴스(`auth`)를, `getFirestore()`를 통해 Firestore 데이터베이스 인스턴스(`db`)를 생성하고 외부에 `export`하여 다른 모듈에서 사용합니다. 이는 Firebase 서비스의 진입점 역할을 합니다.

-   **`src/firebase/auth.ts`**:
    `firebase/firebase.ts`에서 생성된 `auth` 인스턴스를 사용하여 사용자 인증 관련 기능을 담당합니다. `onAuthStateChanged` 리스너를 통해 사용자 로그인 상태 변화를 감지하고, `useAuth` 훅을 통해 현재 로그인된 사용자 정보(`User`)를 제공합니다.

-   **`src/shared/api/`**:
    실제 애플리케이션의 핵심 데이터(태스크, 루틴, 카테고리 등)를 Firestore 데이터베이스와 연동하는 로직을 캡슐화한 서비스 레이어입니다. `category.ts`, `routine.ts`, `task.ts`, `routineLog.ts`, `taskLog.ts` 등의 파일들은 각각 해당 도메인의 데이터를 Firestore에 저장, 조회, 수정, 삭제하는 함수들을 포함합니다. 이 계층을 통해 UI 컴포넌트는 직접 Firestore에 접근하는 대신, 추상화된 API 함수를 호출하여 데이터 작업을 수행합니다.

이러한 구조는 Firebase 서비스의 설정을 중앙 집중화하고, 인증 로직과 데이터 연동 로직을 분리하여 각 모듈의 독립성을 높이고 유지보수를 용이하게 합니다.

## 8. 상태 관리 & 데이터 흐름

**날짜 상태 흐름 (DateContext 사용):**
1.  **[Provider]** `DateProvider`가 앱의 상위 레벨에서 `selectedDate` 상태와 이를 변경하는 `setSelectedDate` 함수를 Context를 통해 제공합니다.
2.  **[State Update]** 사용자가 `Calendar` 컴포넌트에서 특정 날짜를 클릭하면, 해당 컴포넌트는 Context의 `setSelectedDate` 함수를 호출하여 전역 날짜 상태를 업데이트합니다.
3.  **[Re-render]** `useSelectedDate` 훅을 통해 이 Context를 구독하고 있던 `TaskList`와 같은 다른 컴포넌트들이 리렌더링되며, 변경된 날짜에 맞는 UI를 (현재는 데이터 연동 없이) 보여줄 준비를 합니다.

## 8. 트러블 슈팅 (설계 관점)

- **문제: 전역 상태 관리의 필요성**
  - **예상 문제점:** `selectedDate`와 같이 여러 컴포넌트에서 공유되어야 하는 상태를 각 컴포넌트에서 독립적으로 관리하거나 `props`로 전달할 경우, 상태 불일치 및 Prop Drilling 문제가 발생할 수 있습니다.
  - **설계상 해결책:** `React Context API`를 활용하여 `DateContext`를 구현함으로써, `selectedDate`를 단일 진실 공급원(Single Source of Truth)으로 관리합니다. 이를 통해 관련된 모든 컴포넌트가 일관된 날짜 정보를 사용하며, 상태 관리의 복잡성을 줄였습니다.

## 9. 배운 점 & 회고

- **아키텍처 우선 설계:** 기능 구현에 앞서 견고한 아키텍처를 먼저 설계하는 것이 장기적으로 프로젝트의 안정성과 확장성에 얼마나 중요한지를 체감했습니다. `FSD` 원칙을 적용하며 코드의 책임과 역할을 명확히 나누는 훈련을 할 수 있었습니다.
- **상태 관리 도구의 선택:** `React Context`는 전역적으로 공유되는 불변(relatively immutable) 상태를 관리하는 데 효과적인 도구임을 다시 한번 확인했습니다.
- **향후 개발 계획:**
  1.  **Firestore 데이터 연동:** 현재 설계된 구조를 바탕으로, `features` 폴더 내에 데이터 훅(`useTasks`, `useRoutines`) 및 Firebase 서비스 로직을 구현하여 `Task`, `Routine`, `Category`에 대한 Firestore CRUD 기능을 본격적으로 구현할 예정입니다.
  2.  **`TanStack Query` 도입 고려:** 데이터 페칭, 캐싱, 뮤테이션 관리를 위해 `TanStack Query` (React Query) 도입을 고려하여 서버 상태 관리 로직을 고도화할 계획입니다.
  3.  **테스트 코드 작성:** `Jest`와 `React Testing Library`를 사용하여 컴포넌트 및 커스텀 훅에 대한 단위/통합 테스트를 작성하여 코드의 신뢰도를 높일 것입니다.

## 10. 실행 방법

1.  **저장소 복제**
    ```bash
    git clone https://github.com/your-username/checky.git
    cd checky
    ```

2.  **패키지 설치**
    ```bash
    npm install
    ```

3.  **Firebase 환경 변수 설정**
    - 프로젝트 루트에 `.env.local` 파일을 생성합니다.
    - Firebase 프로젝트에서 발급받은 웹 앱 구성 객체를 아래 형식에 맞게 입력합니다.
    ```
    VITE_API_KEY=your_api_key
    VITE_AUTH_DOMAIN=your_auth_domain
    VITE_PROJECT_ID=your_project_id
    VITE_STORAGE_BUCKET=your_storage_bucket
    VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_APP_ID=your_app_id
    ```

4.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    - 브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)으로 접속합니다.
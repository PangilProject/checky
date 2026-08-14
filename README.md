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

로그인이 필요한 화면

- `/home`: 일일 실행 허브(Task/Routine/월간 요약)
- `/category`: 카테고리 관리(활성/종료/정렬)
- `/routine`: 루틴 등록/수정/정렬
- `/my`: 사용자 정보/계정 관련 메뉴 (화면 테마 선택 포함)

관리자 권한이 필요한 화면

- `/admin`: 관리자 대시보드
- `/admin/users`: 사용자 관리
- `/admin/notices`: 공지 관리
- `/admin/reports`: 운영 리포트

로그인 없이 열리는 화면

- `/`: 로그인
- `/privacy`: 개인정보 처리방침
- `/terms`: 이용약관

방침과 약관은 가입 전에 확인할 수 있어야 하므로 인증 가드 밖에 둡니다.
문서 원본은 `src/pages/legal/content` 의 마크다운 한 벌이며, 화면이 이를 읽어 렌더링합니다.

## 데이터 관점 요약

사용자 하위 컬렉션 중심으로 데이터가 분리됩니다.

```text
users/{uid}                 # 프로필, 접속 기록, 관리자 여부
├─ tasks, taskLogs
├─ routines, routineLogs
├─ categories
└─ monthlyStats             # 월간 집계 캐시

notices/{noticeId}          # 공지 (읽기는 로그인 사용자, 쓰기는 관리자)
```

특히 `monthlyStats`는 월간 화면의 조회 비용을 줄이기 위한 요약 문서입니다.
하루 단위 활동 요약을 월 문서 하나에 모아 두어, 달력과 리포트가 개별 기록을 모두 읽지 않아도 됩니다.

### 접근 통제

이 분리는 관례가 아니라 `firestore.rules` 가 강제합니다.

- 사용자 하위 컬렉션은 본인만 읽고 쓸 수 있습니다.
- `users` 문서의 `isAdmin` 은 클라이언트가 변경할 수 없습니다.
- 규칙에 없는 경로는 전부 차단됩니다.

규칙과 복합 인덱스는 `firestore.rules`, `firestore.indexes.json` 으로 저장소에서 관리하며
배포 시 함께 반영됩니다.

## 기술 구성

- Frontend: `React 19`, `TypeScript`, `Vite`
- Styling: `Tailwind CSS`
- Routing: `react-router-dom`
- State/Data: `@tanstack/react-query`, `React Context`, `zustand`
- Backend: `Firebase Auth`, `Firestore`

## 디자인 시스템

색을 생김새(`black`, `gray-400`)가 아니라 역할(`content`, `muted`, `danger`)로 부릅니다.
토큰은 `src/styles/tokens.css` 에 CSS 변수로 선언되어 있고, Tailwind 가 이를 유틸리티로 만들어 줍니다.

```text
surface / -raised / -sunken                 바탕, 떠 있는 면, 눌린 면
surface-hover / -selected                   마우스를 올린 상태, 고른 상태
content / -muted / -subtle                  본문, 보조 설명, 더 옅은 것
line / line-strong                          구분선, 강조 테두리
primary / accent / danger / warning / success   의미색
on-primary / on-accent / ...                위 색을 배경으로 깔았을 때의 글자색
weekend-sun / weekend-sat                   달력의 일요일·토요일
shadow-popover / -modal / -drag             떠 있는 정도
```

색 값은 눈이 아니라 명암비로 정했습니다. 본문 크기 글자는 배경 대비 4.5:1 이상을 지킵니다.
어두운 화면에서 hover 는 밝아지는 쪽이어야 하므로 `surface-hover` 는 바탕보다 밝고,
`surface-sunken` 은 표 머리글처럼 실제로 눌린 면에만 씁니다. 둘을 섞으면 다크에서 hover 가 보이지 않습니다.
일요일의 빨강은 위험이 아니고 토요일의 파랑은 강조가 아니므로 토큰을 나눠 두었습니다.

다크 테마는 `<html>` 의 `.dark` 에서 **변수 값만 덮어씁니다.**
따라서 화면 코드에 `dark:` 변형을 뿌릴 필요가 없고, `bg-surface` 한 번이면 양쪽 테마가 모두 그려집니다.

색 토큰은 `@theme` 에, 그림자와 카테고리 색은 `:root` 에 있습니다.
Tailwind 가 `@theme` 의 그림자 값을 유틸리티 안에 그대로 박아 넣어 `.dark` 의 값 교체가 닿지 않으므로,
그림자는 `shadow-[var(--shadow-modal)]` 처럼 변수를 참조하는 형태로 씁니다.

테마 선택(라이트/다크/시스템)은 `shared/stores/themeStore.ts` 가 들고 있으며,
첫 페인트 전에 적용해야 흰 화면이 번쩍이지 않으므로 `index.html` 의 인라인 스크립트가 저장된 선택을 먼저 반영합니다.
저장 키는 양쪽이 공유하므로 한쪽을 바꾸면 다른 쪽도 함께 고쳐야 합니다.

### 프리미티브

`shared/ui/primitives` 에 있습니다. 공통점은 **고를 수 있는 값을 스케일로 좁힌다**는 것입니다.

| | 무엇을 정하는가 |
| --- | --- |
| `Text` | 역할별 글자 크기와 색 (`variant`, `tone`) |
| `Button` | 채움 방식 × 의미 × 크기 (`variant`, `tone`, `size`) |
| `Input` `TextArea` | 테두리 방식과 포커스 표시 (`variant`) |
| `Surface` | 면의 높이·여백·모서리 (`level`, `padding`, `radius`) |
| `Stack` | 배치와 간격 (`direction`, `gap`, `align`, `justify`) |

`Stack` 의 기본 방향은 세로이므로 가로로 늘어놓을 때는 `direction="row"` 를 적어야 합니다.
입력 요소의 글자 크기는 16px 아래로 내리지 않습니다. iOS 사파리가 그보다 작은 입력창에 포커스가 가면 화면을 확대합니다.

개발 서버에서 `/dev/ui` 를 열면 토큰과 프리미티브를 라이트/다크로 나란히 확인할 수 있습니다.

### 편집 모달

할 일·카테고리·루틴·공지 모달은 모두 `상세 → 수정` 구조라 같은 조각을 씁니다.

| | 무엇을 맡는가 |
| --- | --- |
| `useDirtyForm` | 값과 처음 값을 함께 들고 있으면서 `isDirty` 와 되돌리기를 제공 |
| `useEditModalExit` | 고치던 것을 버릴 때 상세로 돌아갈지 모달을 닫을지 판단 |
| `UnsavedChangesConfirm` | 저장하지 않고 나갈 때 묻는 확인 모달 (문구 고정) |

세 가지 규칙이 이 조각들에 들어 있습니다.

**dirty 판정은 "저장하면 나갈 값"으로 합니다.** `comparable` 로 저장 페이로드와 같은 모양을 만들어 비교하므로,
제목 뒤 공백처럼 trim 되어 사라질 변경이나 꺼져 있는 시간 값의 변화는 고친 것으로 세지 않습니다.

**저장 버튼은 `isDirty` 로만 막습니다.** 내용이 비었는지 같은 유효성은 눌렀을 때 안내 문구로 알립니다.
비활성 버튼은 왜 막혔는지 말해 주지 못하는데, "아무것도 안 고쳤다"와 달리 "제목이 비었다"는 자명하지 않기 때문입니다.

**확인은 화면이 사라지는 경우에만 묻습니다.** 상세로 돌아가는 "취소"는 원래 값이 눈앞에 남으므로 바로 처리하고,
모달이 닫히는 길(닫기 버튼·ESC·배경 클릭)에서만 확인 모달을 띄웁니다.
이 세 길이 갈라지지 않도록 `ModalWrapper` 에 넘기는 `onClose` 자체를 가드된 함수로 바꿔 한 지점을 지나가게 합니다.

겹쳐 뜬 모달에서 ESC 는 맨 위 것만 닫습니다. `ModalWrapper` 가 문서 순서로 최상단을 골라내며,
이 판단이 없으면 확인 모달과 그 뒤의 편집 모달이 한 번에 함께 닫힙니다.

### 규칙으로 지키는 것

화면 코드가 `bg-white` 나 `text-gray-400` 같은 팔레트 색을 직접 쓰면 그 자리에는 테마가 적용되지 않습니다.
리뷰로 잡기 어려운 종류의 실수라 `eslint.config.js` 의 `no-restricted-syntax` 로 막아 두었습니다.
문자열과 템플릿 리터럴을 모두 보므로 조건부로 붙이는 클래스도 걸립니다.

### 카테고리 색

사용자가 고른 값이 그대로 저장되므로 값을 바꿀 수 없습니다.
대신 그리는 시점에 테마와 자리에 맞는 색을 고릅니다. 함수가 두 개인 이유가 여기 있습니다.

| 함수 | 쓰는 자리 | 기준 |
| --- | --- | --- |
| `getCategoryColor` | 색 선택기의 동그라미 | 고른 색 그대로 보여 준다 |
| `getCategoryTextColor` | 카테고리 이름, 아이콘, 입력창 밑줄 | 흰 배경에서 4.5:1 을 넘긴다 |

노랑을 흰 배경에서 읽히게 하려면 거의 올리브색까지 내려가야 합니다.
한 벌로 합치면 고를 수 있는 팔레트가 통째로 탁해지므로, **고르는 색과 읽는 색을 나눴습니다.**
다크에서는 채움용 값이 이미 6.2:1 이상이라 두 벌이 같은 값을 가리킵니다.

## 프로젝트 구조

```text
src
├─ pages/            # 사용자 화면
│  ├─ legal/         # 개인정보 처리방침·이용약관 (문서 원본 포함)
│  └─ dev/           # 디자인 시스템 갤러리 (개발 빌드에만 포함)
├─ admin/            # 관리자 화면
├─ shared/api/       # 도메인 API 계층
├─ shared/ui/        # 공통 UI
│  └─ primitives/    # Text · Button · Input · Surface · Stack
├─ shared/hooks/     # 공통 훅
├─ shared/stores/    # 앱 전역 상태 (인증, 테마)
├─ shared/contexts/  # 화면 간 공유 상태 (선택 날짜 등)
├─ styles/tokens.css # 디자인 토큰 (라이트·다크 값)
├─ firebase/         # Firebase 초기화
└─ router.tsx        # 라우팅 정의
```

## 로컬 실행

Node.js `^20.19.0` 또는 `>=22.12.0` 이 필요합니다 (Vite 7 요구 사항).

```bash
npm install
cp .env.example .env   # Firebase 설정값을 채워 넣습니다
npm run dev
```

환경변수는 Firebase Console > 프로젝트 설정 > 일반 > 내 앱 에서 확인할 수 있습니다.
이 값들은 클라이언트 번들에 포함되므로 비밀이 아니며, 데이터 접근 통제는 `firestore.rules` 가 담당합니다.

Google 로그인을 쓰려면 Firebase Authentication 에서 Google 제공업체를 켜고,
승인된 도메인에 `localhost` 가 있어야 합니다.

### 명령어

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 검사 후 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 확인 |
| `npm run lint` | ESLint |
| `npm run deploy` | 빌드 후 Firebase 배포 (호스팅·규칙·인덱스) |


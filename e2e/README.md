# E2E 테스트

Playwright 로 실제 화면을 띄워 페이지·기능을 검증한다.
앱은 Firebase 에뮬레이터(auth, firestore)에 붙어 돌아가므로 운영 데이터에 닿지 않는다.

## 실행

준비물: **JDK 21 이상** (firebase-tools 가 에뮬레이터를 띄울 때 요구한다).

```bash
npm run e2e                # 에뮬레이터를 켜고 전체를 돌린 뒤 끈다
npm run e2e:ui             # 에뮬레이터를 켜고 Playwright UI 창을 연다. 창을 닫으면 에뮬레이터도 꺼진다
```

케이스를 골라 돌리기, ID·태그로 거르기, 반복 실행은 UI 창 안에서 한다.

### 클릭으로 테스트 만들기

```bash
npm run e2e:record
```

새 테스트 사용자로 로그인하고 예시 데이터(카테고리·할 일·루틴)를 넣은 홈 화면에서 멈춘다.
함께 뜨는 Playwright Inspector 에서 **Record** 를 누르고 화면을 조작하면 그 조작이 코드로 쌓인다.
코드를 복사해 케이스 설명(`cases/*.md` 형식)과 함께 넘기거나 spec 에 붙인다. 창을 닫으면 끝난다.
녹화한 코드는 `getByRole` 같은 셀렉터를 고르지만 확인(`expect`)은 넣지 않으므로, spec 으로 옮길 때 기대 결과를 더한다.

## CI

`.github/workflows/test.yml` 이 PR 과 main 푸시마다 `npm run check` 와 `npm run e2e` 를 돌린다.
CI 에서는 실패한 테스트를 두 번까지 다시 돌리고, 다시 돌려 통과한 테스트는 실패가 아니라 flaky 로 표시된다.
실패하면 실행 화면의 Artifacts 에서 `playwright-report` 를 내려받아 `npx playwright show-report playwright-report` 로 본다.
화면을 단계별로 되감아 보려면 `npx playwright show-trace <test-results 안의 trace.zip>` 를 쓴다.

## 어떻게 동작하나

| 문제 | 해결 |
| --- | --- |
| Google 팝업 로그인은 자동화할 수 없다 | `vite --mode e2e` 에서만 열리는 `window.__e2eSignIn` 으로 에뮬레이터에 가짜 Google 토큰을 넣는다 (`src/firebase/firebase.ts`). 배포 빌드에는 들어가지 않는다 |
| 운영 데이터 오염 | `.env.e2e` 가 프로젝트를 `demo-checky` 로 덮어쓴다. `demo-` 프로젝트는 에뮬레이터 전용이다 |
| 테스트끼리 데이터가 섞인다 | `signIn()` 이 테스트마다 새 사용자를 만든다. 데이터가 모두 `users/{uid}` 아래에 있어 병렬로 돌려도 서로 보지 못한다 |
| 화면이 조용히 깨진다 | 모든 테스트가 콘솔 에러·처리되지 않은 예외를 모아, 하나라도 있으면 실패한다 (`pageErrors` fixture) |

## 테스트 케이스 추가

**`cases/*.md` 가 기준이고, `specs/` 는 그 구현이다.** 화면 단위로 파일을 나눈다.

```md
### TC-ROUTINE-007 루틴 순서 변경이 기록 화면에 반영된다
- 우선순위: P1 / 태그: @regression
- 상태: 제안 | 확정 | 구현됨
- 전제: 같은 카테고리에 루틴 A, B, C
- 절차: 루틴 화면에서 C 를 맨 위로 끈다 → 기록 화면으로 이동
- 기대: 루틴별 수행 목록이 C, A, B 순서
- 출처: 8fa53e9 (회귀)
```

- **ID** 는 `TC-<화면>-<번호>` 로 정하고, spec 의 테스트 이름 앞에 그대로 쓴다. ID 로 케이스와 코드를 오간다.
- **우선순위**: P1 깨지면 출시 불가 / P2 주요 기능 / P3 그 밖
- **태그**: `@smoke` 화면이 열리는지 / `@regression` 고친 버그의 재발 방지
- **상태**: 코드에서 뽑아 낸 후보는 `제안` 으로 올리고, 사람이 확인한 뒤 `확정` → 구현하면 `구현됨`
- **출처**: 직접 추가, 버그 리포트, 커밋 해시 등 이 케이스가 왜 있는지

## 도구

| 파일 | 쓰임 |
| --- | --- |
| `fixtures.ts` | `test`, `expect` 는 `@playwright/test` 가 아니라 여기서 가져온다 |
| `seed.ts` | 시작 데이터 넣기. `const { seed } = await signIn()` 뒤에 `seed.category(...)`, `seed.routine(...)` 처럼 쓴다 |
| `drag.ts` | 끌어 놓기. `dragTo(page, 집을 것, 놓을 곳)`, 끄는 도중을 확인하려면 `grab()` |
| `emulator.ts` | `inspect.userDoc(uid)`, `inspect.userCollections(uid)`, `inspect.authUserExists(uid)` 관리자 권한으로 에뮬레이터 들여다보기(탈퇴 뒤 데이터 확인 등) |
| `network.ts` | `waitForSaved(page)` 저장이 끝날 때까지 기다리기(새로고침으로 확인하기 전에), `failWrites(page)` 쓰기 실패 흉내 |

```ts
test.use({ today: "2026-10-21" });              // 화면의 오늘을 고정

test("TC-ROUTINE-001 ...", { tag: "@regression" }, async ({ page, signIn }) => {
  const { seed } = await signIn();
  const category = await seed.category({ name: "건강" });
  await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
  await page.goto("/routine");
  // ...
});
```

## 작성 규칙

- 셀렉터는 `getByRole`, `getByLabel`, `getByText` 순으로 쓴다. 잡히지 않는 요소는 테스트에서 우회하지 말고 마크업에 레이블을 붙인다.
  역할도 이름도 없는 요소(끌기 미리보기 같은 그림)에만 `data-testid` 를 단다.
- `signIn()` 은 로그인 전용 화면을 새로 열어 로그인한다. 같은 탭에서 계정을 바꾸는 흐름처럼 새로고침 없이 이어져야 하면 `signIn({ inPlace: true })` 를 쓴다.
- 헤더 메뉴로 화면을 옮긴 직후에는 새 화면이 뜬 것을 먼저 확인한다. 다음 화면 코드를 받는 동안 이전 화면이 그대로 남아 있어, 같은 이름의 요소를 잘못 잡는다.
- 고정 대기(`waitForTimeout`)는 쓰지 않는다. `expect(...).toBeVisible()` 처럼 상태를 기다린다.
- 화면은 저장을 기다리지 않고 먼저 바뀐다. 새로고침이나 다른 화면에서 저장을 확인하려면 먼저 `waitForSaved(page)` 를 부른다.
- 일부러 실패를 일으켜 콘솔 에러가 나는 테스트는 `test.use({ expectedError: /.../ })` 로 그 에러만 허용한다.
- 회귀 케이스를 만들면 고친 코드를 잠시 되돌려 테스트가 실제로 실패하는지 확인한다. 통과만 확인한 테스트는 아무것도 지켜 주지 않을 수 있다.
- 날짜에 따라 결과가 달라지는 화면은 `page.clock` 으로 날짜를 고정한다. 시간대는 설정에서 `Asia/Seoul` 로 고정해 두었다.

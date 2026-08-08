# shared/api

Firestore 접근을 한곳에 모은 계층이다.
화면과 훅은 여기 있는 함수만 부르고, `firebase/firestore` 를 직접 import 하지 않는다.

## 어디부터 보면 되나

**[CATALOG.md](./CATALOG.md) 한 장에 공개 항목이 전부 모여 있다.** 무엇이 있는지 훑을 때는 여기부터 본다.

```bash
npm run api:catalog   # 코드에서 다시 생성한다
```

손으로 적은 목록은 반드시 코드와 어긋나므로 생성해서 쓴다. 직접 고치지 말 것.

특정 도메인을 파고들 때는 이 순서가 빠르다.

1. **`<도메인>/types.ts`** — 이 도메인이 무엇인지
2. **`<도메인>/index.ts`** — 밖에 무엇을 내주는지. 배럴이 곧 공개 API 목록이다
3. **`keys.ts`** — 어떤 캐시가 걸려 있는지. 쓰기를 만들 때 무엇을 무효화할지 여기서 정한다

구현이 궁금하면 그다음에 `crud.ts` 나 `queries.ts` 를 연다.

## 도메인 목록

| 도메인 | 저장 위치 | 하는 일 |
| --- | --- | --- |
| `category` | `users/{uid}/categories` | 분류 |
| `task` | `users/{uid}/tasks` | 날짜가 정해진 할 일 |
| `taskLog` | `users/{uid}/taskLogs` | 할 일 완료 기록 |
| `routine` | `users/{uid}/routines` | 반복 루틴 |
| `routineLog` | `users/{uid}/routineLogs` | 루틴 수행 기록 |
| `monthlyStats` | `users/{uid}/monthlyStats` | 월간 집계 캐시 |
| `taskSetting` | 여러 컬렉션 | 할 일 설정 화면의 복합 동작 |
| `auth` | `users/{uid}` | 로그인, 프로필, 계정 삭제 |

## 파일 역할

도메인 폴더는 아래 골격을 따른다. 필요 없는 파일은 두지 않는다.

| 파일 | 역할 |
| --- | --- |
| `types.ts` | 도메인 타입 |
| `refs.ts` | Firestore 경로. 컬렉션·문서 레퍼런스만 만든다 |
| `queries.ts` | 읽기 |
| `crud.ts` | 쓰기 |
| `order.ts` | 정렬 순서 저장과 과거 데이터 보정 |
| `index.ts` | 배럴. 밖에서 쓸 것만 골라 내보낸다 |

도메인 사정으로 더 두는 파일도 있다.

- `category/invalidate.ts` — 분류 변경이 두 캐시에 걸쳐 있어 무효화를 한곳에 모았다
- `routine/report.ts` — 주간 리포트 집계
- `taskSetting/actions.ts` — 여러 컬렉션을 한 번에 바꾸는 동작이라 `crud` 대신 이 이름을 쓴다

## 공통 (`_common`)

| 파일 | 역할 |
| --- | --- |
| `refs.ts` | `users/{uid}` 하위 경로를 만드는 기반 함수 |
| `mappers.ts` | 문서 스냅샷을 도메인 타입으로 변환 |
| `fetchQueryOnce.ts` | 쿼리 1회 조회 + 취소 함수 반환 |

## 알아 둘 것

**실시간 구독이 없다.** `firebase/firestore/lite` 를 쓰므로 `onSnapshot` 이 존재하지 않는다.
모든 읽기는 1회 조회이고, 화면 갱신은 React Query 캐시 무효화로 처리한다.

**쓰기를 만들면 무효화를 함께 정한다.** 쓰기 함수 자체는 캐시를 건드리지 않는다.
무효화는 호출부(훅)에서 `keys.ts` 의 키로 수행한다. 여기를 빠뜨리면 저장은 되는데 화면이 그대로다.

**읽기 비용이 이름에 드러나지 않는다.** `createTask` 처럼 쓰기 이름을 달고도
순서를 정하려고 먼저 읽는 함수가 있다. 그런 함수에는 읽기·쓰기 횟수를 주석에 적어 두었다.

**복합 인덱스가 필요한 쿼리가 있다.** `firestore.indexes.json` 에 정의되어 있고,
새 쿼리를 추가하면 인덱스도 함께 추가해야 한다. 빠뜨리면 운영에서만 실패한다.

## 새 도메인을 추가할 때

1. `types.ts` 에 타입을 정한다
2. `refs.ts` 에 경로를 만든다 — `_common/refs.ts` 의 `userCollection` / `userDoc` 을 쓴다
3. 읽기는 `queries.ts`, 쓰기는 `crud.ts` 에 넣는다
4. `keys.ts` 에 캐시 키를 추가한다
5. `index.ts` 에서 밖에 쓸 것만 내보낸다
6. 새 쿼리가 복합 조건이면 `firestore.indexes.json` 에 인덱스를 추가한다
7. 새 컬렉션이면 `firestore.rules` 에 접근 규칙을 추가한다 — 규칙에 없는 경로는 전부 차단된다

## 주석 기준

타입 시그니처가 이미 말하는 것은 적지 않는다. 매개변수 이름, 반환 타입은 코드가 설명한다.

적을 값어치가 있는 것은 코드를 다 읽어야 알 수 있는 것들이다.

- 읽기·쓰기 횟수 (Firestore 는 호출 수가 곧 비용이다)
- 다른 컬렉션까지 건드리는 부수 효과
- 필요한 복합 인덱스
- 실패했을 때의 동작 (빈 값인지 예외인지)
- 그렇게 만든 이유

쓸 말이 없으면 주석을 붙이지 않는다.

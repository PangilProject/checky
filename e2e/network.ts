import { expect, type Page, type Request } from "@playwright/test";

/**
 * Firestore 요청 다루기. 앱은 firestore/lite 라 요청이 모두 REST 다.
 * 쓰기는 `documents:commit`, 읽기는 `documents:batchGet`(문서)과 `documents/users/{uid}:runQuery`(목록)로 나간다.
 */
const FIRESTORE = /127\.0\.0\.1:8080\//;
const WRITE = "**/documents:commit*";

const TRANSACTION_READ = "**/documents:batchGet*";

/**
 * 지금부터의 쓰기를 모두 실패시킨다.
 *
 * 트랜잭션을 여는 읽기도 함께 막는다. 열린 트랜잭션의 커밋만 막으면 에뮬레이터가 그 잠금을
 * 한동안 쥐고 있어, 같은 에뮬레이터를 쓰는 다른 테스트의 트랜잭션까지 멈춘다.
 */
export const failWrites = async (page: Page) => {
  await page.route(WRITE, (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.route(TRANSACTION_READ, (route) =>
    route.request().postData()?.includes("newTransaction")
      ? route.fulfill({ status: 500, body: "{}" })
      : route.fallback(),
  );
};

type Watch = { pending: Set<Request>; lastChange: number };
const watches = new WeakMap<Page, Watch>();

/** 진행 중인 Firestore 요청을 모은다. fixtures 가 모든 페이지에 건다 */
export const watchFirestore = (page: Page) => {
  const watch: Watch = { pending: new Set(), lastChange: Date.now() };
  watches.set(page, watch);
  const update = (add: boolean) => (request: Request) => {
    if (!FIRESTORE.test(request.url())) return;
    if (add) watch.pending.add(request);
    else watch.pending.delete(request);
    watch.lastChange = Date.now();
  };
  page.on("request", update(true));
  page.on("requestfinished", update(false));
  page.on("requestfailed", update(false));
};

/**
 * 진행 중인 Firestore 요청이 모두 끝나고 잠시 조용해질 때까지 기다린다.
 *
 * 화면은 낙관적으로 먼저 바뀌므로, 새로고침이나 화면 이동으로 저장을 확인하려면 실제 쓰기가 끝나야 한다.
 * 쓰기 하나가 끝나면 이어서 집계를 고치는 쓰기가 나가기도 해 조용한 시간을 둔다.
 */
export const waitForSaved = async (page: Page, quietMs = 300) => {
  const watch = watches.get(page);
  if (!watch) throw new Error("watchFirestore 가 걸리지 않은 페이지입니다");
  await expect
    .poll(
      () =>
        watch.pending.size === 0 && Date.now() - watch.lastChange >= quietMs
          ? "끝남"
          : [...watch.pending].map((request) => request.url().split("/").pop()),
      { message: "Firestore 요청이 끝나지 않았습니다" },
    )
    .toBe("끝남");
};

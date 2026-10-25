/**
 * 테스트가 쓰는 Firebase 에뮬레이터 주소와 초기화 요청.
 *
 * 주소는 firebase.json 의 emulators, 프로젝트 ID 는 .env.e2e 와 맞춰야 한다.
 */
export const PROJECT_ID = "demo-checky";
export const AUTH_EMULATOR = "http://127.0.0.1:9099";
export const FIRESTORE_EMULATOR = "http://127.0.0.1:8080";

const clearEndpoints = [
  `${FIRESTORE_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
  `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`,
];

/** 에뮬레이터의 문서와 계정을 모두 지운다. 에뮬레이터가 꺼져 있으면 어떻게 켜는지 알려 준다. */
export const clearEmulators = async () => {
  for (const url of clearEndpoints) {
    const response = await fetch(url, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      throw new Error(
        `에뮬레이터에 닿지 않습니다 (${new URL(url).host}). ` +
          "`npm run e2e` 나 `npm run e2e:ui` 로 실행하세요.",
      );
    }
  }
};

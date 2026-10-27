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

const OWNER = { Authorization: "Bearer owner", "Content-Type": "application/json" };
const DOCUMENTS = `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * 관리자 권한으로 에뮬레이터를 들여다본다. 화면으로는 알 수 없는 것
 * (탈퇴 뒤 데이터가 정말 지워졌는지, 프로필 문서가 만들어졌는지)을 확인할 때 쓴다.
 * 보안 규칙을 건너뛰므로 앱이 할 수 있는 일을 확인하는 용도로는 쓰지 않는다.
 */
export const inspect = {
  /** users/{uid} 문서의 필드. 없으면 null */
  userDoc: async (uid: string) => {
    const response = await fetch(`${DOCUMENTS}/users/${uid}`, { headers: OWNER });
    if (response.status === 404) return null;
    const body = (await response.json()) as { fields?: Record<string, unknown> };
    return body.fields ?? {};
  },

  /** 그 달의 월간 통계 문서가 있는지 */
  monthlyStatsExists: async (uid: string, month: string) => {
    const response = await fetch(`${DOCUMENTS}/users/${uid}/monthlyStats/${month}`, { headers: OWNER });
    return response.ok;
  },

  /** users/{uid} 아래에 문서가 하나라도 남은 하위 컬렉션 이름 */
  userCollections: async (uid: string) => {
    const response = await fetch(`${DOCUMENTS}/users/${uid}:listCollectionIds`, {
      method: "POST",
      headers: OWNER,
      body: "{}",
    });
    const body = (await response.json()) as { collectionIds?: string[] };
    return body.collectionIds ?? [];
  },

  /** Auth 에뮬레이터에 그 계정이 있는지 */
  authUserExists: async (uid: string) => {
    const response = await fetch(
      `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup`,
      { method: "POST", headers: OWNER, body: JSON.stringify({ localId: [uid] }) },
    );
    const body = (await response.json()) as { users?: unknown[] };
    return (body.users?.length ?? 0) > 0;
  },
};

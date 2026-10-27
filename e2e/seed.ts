import { FIRESTORE_EMULATOR, PROJECT_ID } from "./emulator";

/**
 * 테스트 시작 상태를 에뮬레이터에 바로 써 넣는다.
 *
 * 화면을 눌러 만들면 느리고, 준비 단계가 깨져도 검증하려던 기능이 깨진 것처럼 보인다.
 * 보안 규칙을 끄고 쓰므로 문서 모양은 앱의 저장 코드(src/shared/api/<도메인>/crud.ts)와 맞춰야 한다.
 *
 * Firebase SDK 대신 에뮬레이터 REST API 를 쓴다. SDK 가 끌고 오는 gRPC 가
 * Playwright 프로세스 안에서 모듈 로딩 에러를 내기 때문이다.
 * `Bearer owner` 는 에뮬레이터가 보안 규칙을 건너뛰게 하는 관리자 토큰이다.
 */

export type Seeder = ReturnType<typeof createSeeder>;

let nextId = 0;
const newId = (prefix: string) => `${prefix}-${++nextId}`;

type FirestoreValue = Record<string, unknown>;

/** JS 값을 Firestore REST 의 값 형식으로 바꾼다 */
const toValue = (value: unknown): FirestoreValue => {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  switch (typeof value) {
    case "string":
      return { stringValue: value };
    case "boolean":
      return { booleanValue: value };
    case "number":
      return Number.isInteger(value)
        ? { integerValue: String(value) }
        : { doubleValue: value };
    case "object":
      return { mapValue: { fields: toFields(value as Record<string, unknown>) } };
    default:
      throw new Error(`시드에 넣을 수 없는 값입니다: ${String(value)}`);
  }
};

const toFields = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toValue(value)]));

export const createSeeder = (uid: string) => {
  const write = async (collection: string, id: string, data: Record<string, unknown>) => {
    const path = `users/${uid}/${collection}/${id}`;
    const response = await fetch(
      `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
      {
        method: "PATCH",
        headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
        body: JSON.stringify({ fields: toFields(data) }),
      },
    );
    if (!response.ok) {
      throw new Error(`시드 실패 (${path}): ${response.status} ${await response.text()}`);
    }
  };

  return {
    category: async ({
      name,
      color = "#6155F5",
      orderIndex = 0,
    }: {
      name: string;
      color?: string;
      orderIndex?: number;
    }) => {
      const id = newId("category");
      const now = new Date();
      await write("categories", id, {
        name,
        color,
        status: "ACTIVE",
        orderIndex,
        createdAt: now,
        updatedAt: now,
      });
      return { id, color };
    },

    /** days 는 0(일)~6(토). 기본은 매일 */
    routine: async ({
      title,
      categoryId,
      orderIndex,
      startDate,
      days = [0, 1, 2, 3, 4, 5, 6],
    }: {
      title: string;
      categoryId: string;
      orderIndex: number;
      startDate: string;
      days?: number[];
    }) => {
      const id = newId("routine");
      await write("routines", id, {
        title,
        categoryId,
        days,
        scheduleHistory: [{ effectiveFrom: startDate, days }],
        startDate,
        orderIndex,
        status: "ACTIVE",
        createdAt: new Date(),
      });
      return { id };
    },

    task: async ({
      title,
      category,
      date,
      orderIndex = 0,
    }: {
      title: string;
      category: { id: string; color: string };
      date: string;
      orderIndex?: number;
    }) => {
      const id = newId("task");
      const now = new Date();
      await write("tasks", id, {
        title,
        categoryId: category.id,
        categoryColor: category.color,
        date,
        orderIndex,
        createdAt: now,
        updatedAt: now,
      });
      return { id };
    },

    /** 루틴을 그날 했는지. 문서 ID 는 앱과 같이 `{routineId}_{date}` 로 둔다 */
    routineLog: async ({
      routineId,
      date,
      done,
    }: {
      routineId: string;
      date: string;
      done: boolean;
    }) => {
      await write("routineLogs", `${routineId}_${date}`, {
        routineId,
        date,
        done,
        updatedAt: new Date(),
      });
    },

    /** 문서 ID 는 앱과 같이 `{taskId}_{date}` 로 둔다 */
    taskLog: async ({
      taskId,
      date,
      completed,
    }: {
      taskId: string;
      date: string;
      completed: boolean;
    }) => {
      await write("taskLogs", `${taskId}_${date}`, {
        taskId,
        date,
        completed,
        updatedAt: new Date(),
      });
    },
  };
};

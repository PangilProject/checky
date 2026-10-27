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

/** 경로에 문서 하나를 통째로 쓴다. 보안 규칙을 건너뛴다 */
const writeDoc = async (path: string, data: Record<string, unknown>) => {
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

/**
 * 공지. 사용자 아래가 아니라 모든 사용자가 함께 보는 최상위 컬렉션에 쓴다.
 * 병렬로 도는 다른 테스트에도 보이므로 제목에 고유한 값을 넣어 구분한다.
 */
export const seedNotice = async ({
  title,
  content = "",
  pinned = false,
  createdAt = new Date(),
}: {
  title: string;
  content?: string;
  pinned?: boolean;
  createdAt?: Date;
}) => {
  const id = `notice-${randomSuffix()}`;
  await writeDoc(`notices/${id}`, { title, content, pinned, createdAt });
  return { id };
};

const randomSuffix = () => Math.random().toString(36).slice(2, 10);

export const createSeeder = (uid: string) => {
  const write = (collection: string, id: string, data: Record<string, unknown>) =>
    writeDoc(`users/${uid}/${collection}/${id}`, data);

  return {
    /** ended 를 넘기면 그날 종료한 카테고리가 된다 */
    category: async ({
      name,
      color = "#6155F5",
      orderIndex = 0,
      ended,
    }: {
      name: string;
      color?: string;
      orderIndex?: number;
      ended?: Date;
    }) => {
      const id = newId("category");
      const now = new Date();
      await write("categories", id, {
        name,
        color,
        status: ended ? "ENDED" : "ACTIVE",
        orderIndex,
        createdAt: now,
        updatedAt: now,
        ...(ended && { endedAt: ended }),
      });
      return { id, color };
    },

    /**
     * days 는 0(일)~6(토). 기본은 매일.
     * scheduleHistory 를 넘기면 요일을 바꿔 온 이력이 된다. 마지막 구간의 요일이 지금 요일(days)이다.
     */
    routine: async ({
      title,
      categoryId,
      orderIndex,
      startDate,
      days = [0, 1, 2, 3, 4, 5, 6],
      endDate,
      scheduleHistory,
    }: {
      title: string;
      categoryId: string;
      orderIndex: number;
      startDate: string;
      days?: number[];
      endDate?: string;
      scheduleHistory?: { effectiveFrom: string; days: number[] }[];
    }) => {
      const id = newId("routine");
      const history = scheduleHistory ?? [{ effectiveFrom: startDate, days }];
      await write("routines", id, {
        title,
        categoryId,
        days: history[history.length - 1].days,
        scheduleHistory: history,
        startDate,
        ...(endDate && { endDate }),
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
      time,
    }: {
      title: string;
      category: { id: string; color: string };
      date: string;
      orderIndex?: number;
      /** "HH:mm" */
      time?: string;
    }) => {
      const id = newId("task");
      const now = new Date();
      await write("tasks", id, {
        title,
        categoryId: category.id,
        categoryColor: category.color,
        date,
        ...(time && { time }),
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

    /**
     * 한 달의 월간 통계 문서. days 의 키는 "01"~"31".
     * 문서가 없는 달은 홈이 원본에서 세어 만들므로, 이미 있는 상태나 옛 문서(version 1)를 재현할 때만 쓴다.
     */
    monthlyStats: async ({
      month,
      days,
      version = 2,
    }: {
      month: string;
      days: Record<
        string,
        {
          total: number;
          completed: number;
          remaining: number;
          taskTotal?: number;
          taskCompleted?: number;
          routineTotal?: number;
          routineCompleted?: number;
        }
      >;
      version?: number;
    }) => {
      const withActivity = Object.fromEntries(
        Object.entries(days).map(([day, value]) => [day, { ...value, hasActivity: value.total > 0 }]),
      );
      await write("monthlyStats", month, {
        month,
        days: withActivity,
        version,
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

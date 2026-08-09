import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";

vi.mock("@/firebase/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore/lite", () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
}));

const { getDoc, setDoc } = await import("firebase/firestore/lite");
const { ensureUserProfile } = await import("./user");

const mockUser = {
  uid: "new-user",
  email: "new@example.com",
  displayName: "새 사용자",
  photoURL: null,
} as User;

const resolveDoc = (exists: boolean) =>
  vi.mocked(getDoc).mockResolvedValue({
    exists: () => exists,
  } as never);

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * 프로필 문서 보장은 로그인 함수와 인증 구독 두 곳에서 불린다.
 * 없으면 반드시 만들고, 있으면 건드리지 않으며, 두 곳이 동시에 불러도
 * 생성이 두 번 일어나지 않아야 한다.
 */
describe("ensureUserProfile", () => {
  it("문서가 없으면 만든다", async () => {
    resolveDoc(false);

    const result = await ensureUserProfile(mockUser);

    expect(result.created).toBe(true);
    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  it("문서가 있으면 만들지 않는다", async () => {
    resolveDoc(true);

    const result = await ensureUserProfile(mockUser);

    expect(result.created).toBe(false);
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("두 곳에서 동시에 불러도 한 번만 만든다", async () => {
    resolveDoc(false);

    // 로그인 함수와 인증 구독이 같은 순간에 부르는 상황
    const [first, second] = await Promise.all([
      ensureUserProfile(mockUser),
      ensureUserProfile(mockUser),
    ]);

    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(first.created).toBe(true);
    expect(second.created).toBe(true);
  });

  it("앞선 시도가 끝난 뒤에는 다시 확인한다", async () => {
    resolveDoc(false);
    await ensureUserProfile(mockUser);

    // 생성이 실패해 여전히 없는 상태로 다음 접속에 다시 불린 경우
    resolveDoc(false);
    await ensureUserProfile(mockUser);

    expect(getDoc).toHaveBeenCalledTimes(2);
    expect(setDoc).toHaveBeenCalledTimes(2);
  });

  it("생성이 실패하면 진행 중 표시를 남기지 않는다", async () => {
    resolveDoc(false);
    vi.mocked(setDoc).mockRejectedValueOnce(new Error("network"));

    await expect(ensureUserProfile(mockUser)).rejects.toThrow();

    // 실패가 캐시되면 다음 접속의 복구 시도까지 막힌다
    resolveDoc(false);
    vi.mocked(setDoc).mockResolvedValueOnce(undefined);
    const retry = await ensureUserProfile(mockUser);

    expect(retry.created).toBe(true);
  });
});

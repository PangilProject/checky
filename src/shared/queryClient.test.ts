import { QueryObserver } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { createQueryClient } from "./queryClient";

/**
 * 앱 캐시 정책이 지켜야 하는 두 가지를 함께 고정한다.
 *
 * 1. 다른 화면에서 만든 변경이 돌아왔을 때 보인다 (정확성)
 * 2. 그냥 왔다 갔다 하는 것만으로는 다시 읽지 않는다 (비용)
 *
 * 한쪽만 보면 반대쪽이 조용히 깨진다. 실제로 refetchOnMount 를 끄면서
 * 비용은 지켰지만 1번이 깨져, 루틴 페이지에서 만든 루틴이 홈에 나타나지 않았다.
 */
const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

/** 화면 진입 — 쿼리를 구독하고 구독 해지 함수를 돌려준다 */
const enterScreen = (
  client: ReturnType<typeof createQueryClient>,
  options: { queryKey: string[]; queryFn: () => Promise<unknown> },
) => {
  const observer = new QueryObserver(client, options);
  return observer.subscribe(() => {});
};

describe("앱 캐시 정책", () => {
  it("다른 화면에서 무효화된 쿼리는 돌아왔을 때 다시 읽는다", async () => {
    const client = createQueryClient();
    const queryFn = vi.fn().mockResolvedValue(["데이터"]);
    const options = { queryKey: ["routineReport"], queryFn };

    // 홈 진입 → 최초 조회
    const leaveHome = enterScreen(client, options);
    await tick();
    expect(queryFn).toHaveBeenCalledTimes(1);

    // 루틴 페이지로 이동 (홈 언마운트 → 쿼리 비활성)
    leaveHome();

    // 루틴 생성 후 무효화. 비활성이라 이 시점에는 다시 읽지 않는다.
    await client.invalidateQueries({ queryKey: ["routineReport"] });
    expect(queryFn).toHaveBeenCalledTimes(1);

    // 홈 복귀 → 낡음 표시를 여기서 실행해야 새 루틴이 보인다
    enterScreen(client, options);
    await tick();
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it("무효화가 없으면 화면을 오가도 다시 읽지 않는다", async () => {
    const client = createQueryClient();
    const queryFn = vi.fn().mockResolvedValue(["데이터"]);
    const options = { queryKey: ["routineReport"], queryFn };

    const leaveHome = enterScreen(client, options);
    await tick();
    leaveHome();

    // staleTime 안에서는 재진입해도 조회가 늘지 않아야 한다
    enterScreen(client, options);
    await tick();
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("창 포커스만으로는 다시 읽지 않는다", async () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it("실패한 쿼리를 여러 번 재시도하지 않는다", async () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.retry).toBe(1);
  });
});

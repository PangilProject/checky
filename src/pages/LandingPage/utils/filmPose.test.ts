import { describe, expect, it } from "vitest";
import { fillKeys, resolveKey, resolveTrack, samplePose, type AnchorMap } from "./filmPose";
import { EASE } from "./timelineMath";

const stage = { w: 1000, h: 800 };
const anchors: AnchorMap = {
  a: { box: { left: 100, top: 100, w: 200, h: 40 }, fitted: { left: 0, top: 0, w: 100, h: 20, k: 0.5 } },
  b: { box: { left: 500, top: 400, w: 100, h: 20 } },
};

describe("fillKeys", () => {
  it("적지 않은 값은 앞 자세에서 이어받는다", () => {
    const [first, second] = fillKeys([
      { t: 0, frame: "a", anchor: "box", o: 0.5, dx: 0.1 },
      { t: 10 },
    ]);
    expect(first).toMatchObject({ s: 1, o: 0.5, dx: 0.1 });
    expect(second).toMatchObject({ frame: "a", anchor: "box", o: 0.5, dx: 0.1 });
  });

  it("가속은 이어받지 않는다 — 구간마다 다르다", () => {
    const [, second] = fillKeys([{ t: 0, ease: EASE.linear }, { t: 1 }]);
    expect(second.ease).toBe(EASE.inOut);
  });
});

describe("resolveKey", () => {
  const key = (extra = {}) => fillKeys([{ t: 0, frame: "a", anchor: "box", ...extra }])[0];

  it("width 는 표식 폭에 맞춰 배율을 정하고, 표식 가운데에 둔다", () => {
    const pose = resolveKey(key(), { fit: "width" }, anchors, { w: 100, h: 20 }, stage);
    expect(pose).toMatchObject({ x: 200, y: 120, s: 2 });
  });

  it("left 는 표식의 왼쪽 끝을 가리킨다 — 글자 수가 바뀌어도 흔들리지 않는다", () => {
    const pose = resolveKey(key(), { fit: "height", origin: "left" }, anchors, { w: 50, h: 20 }, stage);
    expect(pose).toMatchObject({ x: 100, s: 2 });
  });

  it("box 는 표식 크기를 그대로 갖고 sw/sh 로 한 변만 바꿀 수 있다", () => {
    const pose = resolveKey(key({ sw: 0.5, sh: 0.1 }), { fit: "box" }, anchors, { w: 1, h: 1 }, stage);
    expect(pose).toMatchObject({ w: 100, h: 4, s: 1 });
  });

  it("sub 는 표식 안의 작은 정사각형을 가리킨다", () => {
    const pose = resolveKey(key({ sub: { left: 0.5, top: 0, size: 0.5 } }), { fit: "width" }, anchors, { w: 100, h: 100 }, stage);
    expect(pose).toMatchObject({ x: 250, w: 100 });
  });

  it("줄어든 화면 안의 글자 상자는 원래 크기로 두고 같은 비율로 줄인다", () => {
    const pose = resolveKey(
      fillKeys([{ t: 0, frame: "a", anchor: "fitted" }])[0],
      { fit: "box", content: true },
      anchors,
      { w: 1, h: 1 },
      stage,
    );
    expect(pose).toMatchObject({ w: 200, h: 40, s: 0.5 });
  });

  it("표식이 없으면 무대 가운데로 둔다", () => {
    const pose = resolveKey(fillKeys([{ t: 0, frame: "a", anchor: "missing" }])[0], { fit: "none" }, anchors, { w: 10, h: 10 }, stage);
    expect(pose).toMatchObject({ x: 500, y: 400 });
  });
});

describe("samplePose", () => {
  const keys = resolveTrack(
    {
      id: "x",
      fit: "none",
      keys: [
        { t: 10, frame: "a", anchor: "box", o: 0 },
        { t: 20, frame: "b", anchor: "box", o: 1, ease: EASE.linear },
      ],
    },
    anchors,
    { w: 10, h: 10 },
    stage,
  );

  it("첫 자세 앞과 마지막 자세 뒤에서는 끝 자세에 머문다", () => {
    expect(samplePose(keys, 0)).toEqual(keys[0].pose);
    expect(samplePose(keys, 99)).toEqual(keys[1].pose);
  });

  it("사이에서는 두 자세를 섞는다 — 위로 되감아도 같은 값이 나온다", () => {
    const middle = samplePose(keys, 15);
    expect(middle.x).toBeCloseTo(375);
    expect(middle.o).toBeCloseTo(0.5);
    expect(samplePose(keys, 15)).toEqual(middle);
  });
});

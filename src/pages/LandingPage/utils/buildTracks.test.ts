import { describe, expect, it } from "vitest";
import { TIMELINE_LENGTH } from "../constants/scenes";
import { buildCameraTrack, buildTracks } from "./buildTracks";

describe("buildTracks", () => {
  for (const wide of [false, true]) {
    const tracks = buildTracks({ wide });

    it(`배우 이름이 겹치지 않는다 (wide=${wide})`, () => {
      const ids = tracks.map((track) => track.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it(`모든 자세가 타임라인 안에 있다 (wide=${wide})`, () => {
      for (const track of [...tracks, buildCameraTrack({ wide })]) {
        for (const key of track.keys) {
          expect(key.t, track.id).toBeGreaterThanOrEqual(0);
          expect(key.t, track.id).toBeLessThanOrEqual(TIMELINE_LENGTH);
        }
      }
    });

    it(`자세는 시간 순서로 적혀 있다 (wide=${wide})`, () => {
      for (const track of tracks) {
        const times = track.keys.map((key) => key.t);
        expect(times, track.id).toEqual([...times].sort((a, b) => a - b));
      }
    });
  }

  it("휴대폰 테두리는 넓은 화면에서만 나온다", () => {
    expect(buildTracks({ wide: false }).some((track) => track.id === "phone")).toBe(false);
    expect(buildTracks({ wide: true }).some((track) => track.id === "phone")).toBe(true);
  });
});

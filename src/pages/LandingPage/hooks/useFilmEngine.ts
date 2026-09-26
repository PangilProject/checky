import { useLayoutEffect, useRef, type RefObject } from "react";
import { applyToDocument, useThemeStore } from "@/shared/stores/themeStore";
import { TIMELINE_LENGTH } from "../constants/scenes";
import { buildCameraTrack, buildTracks } from "../utils/buildTracks";
import { createFilmEffects, parseRgb } from "../utils/filmEffects";
import {
  resolveTrack,
  samplePose,
  type AnchorMap,
  type Origin,
  type Pose,
  type ResolvedKey,
  type Size,
} from "../utils/filmPose";
import { clamp, damp } from "../utils/timelineMath";

/** 스크롤을 따라가는 속도. 작을수록 바로 붙는다 */
const FOLLOW_SECONDS = 0.11;
/** 한 번에 크게 스크롤해도 이만큼만 뒤처진다 (화면 높이의 %) */
const MAX_LAG = 120;
/** 넓은 화면 기준 (Tailwind md) */
const WIDE_MIN = 768;

interface ActorBinding {
  element: HTMLElement;
  keys: ResolvedKey[];
  natural: Size;
  box: boolean;
  origin: Origin;
  hidden: boolean;
  last: string;
}

/** 필름 무대 안에서 요소의 위치를 무대 기준으로 잰다 */
const measureAnchors = (stage: HTMLElement, measure: HTMLElement): AnchorMap => {
  const base = stage.getBoundingClientRect();
  const anchors: AnchorMap = {};
  measure.querySelectorAll<HTMLElement>("[data-frame]").forEach((frame) => {
    const map: AnchorMap[string] = {};
    frame.querySelectorAll<HTMLElement>("[data-anchor]").forEach((anchor) => {
      const rect = anchor.getBoundingClientRect();
      const fit = anchor.closest<HTMLElement>("[data-fit]");
      map[anchor.dataset.anchor!] = {
        left: rect.left - base.left,
        top: rect.top - base.top,
        w: rect.width,
        h: rect.height,
        k: Number(fit?.dataset.fitScale ?? 1),
      };
    });
    anchors[frame.dataset.frame!] = map;
  });
  return anchors;
};

/**
 * 무대보다 크게 그려지는 앱 화면은 무대에 맞춰 줄인다 (낮은 화면, 가로로 든 휴대폰, 아주 좁은 화면).
 * 줄인 뒤에 재므로 필름의 배우도 같은 비율로 작아진다.
 */
const fitFrames = (measure: HTMLElement) => {
  measure.querySelectorAll<HTMLElement>("[data-fit]").forEach((element) => {
    element.style.transform = "";
    element.dataset.fitScale = "1";
    const parent = element.parentElement!;
    const padding = parseFloat(getComputedStyle(parent).paddingTop) || 0;
    const available = parent.clientHeight - padding;
    // 320px 처럼 좁은 화면에서는 주간 표가 폭을 넘으므로 폭도 함께 본다
    const scale = Math.min(
      1,
      available / Math.max(element.scrollHeight, 1),
      element.clientWidth / Math.max(element.scrollWidth, 1),
    );
    if (scale < 1) {
      element.style.transform = `scale(${scale.toFixed(4)})`;
      element.dataset.fitScale = scale.toFixed(4);
    }
  });
};

/** 라이트·다크 바탕색을 토큰에서 읽는다. 필름은 둘 사이를 섞어 밤과 낮을 칠한다 */
const readSurfaces = () => {
  const probe = (dark: boolean) => {
    const element = document.createElement("div");
    element.className = dark ? "dark bg-surface" : "bg-surface";
    document.body.appendChild(element);
    const color = getComputedStyle(element).backgroundColor;
    element.remove();
    return parseRgb(color);
  };
  return { light: probe(false), dark: probe(true) };
};

const ORIGIN_CSS: Record<Origin, string> = {
  center: "50% 50%",
  left: "0 50%",
  right: "100% 50%",
};

const applyPose = (binding: ActorBinding, pose: Pose) => {
  const { element } = binding;
  const opacity = clamp(pose.o);
  if (opacity < 0.004) {
    if (!binding.hidden) {
      element.style.visibility = "hidden";
      binding.hidden = true;
    }
    return;
  }
  if (binding.hidden) {
    element.style.visibility = "visible";
    binding.hidden = false;
  }

  const width = binding.box ? pose.w : binding.natural.w;
  const height = binding.box ? pose.h : binding.natural.h;
  const left =
    binding.origin === "left" ? pose.x : binding.origin === "right" ? pose.x - width : pose.x - width / 2;
  const top = pose.y - height / 2;
  const scale = binding.box && pose.s === 1 ? "" : ` scale(${pose.s.toFixed(4)})`;
  const rotate = pose.r ? ` rotate(${pose.r.toFixed(2)}deg)` : "";
  const transform = `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0)${rotate}${scale}`;
  const size = binding.box ? `${width.toFixed(1)}x${height.toFixed(1)}` : "";
  const next = `${transform}|${opacity.toFixed(3)}|${size}`;
  if (next === binding.last) return;
  binding.last = next;

  element.style.transform = transform;
  element.style.opacity = opacity.toFixed(3);
  if (binding.box) {
    // 소수점을 버리면 글자가 든 상자에서 한 줄이 더 생긴다
    element.style.width = `${Math.ceil(width * 10) / 10}px`;
    element.style.height = `${Math.ceil(height * 10) / 10}px`;
  }
};

interface FilmEngineRefs {
  /** 스크롤 길이를 가진 바깥 상자 */
  scroller: RefObject<HTMLElement | null>;
  /** 배우를 재는 기준이 되는 무대 (화면 높이만큼) */
  stage: RefObject<HTMLElement | null>;
  /** 밤낮의 바탕을 칠하는 곳 */
  backdrop: RefObject<HTMLElement | null>;
  /** 장면 프레임을 겹쳐 둔 측정용 층 */
  measure: RefObject<HTMLElement | null>;
  /** 카메라가 움직이는 층 */
  world: RefObject<HTMLElement | null>;
  progress: RefObject<HTMLElement | null>;
  userChecked: RefObject<boolean>;
}

/**
 * 스크롤 → 시점 → 배우의 자세 → DOM.
 *
 * 스크롤 이벤트에서는 목표 시점만 바꾸고, 실제 그리기는 requestAnimationFrame 한 곳에서 한다.
 * 목표에 닿으면 루프를 멈춰, 스크롤하지 않는 동안에는 아무것도 계산하지 않는다.
 * React 는 배우를 한 번 그릴 뿐 매 프레임 다시 그리지 않는다.
 *
 * 돌려주는 seek 는 진행 표시에서 장면으로 건너뛸 때 쓴다. render 는 스크롤 없이 내용만 바뀌었을 때
 * (직접 체크했을 때) 지금 시점을 다시 그린다.
 */
export function useFilmEngine(refs: FilmEngineRefs) {
  const controls = useRef<{ seek: (time: number) => void; render: () => void }>({
    seek: () => {},
    render: () => {},
  });

  useLayoutEffect(() => {
    const scroller = refs.scroller.current;
    const stage = refs.stage.current;
    const backdrop = refs.backdrop.current;
    const measure = refs.measure.current;
    const world = refs.world.current;
    if (!scroller || !stage || !backdrop || !measure || !world) return;

    const root = document.documentElement;
    const visitorPrefersDark = useThemeStore.getState().resolved === "dark";
    // 필름이 테마를 직접 칠하는 동안에는 방문자의 테마를 잠시 걷어 둔다. 떠날 때 되돌린다
    root.classList.remove("dark");
    const surface = readSurfaces();

    const effects = createFilmEffects(scroller, {
      userChecked: () => refs.userChecked.current,
      visitorPrefersDark,
      surface,
      stage: backdrop,
      progress: refs.progress.current,
      onNightChange: (isDark) => root.classList.toggle("dark", isDark),
    });

    let bindings: ActorBinding[] = [];
    let camera: ResolvedKey[] = [];
    let unit = 1;
    let top = 0;
    let current = 0;
    let target = 0;
    let frame = 0;
    let lastTimestamp = 0;

    const render = (time: number) => {
      for (const binding of bindings) applyPose(binding, samplePose(binding.keys, time));
      const view = samplePose(camera, time);
      world.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s.toFixed(4)}) translate3d(${-view.x}px, ${-view.y}px, 0)`;
      effects(time);
    };

    const readTarget = () =>
      clamp((window.scrollY - top) / unit, 0, TIMELINE_LENGTH);

    const layout = () => {
      const size = { w: stage.clientWidth, h: stage.clientHeight };
      unit = size.h / 100;
      top = scroller.getBoundingClientRect().top + window.scrollY;

      fitFrames(measure);
      const anchors = measureAnchors(stage, measure);
      const wide = size.w >= WIDE_MIN;
      const tracks = buildTracks({ wide });
      const used = new Set(tracks.map((track) => track.id));

      scroller.querySelectorAll<HTMLElement>("[data-actor]").forEach((element) => {
        // 이 화면 폭에서 쓰지 않는 배우(좁은 화면의 휴대폰 테두리 등)는 숨겨 둔다
        if (!used.has(element.dataset.actor!)) element.style.visibility = "hidden";
      });

      bindings = tracks.flatMap((track) => {
        const element = scroller.querySelector<HTMLElement>(`[data-actor="${CSS.escape(track.id)}"]`);
        if (!element) {
          if (import.meta.env.DEV) console.warn(`[landing] 배우가 없습니다: ${track.id}`);
          return [];
        }
        const origin = track.origin ?? "center";
        element.style.transformOrigin = ORIGIN_CSS[origin];
        const natural = { w: element.offsetWidth, h: element.offsetHeight };
        return [
          {
            element,
            keys: resolveTrack(track, anchors, natural, size),
            natural,
            box: track.fit === "box",
            origin,
            hidden: true,
            last: "",
          },
        ];
      });
      camera = resolveTrack(buildCameraTrack({ wide }), anchors, { w: 0, h: 0 }, size);

      current = target = readTarget();
      render(current);
    };

    const tick = (timestamp: number) => {
      const seconds = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      if (Math.abs(target - current) > MAX_LAG) current = target - Math.sign(target - current) * MAX_LAG;
      current = damp(current, target, FOLLOW_SECONDS, seconds);
      if (Math.abs(target - current) < 0.02) current = target;
      render(current);
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readTarget();
      if (!frame) {
        lastTimestamp = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    // 무대 크기가 바뀔 때만 다시 잰다. 무대는 svh 라 모바일 주소창이 오르내려도 바뀌지 않는다
    let lastSize = "";
    const observer = new ResizeObserver(() => {
      const next = `${stage.clientWidth}x${stage.clientHeight}`;
      if (next === lastSize) return;
      lastSize = next;
      layout();
    });
    observer.observe(stage);
    void document.fonts?.ready.then(() => layout());
    window.addEventListener("scroll", onScroll, { passive: true });

    controls.current = {
      seek: (time) => window.scrollTo({ top: top + time * unit, behavior: "smooth" }),
      render: () => render(current),
    };
    if (import.meta.env.DEV) {
      (window as unknown as { __film__?: unknown }).__film__ = {
        get unit() {
          return unit;
        },
        get top() {
          return top;
        },
      };
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      applyToDocument(useThemeStore.getState().resolved);
    };
  }, [refs]);

  return controls;
}

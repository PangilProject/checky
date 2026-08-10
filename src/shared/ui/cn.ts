import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스 문자열을 합친다.
 *
 * Tailwind 에서 같은 속성의 유틸리티가 둘 다 남으면
 * 승자는 문자열 순서가 아니라 스타일시트에 정의된 순서로 갈린다.
 * 그래서 `${className} text-xs` 처럼 이어 붙이면 호출부의 재정의가 먹을 때도,
 * 안 먹을 때도 있다. twMerge 는 뒤에 온 것만 남겨 그 불확실성을 없앤다.
 *
 * 규칙: 기본 클래스를 앞에, 호출부에서 받은 className 을 마지막에 둔다.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

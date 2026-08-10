/**
 * 카테고리 색 팔레트.
 *
 * value 는 Firestore 에 그대로 저장되는 값이므로 바꾸면 기존 카테고리의 색이 끊긴다.
 * 화면에 실제로 칠해지는 색은 아래 getCategoryColor 가 테마에 맞춰 골라 준다.
 */
export const COLORS = [
  { name: "red", value: "#FF393C" },
  { name: "orange", value: "#FF8D28" },
  { name: "yellow", value: "#FFCC02" },
  { name: "green", value: "#35C759" },
  { name: "mint", value: "#00C8B3" },
  { name: "blue", value: "#0088FF" },
  { name: "indigo", value: "#6155F5" },
  { name: "purple", value: "#CB30E0" },
  { name: "pink", value: "#F2C555" },
  { name: "brown", value: "#AC7F5E" },
  { name: "black", value: "#000000" },
];

/** 저장된 hex → 그 색을 담고 있는 CSS 변수 이름 */
const FILL_VARS: Record<string, string> = Object.fromEntries(
  COLORS.map(({ name, value }) => [value, `var(--color-cat-${name})`]),
);
const TEXT_VARS: Record<string, string> = Object.fromEntries(
  COLORS.map(({ name, value }) => [value, `var(--color-cat-${name}-text)`]),
);

/**
 * 색을 그대로 보여 주는 자리에 쓴다 (색 선택기의 동그라미 등).
 *
 * 저장된 hex 를 직접 칠하면 다크 배경에서 검정 카테고리가 보이지 않고
 * 노랑 계열은 눈이 부시다. 값 대신 변수를 돌려주어, 실제 색은 CSS 가 테마를 보고 정한다.
 * 팔레트에 없는 값(옛 데이터 등)은 본문색으로 떨어뜨려 최소한 읽히게 한다.
 */
export const getCategoryColor = (hex: string): string =>
  FILL_VARS[hex] ?? "var(--color-content)";

/**
 * 읽혀야 하는 자리에 쓴다 (카테고리 이름, 아이콘, 입력창 밑줄).
 *
 * 흰 배경에서 노랑은 1.5:1, 분홍은 1.6:1 이라 이름이 거의 보이지 않는다.
 * 고르는 색까지 어둡게 내리면 팔레트가 통째로 탁해지므로 자리에 따라 나눠 쓴다.
 */
export const getCategoryTextColor = (hex: string): string =>
  TEXT_VARS[hex] ?? "var(--color-content)";

/**
 * 주말 글자색.
 *
 * 일요일의 빨강은 위험이 아니고 토요일의 파랑은 강조가 아니다.
 * danger/accent 를 빌려 쓰면 그 값을 손볼 때 달력 색이 함께 바뀌므로
 * 뜻이 다른 토큰을 따로 둔다.
 *
 * COLOR / TEXT_CLASS 는 쓰이는 자리가 달라 둘 다 필요하다.
 * 전자는 인라인 style 과 CSS 변수에, 후자는 클래스에 쓴다.
 */
export const SUNDAY_COLOR = "var(--color-weekend-sun)";
export const SATURDAY_COLOR = "var(--color-weekend-sat)";

export const SUNDAY_TEXT_CLASS = "text-weekend-sun";
export const SATURDAY_TEXT_CLASS = "text-weekend-sat";

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
const CATEGORY_COLOR_VARS: Record<string, string> = Object.fromEntries(
  COLORS.map(({ name, value }) => [value, `var(--color-cat-${name})`]),
);

/**
 * 카테고리 색을 화면에 칠할 값으로 바꾼다.
 *
 * 저장된 hex 를 그대로 쓰면 다크 배경에서 검정 카테고리가 보이지 않고
 * 노랑 계열은 눈이 부시다. 값 대신 변수를 돌려주어, 실제 색은 CSS 가 테마를 보고 정한다.
 * 팔레트에 없는 값(옛 데이터 등)은 본문색으로 떨어뜨려 최소한 읽히게 한다.
 */
export const getCategoryColor = (hex: string): string =>
  CATEGORY_COLOR_VARS[hex] ?? "var(--color-content)";

/**
 * 주말 글자색.
 *
 * 일요일의 빨강과 토요일의 파랑은 달력의 관습이므로, 값을 직접 적지 않고
 * 같은 뜻을 가진 토큰을 가리킨다. 다크 테마에서 눈부시지 않게 조정된 값이
 * 토큰 쪽에 이미 준비되어 있어, 여기서 테마를 따로 신경 쓸 필요가 없다.
 *
 * COLOR / TEXT_CLASS 는 쓰이는 자리가 달라 둘 다 필요하다.
 * 전자는 인라인 style 과 CSS 변수에, 후자는 클래스에 쓴다.
 */
export const SUNDAY_COLOR = "var(--color-danger)";
export const SATURDAY_COLOR = "var(--color-accent)";

export const SUNDAY_TEXT_CLASS = "text-danger";
export const SATURDAY_TEXT_CLASS = "text-accent";

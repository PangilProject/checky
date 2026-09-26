/**
 * 장면마다 하나씩 두는 핵심 문장.
 * 프레임(위치 측정·정적 화면)과 필름이 같은 문장을 쓰도록 한곳에 둔다.
 */
export const COPY = {
  question: "오늘 해야 할 일은\n얼마나 남아있나요?",
  tryCheck: "직접 체크해 보세요.",
  list: "한 번 할 일은 오늘에.\n계속할 일은 루틴에.",
  split: "한 번 할 일과,\n매일 이어갈 일을 따로.",
  calendar: "체크는 사라지지 않고,\n기록이 됩니다.",
  stats: "얼마나 했는지보다,\n얼마나 이어왔는지가 보이니까.",
  zero: "0개 남음",
  done: "오늘도 하나 해냈어요.",
  slogan: "어제보다 더 나은 오늘을 위해.",
} as const;

export type CaptionId = keyof typeof COPY;

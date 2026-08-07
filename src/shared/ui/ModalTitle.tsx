import type { ReactNode } from "react";
import { Text5 } from "./Text";
import { Space4 } from "./Space";

interface ModalTitleProps {
  text: string;
  /** 제목 왼쪽에 붙일 요소 (예: 뒤로가기 버튼) */
  leading?: ReactNode;
}

/**
 * 모달 제목.
 *
 * 글자 굵기와 제목 아래 여백을 함께 소유한다.
 * 호출부에서 각자 `font-bold` 와 간격 컴포넌트를 붙이면 모달마다 값이 어긋나므로,
 * 제목의 생김새에 관한 결정은 이 컴포넌트 안에만 둔다.
 */
export const ModalTitle = ({ text, leading }: ModalTitleProps) => {
  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        {leading}
        <Text5 text={text} className="font-bold" />
      </div>
      <Space4 direction="mb" />
    </>
  );
};

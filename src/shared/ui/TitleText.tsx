import { Text } from "./primitives";

interface TitleTextProps {
  text: string;
  className?: string;
  /** 섹션이 이 제목을 이름으로 가리킬 때 */
  id?: string;
}

/** 페이지 제목. 화면마다 크기가 갈리지 않도록 한 곳에서 정한다. */
export const TitleText = ({ text, className, id }: TitleTextProps) => {
  return (
    <Text variant="title" className={className} id={id}>
      {text}
    </Text>
  );
};

import { Button } from "./primitives/Button";

/**
 * @file Button.tsx
 * @description 색과 채움 방식을 이름에 담은 옛 버튼들.
 *
 * @deprecated 새 화면은 `@/shared/ui/primitives` 의 Button 을 쓴다.
 * 여기 있는 것들은 아직 남은 호출부를 위한 껍데기이며,
 * 화면 정리가 끝나면 이 파일은 사라진다.
 *
 * 색을 직접 칠하지 않고 프리미티브에 위임하므로,
 * 아직 옮기지 않은 화면도 테마 전환을 그대로 따라간다.
 */

interface BaseButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const NormalBlackButton = ({ text, ...props }: BaseButtonProps) => (
  <Button {...props}>{text}</Button>
);

export const NormalBlackUnFillButton = ({
  text,
  ...props
}: BaseButtonProps) => (
  <Button variant="outline" {...props}>
    {text}
  </Button>
);

export const NormalRedUnFillButton = ({ text, ...props }: BaseButtonProps) => (
  <Button variant="outline" tone="danger" {...props}>
    {text}
  </Button>
);

export const NormalBlueUnFillButton = ({ text, ...props }: BaseButtonProps) => (
  <Button variant="outline" tone="accent" {...props}>
    {text}
  </Button>
);

interface LongButtonProps extends BaseButtonProps {
  width: string;
  height: string;
}

export const LongBlackButton = ({
  text,
  width,
  height,
  className,
  ...props
}: LongButtonProps) => (
  // 크기를 width/height 로 직접 받으므로 기본 여백을 붙이지 않는다
  <Button size="none" className={`${width} ${height} ${className ?? ""}`} {...props}>
    {text}
  </Button>
);

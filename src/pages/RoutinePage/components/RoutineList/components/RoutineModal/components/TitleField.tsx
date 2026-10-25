import { useId, type Ref } from "react";
import { Input, Text } from "@/shared/ui/primitives";

interface TitleFieldProps {
  title: string;
  isReadOnly: boolean;
  setTitle: (value: string) => void;
  onSubmit: () => void;
  /** 편집을 시작할 때 커서를 넣기 위해 실제 입력창을 잡는다 */
  ref?: Ref<HTMLInputElement>;
}

export const TitleField = ({
  title,
  isReadOnly,
  setTitle,
  onSubmit,
  ref,
}: TitleFieldProps) => {
  const inputId = useId();
  return (
    <div>
      <Text as="label" variant="body" className="mb-2 block font-bold" htmlFor={inputId}>
        루틴명
      </Text>
      <Input
        id={inputId}
        ref={ref}
        placeholder="루틴 입력"
        value={title}
        maxLength={50}
        disabled={isReadOnly}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || e.nativeEvent.isComposing || isReadOnly)
            return;
          e.preventDefault();
          onSubmit();
        }}
      />
    </div>
  );
};

import { Input, Text } from "@/shared/ui/primitives";

interface TitleFieldProps {
  title: string;
  isReadOnly: boolean;
  setTitle: (value: string) => void;
  onSubmit: () => void;
}

export const TitleField = ({
  title,
  isReadOnly,
  setTitle,
  onSubmit,
}: TitleFieldProps) => {
  return (
    <div>
      <Text variant="body" className="mb-2 font-bold">
        루틴명
      </Text>
      <Input
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

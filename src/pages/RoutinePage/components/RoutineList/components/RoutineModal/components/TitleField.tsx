import { Text } from "@/shared/ui/primitives";
import { Space2 } from "@/shared/ui/Space";

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
      <Text variant="body" className="font-bold">
        루틴명
      </Text>
      <Space2 direction="mb" />
      <input
        className="w-full border-0 border-b border-content-subtle text-sm outline-none ime-fallback"
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

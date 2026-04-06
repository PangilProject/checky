import { Text3 } from "@/shared/ui/Text";
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
      <Text3 text="루틴명" className="font-bold" />
      <Space2 direction="mb" />
      <input
        className="w-full border-0 border-b border-gray-300 text-sm outline-none ime-fallback"
        placeholder="루틴 입력"
        value={title}
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

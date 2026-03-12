import { Text3 } from "@/shared/ui/Text";
import { Space2 } from "@/shared/ui/Space";

interface TitleFieldProps {
  title: string;
  isReadOnly: boolean;
  isComposing: boolean;
  setTitle: (value: string) => void;
  setIsComposing: (value: boolean) => void;
  onSubmit: () => void;
}

export const TitleField = ({
  title,
  isReadOnly,
  isComposing,
  setTitle,
  setIsComposing,
  onSubmit,
}: TitleFieldProps) => {
  return (
    <div>
      <Text3 text="루틴명" className="font-bold" />
      <Space2 direction="mb" />
      <input
        className={`w-full border-0 border-b border-gray-300 text-sm outline-none ${
          isComposing ? "ime-fallback" : "font-paperlogy"
        }`}
        placeholder="루틴 입력"
        value={title}
        disabled={isReadOnly}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || isComposing || isReadOnly) return;
          e.preventDefault();
          onSubmit();
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
    </div>
  );
};

import { Text3 } from "@/shared/ui/Text";

interface SectionTitleProps {
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
}

function SectionTitle({ title, description, rightElement }: SectionTitleProps) {
  return (
    <div className="flex justify-between items-end mb-3">
      <div>
        <Text3 text={title} className="font-semibold" />
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}

export default SectionTitle;

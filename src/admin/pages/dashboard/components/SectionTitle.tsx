import { Text } from "@/shared/ui/primitives";

interface SectionTitleProps {
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
}

function SectionTitle({ title, description, rightElement }: SectionTitleProps) {
  return (
    <div className="flex justify-between items-end mb-3">
      <div>
        <Text variant="body" className="font-semibold">
          {title}
        </Text>
        {description && (
          <p className="text-xs text-content-muted mt-1">{description}</p>
        )}
      </div>

      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}

export default SectionTitle;

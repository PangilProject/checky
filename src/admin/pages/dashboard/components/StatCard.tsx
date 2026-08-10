import { Surface, Text } from "@/shared/ui/primitives";

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <Surface radius="lg" padding="lg" bordered>
      <Text variant="body" tone="muted" className="mb-2">
        {title}
      </Text>
      <Text variant="heading">{value.toLocaleString()}</Text>
    </Surface>
  );
}

export default StatCard;

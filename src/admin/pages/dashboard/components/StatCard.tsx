import { Text } from "@/shared/ui/primitives";

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-line p-5 bg-surface-raised">
      <Text variant="body" tone="muted" className="mb-2">
        {title}
      </Text>
      <Text variant="heading">{value.toLocaleString()}</Text>
    </div>
  );
}

export default StatCard;

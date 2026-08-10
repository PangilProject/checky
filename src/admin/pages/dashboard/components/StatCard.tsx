import { Text3, Text5 } from "@/shared/ui/Text";

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-line p-5 bg-surface-raised">
      <Text3 text={title} className="text-content-muted mb-2" />
      <Text5 text={value.toLocaleString()} className="font-bold" />
    </div>
  );
}

export default StatCard;

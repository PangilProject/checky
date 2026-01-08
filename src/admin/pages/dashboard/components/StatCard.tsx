import { Text3, Text5 } from "@/shared/ui/Text";

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 bg-white">
      <Text3 text={title} className="text-gray-500 mb-2" />
      <Text5 text={value.toLocaleString()} className="font-bold" />
    </div>
  );
}

export default StatCard;

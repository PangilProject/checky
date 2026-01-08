import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; count: number }[];
}

function ActiveUserChart({ data }: Props) {
  return (
    <div className="w-full h-65 bg-white border rounded-lg p-4  pb-8 border-gray-200 ">
      <p className="font-semibold mb-3">활성 사용자 추이</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />

          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />

          <Tooltip
            contentStyle={{ fontSize: 12 }}
            labelStyle={{ fontSize: 12 }}
          />
          <Line type="monotone" dataKey="count" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActiveUserChart;

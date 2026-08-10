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

function UserSignupChart({ data }: Props) {
  return (
    <div className="w-full h-65 bg-surface-raised border rounded-lg p-4  pb-8 border-line ">
      <p className="font-semibold mb-3">가입자 추이</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--color-content-muted)" }}
            stroke="var(--color-line)"
            interval={0}
            minTickGap={0}
            angle={0}
            textAnchor="end"
            height={36}
            tickMargin={8}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-content-muted)" }}
            stroke="var(--color-line)"
            allowDecimals={false}
          />

          <Tooltip
            // 기본값이 흰 상자라 다크에서 그대로 두면 화면에서 튄다
            contentStyle={{
              fontSize: 12,
              backgroundColor: "var(--color-surface-raised)",
              border: "1px solid var(--color-line)",
              borderRadius: 8,
            }}
            labelStyle={{ fontSize: 12, color: "var(--color-content)" }}
            itemStyle={{ color: "var(--color-content)" }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-accent)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UserSignupChart;

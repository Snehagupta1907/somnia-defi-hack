import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface AnalyticsChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  loading: boolean;
}

export default function AnalyticsChart({ title, data, dataKey, color, loading }: AnalyticsChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd");
  };

  const chartData = data?.map(item => ({
    ...item,
    date: formatDate(item.date),
    [dataKey]: parseFloat(item[dataKey]),
  })) || [];

  if (loading) {
    return (
      <div className="rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Select defaultValue="7">
          <SelectTrigger className="w-32 bg-white/80 backdrop-blur border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              fontSize={12}
              fill="#6B7280"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              fontSize={12}
              fill="#6B7280"
              tickFormatter={formatValue}
            />
            <Tooltip
              formatter={(value: number) => [formatValue(value), title]}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

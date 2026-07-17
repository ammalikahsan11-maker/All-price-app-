import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface TrendChartProps {
  trendHistory: { period: string; price: number }[];
  currencySymbol: string;
  language: "en" | "hinglish";
}

export const TrendChart: React.FC<TrendChartProps> = ({
  trendHistory,
  currencySymbol,
  language
}) => {
  if (!trendHistory || trendHistory.length === 0) return null;

  // Format tooltip price
  const formatPrice = (value: number) => {
    return `${currencySymbol}${value.toLocaleString()}`;
  };

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-semibold" id="recharts-custom-tooltip">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{data.period}</p>
          <p className="text-emerald-400 font-extrabold text-sm mt-0.5">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-52 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-4" id="recharts-trend-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={trendHistory}
          margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="period"
            stroke="#94a3b8"
            fontSize={11}
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, stroke: '#ffffff', strokeWidth: 2, fill: '#10b981' }}
            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#10b981' }}
            name={language === "hinglish" ? "Daam" : "Price"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

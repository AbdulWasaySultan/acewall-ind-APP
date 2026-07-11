import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid,
  Text
} from 'recharts';

/**
 * Custom Tooltip to match Shadcn/UI or modern dashboard aesthetics
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-bold text-sm text-gray-700 mb-1">{label}</p>
        <p className="text-sm font-medium" style={{ color: payload[0].payload.percentage > 50 ? "#16a34a" : "#dc2626" }}>
          Success Rate: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export const QuestionTypeChart = ({ data }) => {
  // If data is empty, show a fallback to avoid console errors
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
        No performance data available
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
        >
          {/* Subtle grid lines for better readability */}
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
          
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            unit="%" 
            tick={{ fontSize: 12, fill: '#888' }}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            tick={{ fontSize: 12, fontWeight: 500, fill: '#333' }}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          
          <Bar 
            dataKey="percentage" 
            barSize={32}
            radius={[0, 6, 6, 0]} 
            animationDuration={1000}
            // Label inside/beside the bar for immediate info
            label={{ position: 'right', formatter: (val) => `${val}%`, fontSize: 12, fontWeight: 600, fill: '#666' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                // Using modern Shadcn-like colors: Green-500 and Red-500
                fill={entry.percentage > 50 ? "#22c55e" : "#ef4444"} 
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuestionTypeChart;
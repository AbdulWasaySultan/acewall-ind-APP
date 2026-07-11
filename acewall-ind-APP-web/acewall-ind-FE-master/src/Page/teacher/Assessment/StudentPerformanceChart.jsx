import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine,
  LabelList // Import LabelList for top-of-bar labels
} from 'recharts';

const StudentPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-gray-400">No student data</div>;
  }

  return (
    <div className="h-[450px] w-full pt-5"> {/* Added padding top for the labels */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            interval={0} 
            tick={{ fontSize: 12, fill: '#666', fontWeight: 500 }}
          />
          <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-xl border-gray-100">
                    <p className="font-bold text-gray-800">{item.fullName}</p>
                    <p className="text-sm font-semibold text-blue-600">Overall: {item.score}%</p>
                    <p className="text-xs text-gray-500 mt-1">Score: {item.earned} / {item.total} pts</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine 
            y={50} 
            stroke="#94a3b8" 
            strokeDasharray="5 5" 
            label={{ value: 'Passing (50%)', position: 'insideBottomRight', fontSize: 10, fill: '#94a3b8' }} 
          />
          
          <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={45}>
            {/* THIS ADDS THE PERCENTAGE ON TOP */}
            <LabelList 
              dataKey="score" 
              position="top" 
              formatter={(val) => `${val}%`} 
              style={{ fill: '#475569', fontSize: '12px', fontWeight: 'bold' }}
            />
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.score >= 80 ? "#22c55e" : entry.score >= 50 ? "#3b82f6" : "#ef4444"} 
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentPerformanceChart;
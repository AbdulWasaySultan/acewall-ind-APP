import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SubmissionPieChart = ({ data }) => {
  // 1. Calculate the values
  const onTime = data.onTimeCount || 0;
  const late = data.lateCount || 0;
  const missing = data.notSubmittedCount || 0;
  const total = data.totalEnrolled || (onTime + late + missing);

  // 2. Helper function to calculate percentage
  const getPerc = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

  const chartData = [
    { name: 'On-Time', value: onTime, percentage: getPerc(onTime) },
    { name: 'Late', value: late, percentage: getPerc(late) },
    { name: 'Missing', value: missing, percentage: getPerc(missing) },
  ];

  // Green for On-time, Orange for Late, Red for Missing
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444']; 

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm w-full md:w-[380px]">
      <h3 className="text-sm font-bold text-gray-600 mb-2 text-center uppercase tracking-wider">
        Submission Breakdown
      </h3>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value, name, props) => [`${value} Students (${props.payload.percentage}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Breakdown Percentages Section */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
            <span className="text-[10px] font-bold uppercase text-gray-400">{item.name}</span>
            <span className="text-sm font-bold" style={{ color: COLORS[index] }}>{item.percentage}%</span>
            <span className="text-[10px] text-gray-400">{item.value} Students</span>
          </div>
        ))}
      </div>

      {/* 4. Bottom Summary */}
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-semibold">
        <div className="flex flex-col">
           <span className="text-gray-400 uppercase text-[9px]">Total Class Size</span>
           <span className="text-gray-800 text-sm">{total} Students</span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-gray-400 uppercase text-[9px]">Overall Completion</span>
           <span className="text-green-600 text-sm">{data.completionRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPieChart;
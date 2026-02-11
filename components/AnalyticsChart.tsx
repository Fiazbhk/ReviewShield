import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Review, RelevanceStatus } from '../types';

interface AnalyticsChartProps {
  reviews: Review[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ reviews }) => {
  const data = [
    { name: 'Relevant', value: reviews.filter(r => r.status === RelevanceStatus.RELEVANT).length, color: '#10B981' },
    { name: 'Irrelevant', value: reviews.filter(r => r.status === RelevanceStatus.IRRELEVANT).length, color: '#EF4444' },
    { name: 'Needs Review', value: reviews.filter(r => r.status === RelevanceStatus.NEEDS_REVIEW).length, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No analysis data available yet.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
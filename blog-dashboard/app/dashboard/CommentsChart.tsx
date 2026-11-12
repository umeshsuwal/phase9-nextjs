'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartData = { author: string; comments: number }[];

export function CommentsChart({ data }: { data: ChartData }) {
  if (data.length === 0) return <p role="status">No data to chart.</p>;

  const total = data.reduce((sum, row) => sum + row.comments, 0);
  const summary = `Bar chart of comments per author. ${data.length} authors, ${total} comments in total.`;

  return (
    <div role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} accessibilityLayer={false}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="author" tick={{ fill: '#374151', fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#374151', fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="comments" name="Comments" fill="#1d4ed8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
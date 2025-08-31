"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UserGrowthChartProps {
  data: Array<{ month: string; users: number }>;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          User Growth Trend
        </CardTitle>
        <p className="text-sm text-gray-500">
          Monthly user registration over the past year
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [value?.toLocaleString() || '0', 'Users']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Total Growth: </span>
            <span className="text-green-600 font-semibold">
              +{data.length > 1 && data[0]?.users && data[data.length - 1]?.users ? ((data[data.length - 1].users - data[0].users) / data[0].users * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div>
            <span className="font-medium">Latest: </span>
            <span className="font-semibold">
              {data[data.length - 1]?.users?.toLocaleString() || 0} users
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
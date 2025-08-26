import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import Button from '../../../components/ui/Button';

const SalesPerformanceChart = () => {
  const [timeRange, setTimeRange] = useState('monthly');

  const monthlyData = [
    { month: 'Jan', actual: 45000, target: 50000, deals: 12 },
    { month: 'Feb', actual: 52000, target: 50000, deals: 15 },
    { month: 'Mar', actual: 48000, target: 55000, deals: 13 },
    { month: 'Apr', actual: 61000, target: 55000, deals: 18 },
    { month: 'May', actual: 55000, target: 60000, deals: 16 },
    { month: 'Jun', actual: 67000, target: 60000, deals: 20 },
    { month: 'Jul', actual: 58000, target: 65000, deals: 17 }
  ];

  const weeklyData = [
    { period: 'Week 1', actual: 12000, target: 15000, deals: 4 },
    { period: 'Week 2', actual: 18000, target: 15000, deals: 6 },
    { period: 'Week 3', actual: 14000, target: 15000, deals: 5 },
    { period: 'Week 4', actual: 16000, target: 15000, deals: 7 }
  ];

  const quarterlyData = [
    { quarter: 'Q1 2024', actual: 145000, target: 155000, deals: 40 },
    { quarter: 'Q2 2024', actual: 183000, target: 175000, deals: 54 },
    { quarter: 'Q3 2024', actual: 125000, target: 185000, deals: 37 }
  ];

  const getData = () => {
    switch (timeRange) {
      case 'weekly': return weeklyData;
      case 'quarterly': return quarterlyData;
      default: return monthlyData;
    }
  };

  const getXAxisKey = () => {
    switch (timeRange) {
      case 'weekly': return 'period';
      case 'quarterly': return 'quarter';
      default: return 'month';
    }
  };

  const timeRangeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sales Performance</h3>
          <p className="text-sm text-muted-foreground">Actual vs Target Revenue</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
          
          <Button variant="ghost" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey={getXAxisKey()} 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
              formatter={(value, name) => [
                `$${value.toLocaleString()}`,
                name === 'actual' ? 'Actual Revenue' : 'Target Revenue'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="actual" 
              fill="var(--color-primary)" 
              name="Actual Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="target" 
              fill="var(--color-accent)" 
              name="Target Revenue"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesPerformanceChart;
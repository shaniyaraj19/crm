import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RevenueForecasting = () => {
  const [forecastPeriod, setForecastPeriod] = useState('6months');

  const historicalData = [
    { month: 'Jan', actual: 45000, forecast: null, confidence: null },
    { month: 'Feb', actual: 52000, forecast: null, confidence: null },
    { month: 'Mar', actual: 48000, forecast: null, confidence: null },
    { month: 'Apr', actual: 61000, forecast: null, confidence: null },
    { month: 'May', actual: 55000, forecast: null, confidence: null },
    { month: 'Jun', actual: 67000, forecast: null, confidence: null },
    { month: 'Jul', actual: 58000, forecast: null, confidence: null }
  ];

  const forecastData6Months = [
    ...historicalData,
    { month: 'Aug', actual: null, forecast: 62000, confidence: 85 },
    { month: 'Sep', actual: null, forecast: 68000, confidence: 82 },
    { month: 'Oct', actual: null, forecast: 71000, confidence: 78 },
    { month: 'Nov', actual: null, forecast: 75000, confidence: 75 },
    { month: 'Dec', actual: null, forecast: 82000, confidence: 72 },
    { month: 'Jan 25', actual: null, forecast: 78000, confidence: 68 }
  ];

  const forecastData12Months = [
    ...forecastData6Months,
    { month: 'Feb 25', actual: null, forecast: 85000, confidence: 65 },
    { month: 'Mar 25', actual: null, forecast: 88000, confidence: 62 },
    { month: 'Apr 25', actual: null, forecast: 92000, confidence: 58 },
    { month: 'May 25', actual: null, forecast: 95000, confidence: 55 },
    { month: 'Jun 25', actual: null, forecast: 98000, confidence: 52 },
    { month: 'Jul 25', actual: null, forecast: 102000, confidence: 48 }
  ];

  const getData = () => {
    return forecastPeriod === '12months' ? forecastData12Months : forecastData6Months;
  };

  const forecastSummary = {
    nextMonth: { value: 62000, confidence: 85, change: 6.9 },
    nextQuarter: { value: 201000, confidence: 78, change: 12.5 },
    totalPipeline: 4200000,
    weightedPipeline: 2850000,
    avgDealSize: 7500,
    closeProbability: 68
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="text-sm">
              {entry.dataKey === 'actual' && entry.value && (
                <p className="text-primary">Actual: ${entry.value.toLocaleString()}</p>
              )}
              {entry.dataKey === 'forecast' && entry.value && (
                <div>
                  <p className="text-accent">Forecast: ${entry.value.toLocaleString()}</p>
                  <p className="text-muted-foreground">Confidence: {entry.payload.confidence}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Forecasting</h3>
          <p className="text-sm text-muted-foreground">Predictive revenue analysis with confidence intervals</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={forecastPeriod === '6months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setForecastPeriod('6months')}
          >
            6 Months
          </Button>
          <Button
            variant={forecastPeriod === '12months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setForecastPeriod('12months')}
          >
            12 Months
          </Button>
          <Button variant="ghost" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Forecast Chart */}
        <div className="xl:col-span-3">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 3 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Forecast Summary</h4>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Next Month</span>
              </div>
              <p className="text-xl font-bold text-foreground">${(forecastSummary.nextMonth.value / 1000).toFixed(0)}k</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium text-success">{forecastSummary.nextMonth.confidence}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Growth</span>
                <span className="font-medium text-success">+{forecastSummary.nextMonth.change}%</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Next Quarter</span>
              </div>
              <p className="text-xl font-bold text-foreground">${(forecastSummary.nextQuarter.value / 1000).toFixed(0)}k</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium text-warning">{forecastSummary.nextQuarter.confidence}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Growth</span>
                <span className="font-medium text-success">+{forecastSummary.nextQuarter.change}%</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pipeline Value</span>
                <span className="font-medium text-foreground">${(forecastSummary.totalPipeline / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weighted Pipeline</span>
                <span className="font-medium text-foreground">${(forecastSummary.weightedPipeline / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg Deal Size</span>
                <span className="font-medium text-foreground">${forecastSummary.avgDealSize.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Close Probability</span>
                <span className="font-medium text-foreground">{forecastSummary.closeProbability}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueForecasting;
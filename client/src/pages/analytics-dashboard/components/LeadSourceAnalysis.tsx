import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LeadSourceAnalysis = () => {
  const [viewType, setViewType] = useState('pie');

  const leadSourceData = [
    { 
      source: 'Website', 
      leads: 425, 
      converted: 89, 
      revenue: 267000,
      cost: 15000,
      roi: 1680,
      fill: '#1a4a52' 
    },
    { 
      source: 'Social Media', 
      leads: 312, 
      converted: 67, 
      revenue: 201000,
      cost: 8000,
      roi: 2412,
      fill: '#2d6a75' 
    },
    { 
      source: 'Email Campaign', 
      leads: 289, 
      converted: 78, 
      revenue: 234000,
      cost: 5000,
      roi: 4580,
      fill: '#4ade80' 
    },
    { 
      source: 'Referrals', 
      leads: 156, 
      converted: 52, 
      revenue: 156000,
      cost: 2000,
      roi: 7700,
      fill: '#22c55e' 
    },
    { 
      source: 'Cold Outreach', 
      leads: 98, 
      converted: 23, 
      revenue: 69000,
      cost: 12000,
      roi: 475,
      fill: '#16a34a' 
    },
    { 
      source: 'Trade Shows', 
      leads: 67, 
      converted: 18, 
      revenue: 54000,
      cost: 25000,
      roi: 116,
      fill: '#15803d' 
    }
  ];

  const totalLeads = leadSourceData.reduce((sum, item) => sum + item.leads, 0);
  const totalConverted = leadSourceData.reduce((sum, item) => sum + item.converted, 0);
  const totalRevenue = leadSourceData.reduce((sum, item) => sum + item.revenue, 0);
  const totalCost = leadSourceData.reduce((sum, item) => sum + item.cost, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-elevation-2">
          <h4 className="font-semibold text-popover-foreground mb-2">{data.source}</h4>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Leads: <span className="text-popover-foreground font-medium">{data.leads}</span></p>
            <p className="text-muted-foreground">Converted: <span className="text-popover-foreground font-medium">{data.converted}</span></p>
            <p className="text-muted-foreground">Conversion Rate: <span className="text-popover-foreground font-medium">{((data.converted / data.leads) * 100).toFixed(1)}%</span></p>
            <p className="text-muted-foreground">Revenue: <span className="text-popover-foreground font-medium">${data.revenue.toLocaleString()}</span></p>
            <p className="text-muted-foreground">ROI: <span className="text-popover-foreground font-medium">{data.roi}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getConversionRateColor = (rate) => {
    if (rate >= 25) return 'text-success';
    if (rate >= 15) return 'text-warning';
    return 'text-error';
  };

  const getRoiColor = (roi) => {
    if (roi >= 1000) return 'text-success';
    if (roi >= 500) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lead Source Analysis</h3>
          <p className="text-sm text-muted-foreground">Performance breakdown by acquisition channel</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('pie')}
            iconName="PieChart"
          >
            Distribution
          </Button>
          <Button
            variant={viewType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('bar')}
            iconName="BarChart3"
          >
            Performance
          </Button>
          <Button variant="ghost" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="xl:col-span-2">
          {viewType === 'pie' ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="leads"
                    label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadSourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="source" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="leads" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Summary</h4>
          
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Users" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Total Leads</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalLeads.toLocaleString()}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Target" size={16} className="text-success" />
                <span className="text-sm font-medium text-foreground">Converted</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalConverted}</p>
              <p className="text-sm text-muted-foreground">
                {((totalConverted / totalLeads) * 100).toFixed(1)}% conversion
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="DollarSign" size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${(totalRevenue / 1000000).toFixed(1)}M</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-warning" />
                <span className="text-sm font-medium text-foreground">Overall ROI</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{Math.round(((totalRevenue - totalCost) / totalCost) * 100)}%</p>
            </div>
          </div>

          {/* Top Performers */}
          <div className="pt-4 border-t border-border">
            <h5 className="font-medium text-foreground mb-3">Top Performers</h5>
            <div className="space-y-2">
              {leadSourceData
                .sort((a, b) => (b.converted / b.leads) - (a.converted / a.leads))
                .slice(0, 3)
                .map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: source.fill }}></span>
                      <span className="text-foreground">{source.source}</span>
                    </div>
                    <span className={`font-medium ${getConversionRateColor((source.converted / source.leads) * 100)}`}>
                      {((source.converted / source.leads) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Leads</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Converted</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conv. Rate</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Cost</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">ROI</th>
            </tr>
          </thead>
          <tbody>
            {leadSourceData.map((source) => (
              <tr key={source.source} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: source.fill }}></span>
                    <span className="font-medium text-foreground">{source.source}</span>
                  </div>
                </td>
                <td className="text-right py-3 px-4 text-foreground">{source.leads}</td>
                <td className="text-right py-3 px-4 text-foreground">{source.converted}</td>
                <td className={`text-right py-3 px-4 font-medium ${getConversionRateColor((source.converted / source.leads) * 100)}`}>
                  {((source.converted / source.leads) * 100).toFixed(1)}%
                </td>
                <td className="text-right py-3 px-4 text-foreground">${source.revenue.toLocaleString()}</td>
                <td className="text-right py-3 px-4 text-foreground">${source.cost.toLocaleString()}</td>
                <td className={`text-right py-3 px-4 font-medium ${getRoiColor(source.roi)}`}>
                  {source.roi}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadSourceAnalysis;
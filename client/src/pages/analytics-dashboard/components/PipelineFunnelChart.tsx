import React, { useState } from 'react';
import { FunnelChart, Funnel, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineFunnelChart = () => {
  const [selectedStage, setSelectedStage] = useState(null);

  const funnelData = [
    { 
      name: 'Leads', 
      value: 1250, 
      fill: '#1a4a52',
      deals: 1250,
      conversionRate: 100,
      avgValue: 2500
    },
    { 
      name: 'Qualified', 
      value: 875, 
      fill: '#2d6a75',
      deals: 875,
      conversionRate: 70,
      avgValue: 3200
    },
    { 
      name: 'Proposal', 
      value: 525, 
      fill: '#4ade80',
      deals: 525,
      conversionRate: 60,
      avgValue: 4800
    },
    { 
      name: 'Negotiation', 
      value: 315, 
      fill: '#22c55e',
      deals: 315,
      conversionRate: 60,
      avgValue: 6200
    },
    { 
      name: 'Closed Won', 
      value: 189, 
      fill: '#16a34a',
      deals: 189,
      conversionRate: 60,
      avgValue: 7500
    }
  ];

  const handleStageClick = (data) => {
    setSelectedStage(selectedStage?.name === data.name ? null : data);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-elevation-2">
          <h4 className="font-semibold text-popover-foreground mb-2">{data.name}</h4>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Deals: <span className="text-popover-foreground font-medium">{data.deals}</span></p>
            <p className="text-muted-foreground">Conversion: <span className="text-popover-foreground font-medium">{data.conversionRate}%</span></p>
            <p className="text-muted-foreground">Avg Value: <span className="text-popover-foreground font-medium">${data.avgValue.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pipeline Funnel</h3>
          <p className="text-sm text-muted-foreground">Deal progression and conversion rates</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
          <Button variant="ghost" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                  onClick={handleStageClick}
                  className="cursor-pointer"
                >
                  <LabelList position="center" fill="#fff" stroke="none" fontSize={14} />
                  {funnelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      stroke={selectedStage?.name === entry.name ? '#ffffff' : 'none'}
                      strokeWidth={selectedStage?.name === entry.name ? 2 : 0}
                    />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Stage Details</h4>
          
          {selectedStage ? (
            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="font-semibold text-foreground mb-3">{selectedStage.name}</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Deals</span>
                  <span className="font-medium text-foreground">{selectedStage.deals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium text-foreground">{selectedStage.conversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Deal Value</span>
                  <span className="font-medium text-foreground">${selectedStage.avgValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-medium text-foreground">${(selectedStage.deals * selectedStage.avgValue).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="MousePointer" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click on a funnel stage to view details</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Conversion</span>
              <span className="font-medium text-foreground">15.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Sales Cycle</span>
              <span className="font-medium text-foreground">45 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pipeline Value</span>
              <span className="font-medium text-foreground">$4.2M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineFunnelChart;
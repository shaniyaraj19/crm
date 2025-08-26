import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PipelineWidget = () => {
  const [selectedStage, setSelectedStage] = useState(null);

  const pipelineData = [
    {
      id: 1,
      stage: "Prospecting",
      deals: 12,
      value: 45000,
      color: "bg-blue-500",
      percentage: 15
    },
    {
      id: 2,
      stage: "Qualification",
      deals: 8,
      value: 32000,
      color: "bg-yellow-500",
      percentage: 25
    },
    {
      id: 3,
      stage: "Proposal",
      deals: 5,
      value: 28000,
      color: "bg-orange-500",
      percentage: 40
    },
    {
      id: 4,
      stage: "Negotiation",
      deals: 3,
      value: 18000,
      color: "bg-purple-500",
      percentage: 60
    },
    {
      id: 5,
      stage: "Closed Won",
      deals: 7,
      value: 65000,
      color: "bg-success",
      percentage: 100
    }
  ];

  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Sales Pipeline</h3>
          <p className="text-sm text-muted-foreground">Total Value: ${totalValue.toLocaleString()}</p>
        </div>
        <button className="p-2 hover:bg-muted rounded-md transition-smooth">
          <Icon name="MoreHorizontal" size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {pipelineData.map((stage) => (
          <div
            key={stage.id}
            className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
              selectedStage === stage.id 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <span className="font-medium text-card-foreground">{stage.stage}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-card-foreground">${stage.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stage.deals} deals</p>
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stage.color} transition-all duration-300`}
                style={{ width: `${stage.percentage}%` }}
              ></div>
            </div>
            
            {selectedStage === stage.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Conversion Rate:</span>
                    <span className="ml-2 font-medium">{stage.percentage}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Deal Size:</span>
                    <span className="ml-2 font-medium">${Math.round(stage.value / stage.deals).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineWidget;
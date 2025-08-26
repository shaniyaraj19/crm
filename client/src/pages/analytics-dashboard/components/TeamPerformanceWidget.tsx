import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TeamPerformanceWidget = () => {
  const [viewMode, setViewMode] = useState('individual');

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      role: "Senior Sales Rep",
      dealsWon: 23,
      revenue: 145000,
      target: 120000,
      conversionRate: 68,
      activities: 156,
      rank: 1
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Sales Rep",
      dealsWon: 18,
      revenue: 98000,
      target: 100000,
      conversionRate: 62,
      activities: 134,
      rank: 2
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "Sales Rep",
      dealsWon: 15,
      revenue: 87000,
      target: 90000,
      conversionRate: 58,
      activities: 128,
      rank: 3
    },
    {
      id: 4,
      name: "David Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "Junior Sales Rep",
      dealsWon: 12,
      revenue: 65000,
      target: 80000,
      conversionRate: 45,
      activities: 98,
      rank: 4
    },
    {
      id: 5,
      name: "Lisa Thompson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      role: "Sales Rep",
      dealsWon: 16,
      revenue: 92000,
      target: 95000,
      conversionRate: 55,
      activities: 142,
      rank: 5
    }
  ];

  const teamStats = {
    totalRevenue: 487000,
    totalTarget: 485000,
    avgConversion: 57.6,
    totalDeals: 84,
    totalActivities: 658
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPerformanceColor = (actual, target) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return 'text-success';
    if (percentage >= 80) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Team Performance</h3>
          <p className="text-sm text-muted-foreground">Individual and team metrics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'individual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('individual')}
          >
            Individual
          </Button>
          <Button
            variant={viewMode === 'team' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('team')}
          >
            Team Summary
          </Button>
        </div>
      </div>

      {viewMode === 'individual' ? (
        <div className="space-y-4">
          {/* Leaderboard Header */}
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Rep</div>
            <div className="col-span-2">Deals Won</div>
            <div className="col-span-2">Revenue</div>
            <div className="col-span-2">Target %</div>
            <div className="col-span-1">Conv %</div>
          </div>

          {/* Team Members */}
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="col-span-1">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${getRankBadgeColor(member.rank)}`}>
                    {member.rank}
                  </span>
                </div>
                
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <span className="font-semibold text-foreground">{member.dealsWon}</span>
                </div>
                
                <div className="col-span-2">
                  <span className="font-semibold text-foreground">${(member.revenue / 1000).toFixed(0)}k</span>
                </div>
                
                <div className="col-span-2">
                  <span className={`font-semibold ${getPerformanceColor(member.revenue, member.target)}`}>
                    {((member.revenue / member.target) * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="col-span-1">
                  <span className="text-sm font-medium text-foreground">{member.conversionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-foreground">${(teamStats.totalRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target: ${(teamStats.totalTarget / 1000).toFixed(0)}k</span>
              <span className={`font-medium ${getPerformanceColor(teamStats.totalRevenue, teamStats.totalTarget)}`}>
                {((teamStats.totalRevenue / teamStats.totalTarget) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="Target" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-xl font-bold text-foreground">{teamStats.totalDeals}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Conversion</span>
              <span className="font-medium text-foreground">{teamStats.avgConversion}%</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Icon name="Activity" size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-xl font-bold text-foreground">{teamStats.totalActivities}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg per Rep</span>
              <span className="font-medium text-foreground">{Math.round(teamStats.totalActivities / teamMembers.length)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformanceWidget;
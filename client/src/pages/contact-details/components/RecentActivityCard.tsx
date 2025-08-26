import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentActivityCard = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return 'Phone';
      case 'email':
        return 'Mail';
      case 'meeting':
        return 'Calendar';
      case 'note':
        return 'FileText';
      case 'task':
        return 'CheckSquare';
      case 'deal':
        return 'DollarSign';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'call':
        return 'text-blue-600';
      case 'email':
        return 'text-green-600';
      case 'meeting':
        return 'text-purple-600';
      case 'note':
        return 'text-orange-600';
      case 'task':
        return 'text-indigo-600';
      case 'deal':
        return 'text-emerald-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
          <Button variant="ghost" size="sm" iconName="MoreHorizontal">
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <Icon name={getActivityIcon(activity.type)} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    {activity.user && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">by {activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > 5 && (
              <Button variant="ghost" fullWidth className="mt-4">
                View All Activity
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">No recent activity</p>
            <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
              Add Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
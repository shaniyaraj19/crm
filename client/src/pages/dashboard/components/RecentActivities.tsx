import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RecentActivities = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'call',
      title: 'Called Sarah Johnson',
      description: 'Discussed product requirements and pricing options',
      contact: 'Sarah Johnson',
      company: 'Tech Solutions Inc.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      status: 'completed'
    },
    {
      id: 2,
      type: 'email',
      title: 'Email sent to Michael Chen',
      description: 'Proposal document and contract terms',
      contact: 'Michael Chen',
      company: 'Digital Dynamics',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'sent'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Meeting with Emma Wilson',
      description: 'Product demo and Q&A session scheduled',
      contact: 'Emma Wilson',
      company: 'Innovation Labs',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      status: 'scheduled'
    },
    {
      id: 4,
      type: 'deal',
      title: 'Deal updated - Acme Corp',
      description: 'Moved to negotiation stage, value increased to $75,000',
      contact: 'Robert Davis',
      company: 'Acme Corp',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      status: 'updated'
    },
    {
      id: 5,
      type: 'note',
      title: 'Note added for Lisa Anderson',
      description: 'Follow-up required next week regarding implementation timeline',
      contact: 'Lisa Anderson',
      company: 'Global Systems',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      status: 'added'
    }
  ];

  const getActivityIcon = (type) => {
    const iconMap = {
      call: 'Phone',
      email: 'Mail',
      meeting: 'Calendar',
      deal: 'DollarSign',
      note: 'FileText'
    };
    return iconMap[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      call: 'text-blue-600 bg-blue-100',
      email: 'text-green-600 bg-green-100',
      meeting: 'text-purple-600 bg-purple-100',
      deal: 'text-orange-600 bg-orange-100',
      note: 'text-gray-600 bg-gray-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'call', label: 'Calls', icon: 'Phone' },
    { value: 'email', label: 'Emails', icon: 'Mail' },
    { value: 'meeting', label: 'Meetings', icon: 'Calendar' },
    { value: 'deal', label: 'Deals', icon: 'DollarSign' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Activities</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="p-2 hover:bg-muted rounded-md transition-smooth">
            <Icon name="MoreHorizontal" size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-smooth">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <Icon name={getActivityIcon(activity.type)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-card-foreground truncate">
                  {activity.title}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {activity.description}
              </p>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={activity.avatar}
                    alt={activity.contact}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.contact} • {activity.company}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
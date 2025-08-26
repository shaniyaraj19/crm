import React from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';

const ActivityItem = ({ type, count, icon: Icon, color, label, completionRate }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      
      {completionRate !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Completion Rate</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
            <div 
              className="bg-current h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ActivitySummary = ({ activities = {}, period = "This Week" }) => {
  const defaultActivities = {
    calls: { count: 0, completionRate: 0 },
    emails: { count: 0, completionRate: 0 },
    meetings: { count: 0, completionRate: 0 },
    tasks: { count: 0, completionRate: 0 },
    notes: { count: 0 },
    overdue: { count: 0 }
  };

  const finalActivities = { ...defaultActivities, ...activities };

  const activityItems = [
    {
      type: 'calls',
      label: 'Calls',
      count: finalActivities.calls.count,
      icon: Phone,
      color: 'blue',
      completionRate: finalActivities.calls.completionRate
    },
    {
      type: 'emails',
      label: 'Emails',
      count: finalActivities.emails.count,
      icon: Mail,
      color: 'green',
      completionRate: finalActivities.emails.completionRate
    },
    {
      type: 'meetings',
      label: 'Meetings',
      count: finalActivities.meetings.count,
      icon: Calendar,
      color: 'purple',
      completionRate: finalActivities.meetings.completionRate
    },
    {
      type: 'tasks',
      label: 'Tasks',
      count: finalActivities.tasks.count,
      icon: CheckCircle,
      color: 'orange',
      completionRate: finalActivities.tasks.completionRate
    },
    {
      type: 'notes',
      label: 'Notes',
      count: finalActivities.notes.count,
      icon: FileText,
      color: 'indigo'
    },
    {
      type: 'overdue',
      label: 'Overdue',
      count: finalActivities.overdue.count,
      icon: Clock,
      color: 'red'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
        <span className="text-sm text-gray-600">{period}</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {activityItems.map((item) => (
          <ActivityItem
            key={item.type}
            type={item.type}
            count={item.count}
            icon={item.icon}
            color={item.color}
            label={item.label}
            completionRate={item.completionRate}
          />
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Activities</span>
          <span className="font-semibold text-gray-900">
            {Object.values(finalActivities).reduce((sum, activity) => sum + (activity.count || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummary;
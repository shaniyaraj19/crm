import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingTasks = () => {
  const [filter, setFilter] = useState('today');
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const tasks = [
    {
      id: 1,
      title: 'Follow up with Sarah Johnson',
      description: 'Discuss contract terms and implementation timeline',
      type: 'call',
      priority: 'high',
      dueDate: new Date(Date.now() + 3600000), // 1 hour from now
      contact: 'Sarah Johnson',
      company: 'Tech Solutions Inc.',
      estimatedDuration: 30
    },
    {
      id: 2,
      title: 'Send proposal to Michael Chen',
      description: 'Custom software development proposal with pricing',
      type: 'email',
      priority: 'high',
      dueDate: new Date(Date.now() + 7200000), // 2 hours from now
      contact: 'Michael Chen',
      company: 'Digital Dynamics',
      estimatedDuration: 15
    },
    {
      id: 3,
      title: 'Product demo preparation',
      description: 'Prepare demo materials for Innovation Labs meeting',
      type: 'task',
      priority: 'medium',
      dueDate: new Date(Date.now() + 14400000), // 4 hours from now
      contact: 'Emma Wilson',
      company: 'Innovation Labs',
      estimatedDuration: 45
    },
    {
      id: 4,
      title: 'Contract review meeting',
      description: 'Review and finalize contract details with legal team',
      type: 'meeting',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      contact: 'Robert Davis',
      company: 'Acme Corp',
      estimatedDuration: 60
    },
    {
      id: 5,
      title: 'Quarterly business review',
      description: 'Prepare QBR presentation and performance metrics',
      type: 'task',
      priority: 'low',
      dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
      contact: 'Lisa Anderson',
      company: 'Global Systems',
      estimatedDuration: 90
    }
  ];

  const getTaskIcon = (type) => {
    const iconMap = {
      call: 'Phone',
      email: 'Mail',
      meeting: 'Calendar',
      task: 'CheckSquare'
    };
    return iconMap[type] || 'CheckSquare';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colorMap[priority] || colorMap.medium;
  };

  const formatDueTime = (dueDate) => {
    const now = new Date();
    const diff = dueDate - now;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return 'Due now';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date() > dueDate;
  };

  const toggleTaskComplete = (taskId) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const filteredTasks = tasks.filter(task => {
    const now = new Date();
    const taskDate = new Date(task.dueDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 86400000);
    
    if (filter === 'today') {
      return taskDate >= today && taskDate < tomorrow;
    } else if (filter === 'upcoming') {
      return taskDate >= tomorrow;
    } else if (filter === 'overdue') {
      return taskDate < today;
    }
    return true;
  });

  const filterOptions = [
    { value: 'today', label: 'Today', count: tasks.filter(t => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 86400000);
      return new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow;
    }).length },
    { value: 'upcoming', label: 'Upcoming', count: tasks.filter(t => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 86400000);
      return new Date(t.dueDate) >= tomorrow;
    }).length },
    { value: 'overdue', label: 'Overdue', count: tasks.filter(t => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return new Date(t.dueDate) < today;
    }).length }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Upcoming Tasks</h3>
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
          Add Task
        </Button>
      </div>

      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              filter === option.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-smooth ${
              completedTasks.has(task.id)
                ? 'bg-muted/50 border-border opacity-60' :'bg-background border-border hover:border-primary/50'
            } ${isOverdue(task.dueDate) && !completedTasks.has(task.id) ? 'border-red-200 bg-red-50' : ''}`}
          >
            <button
              onClick={() => toggleTaskComplete(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-smooth ${
                completedTasks.has(task.id)
                  ? 'bg-success border-success text-white' :'border-border hover:border-primary'
              }`}
            >
              {completedTasks.has(task.id) && <Icon name="Check" size={12} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${getPriorityColor(task.priority)}`}>
                  <Icon name={getTaskIcon(task.type)} size={12} />
                </div>
                <h4 className={`font-medium ${
                  completedTasks.has(task.id) ? 'line-through text-muted-foreground' : 'text-card-foreground'
                }`}>
                  {task.title}
                </h4>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {task.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{task.contact} • {task.company}</span>
                <div className="flex items-center space-x-3">
                  <span>{task.estimatedDuration}min</span>
                  <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                    {formatDueTime(task.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            <button className="p-1 hover:bg-muted rounded transition-smooth">
              <Icon name="MoreVertical" size={16} className="text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No tasks for {filter}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
          View All Tasks
        </button>
      </div>
    </div>
  );
};

export default UpcomingTasks;
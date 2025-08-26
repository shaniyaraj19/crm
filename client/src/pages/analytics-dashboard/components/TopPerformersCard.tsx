import React from 'react';
import { Trophy, User } from 'lucide-react';

const TopPerformerItem = ({ rank, name, value, metric, avatar, change }) => {
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(rank)}`}>
          {rank <= 3 ? <Trophy className="w-4 h-4" /> : rank}
        </div>
        <div className="flex items-center space-x-2">
          {avatar ? (
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{metric}</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">{value}</p>
        {change && (
          <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

const TopPerformersCard = ({ performers = [], title = "Top Performers", metric = "Revenue" }) => {
  const defaultPerformers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      value: '$125,000',
      metric: 'Revenue',
      change: '+15%',
      rank: 1
    },
    {
      id: 2,
      name: 'Mike Chen',
      value: '$98,500',
      metric: 'Revenue',
      change: '+8%',
      rank: 2
    },
    {
      id: 3,
      name: 'Emily Davis',
      value: '$87,200',
      metric: 'Revenue',
      change: '+12%',
      rank: 3
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      value: '$76,800',
      metric: 'Revenue',
      change: '+5%',
      rank: 4
    },
    {
      id: 5,
      name: 'Lisa Wang',
      value: '$65,400',
      metric: 'Revenue',
      change: '+3%',
      rank: 5
    }
  ];

  const displayPerformers = performers.length > 0 ? performers : defaultPerformers;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-600">This Month</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {displayPerformers.slice(0, 5).map((performer, index) => (
          <TopPerformerItem
            key={performer.id || index}
            rank={performer.rank || index + 1}
            name={performer.name}
            value={performer.value}
            metric={performer.metric || metric}
            avatar={performer.avatar}
            change={performer.change}
          />
        ))}
      </div>
      
      {displayPerformers.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Performers ({displayPerformers.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default TopPerformersCard;
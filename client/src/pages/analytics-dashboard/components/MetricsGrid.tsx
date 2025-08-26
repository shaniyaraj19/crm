import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  BarChart3,
  Building2
} from 'lucide-react';

const MetricsCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  const changeColorClasses = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeColorClasses[changeType]}`}>
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : null}
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const MetricsGrid = ({ metrics = {} }) => {
  const defaultMetrics = {
    totalRevenue: { value: '$0', change: '0%', changeType: 'neutral' },
    totalDeals: { value: '0', change: '0%', changeType: 'neutral' },
    totalContacts: { value: '0', change: '0%', changeType: 'neutral' },
    totalCompanies: { value: '0', change: '0%', changeType: 'neutral' },
    conversionRate: { value: '0%', change: '0%', changeType: 'neutral' },
    averageDealSize: { value: '$0', change: '0%', changeType: 'neutral' }
  };

  const finalMetrics = { ...defaultMetrics, ...metrics };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: finalMetrics.totalRevenue.value,
      change: finalMetrics.totalRevenue.change,
      changeType: finalMetrics.totalRevenue.changeType,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Total Deals',
      value: finalMetrics.totalDeals.value,
      change: finalMetrics.totalDeals.change,
      changeType: finalMetrics.totalDeals.changeType,
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Total Contacts',
      value: finalMetrics.totalContacts.value,
      change: finalMetrics.totalContacts.change,
      changeType: finalMetrics.totalContacts.changeType,
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Total Companies',
      value: finalMetrics.totalCompanies.value,
      change: finalMetrics.totalCompanies.change,
      changeType: finalMetrics.totalCompanies.changeType,
      icon: Building2,
      color: 'orange'
    },
    {
      title: 'Conversion Rate',
      value: finalMetrics.conversionRate.value,
      change: finalMetrics.conversionRate.change,
      changeType: finalMetrics.conversionRate.changeType,
      icon: TrendingUp,
      color: 'indigo'
    },
    {
      title: 'Avg Deal Size',
      value: finalMetrics.averageDealSize.value,
      change: finalMetrics.averageDealSize.change,
      changeType: finalMetrics.averageDealSize.changeType,
      icon: DollarSign,
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((metric, index) => (
        <MetricsCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
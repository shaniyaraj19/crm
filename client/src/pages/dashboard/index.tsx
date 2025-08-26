import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import KPICard from './components/KPICard';
import PipelineWidget from './components/PipelineWidget';
import RecentActivities from './components/RecentActivities';
import TopContacts from './components/TopContacts';
import UpcomingTasks from './components/UpcomingTasks';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import { KPIData } from '../../types';

const Dashboard: React.FC = () => {
  const kpiData: KPIData[] = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'success'
    },
    {
      title: 'Active Deals',
      value: '156',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'primary'
    },
    {
      title: 'Conversion Rate',
      value: '24.8%',
      change: '-2.1%',
      changeType: 'negative',
      icon: 'Target',
      color: 'warning'
    },
    {
      title: 'New Contacts',
      value: '89',
      change: '+15.3%',
      changeType: 'positive',
      icon: 'Users',
      color: 'accent'
    }
  ];

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Layout>
      <Breadcrumbs />
      
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Here's what's happening with your sales pipeline for {currentMonth}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            <Link
              to="/contacts-list"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth text-sm font-medium"
            >
              <Icon name="Users" size={18} />
              <span>View Contacts</span>
            </Link>
            <Link
              to="/analytics-dashboard"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-smooth text-sm font-medium"
            >
              <Icon name="BarChart3" size={18} />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Left Column - Pipeline and Activities */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <PipelineWidget />
          <RecentActivities />
        </div>

        {/* Right Column - Contacts and Tasks */}
        <div className="space-y-4 md:space-y-6">
          <TopContacts />
          <UpcomingTasks />
        </div>
      </div>

      {/* Bottom Section - Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        
        {/* Performance Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Performance Summary</h3>
              <button className="p-2 hover:bg-muted rounded-md transition-smooth">
                <Icon name="MoreHorizontal" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="Trophy" size={24} />
                </div>
                <h4 className="font-semibold text-card-foreground">Top Performer</h4>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-lg font-bold text-success mt-1">$450K Revenue</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="Target" size={24} />
                </div>
                <h4 className="font-semibold text-card-foreground">Goal Progress</h4>
                <p className="text-sm text-muted-foreground">Monthly Target</p>
                <p className="text-lg font-bold text-primary mt-1">78% Complete</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="Clock" size={24} />
                </div>
                <h4 className="font-semibold text-card-foreground">Avg. Deal Time</h4>
                <p className="text-sm text-muted-foreground">Close Duration</p>
                <p className="text-lg font-bold text-accent mt-1">32 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </Layout>
  );
};

export default Dashboard;
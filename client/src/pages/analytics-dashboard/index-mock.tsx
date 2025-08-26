import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import KPICard from './components/KPICard';
import SalesPerformanceChart from './components/SalesPerformanceChart';
import PipelineFunnelChart from './components/PipelineFunnelChart';
import TeamPerformanceWidget from './components/TeamPerformanceWidget';
import RevenueForecasting from './components/RevenueForecasting';
import LeadSourceAnalysis from './components/LeadSourceAnalysis';
import FilterControls from './components/FilterControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AnalyticsDashboard = () => {
  const [filters, setFilters] = useState({
    dateRange: '30days',
    teamMember: 'all',
    productLine: 'all',
    territory: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTime, setRefreshTime] = useState(new Date());

  // Mock KPI data
  const kpiData = [
    {
      title: 'Monthly Revenue',
      value: '$67,500',
      target: '$65,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'primary'
    },
    {
      title: 'Deals Closed',
      value: '23',
      target: '20',
      change: '+15%',
      changeType: 'positive',
      icon: 'Target',
      color: 'success'
    },
    {
      title: 'Pipeline Value',
      value: '$4.2M',
      target: '$4.0M',
      change: '+5%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'warning'
    },
    {
      title: 'Conversion Rate',
      value: '18.5%',
      target: '20%',
      change: '-7.5%',
      changeType: 'negative',
      icon: 'Percent',
      color: 'error'
    },
    {
      title: 'Avg Deal Size',
      value: '$7,500',
      target: '$7,000',
      change: '+7.1%',
      changeType: 'positive',
      icon: 'Calculator',
      color: 'primary'
    },
    {
      title: 'Active Leads',
      value: '1,247',
      target: '1,200',
      change: '+3.9%',
      changeType: 'positive',
      icon: 'Users',
      color: 'success'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      setRefreshTime(new Date());
    }, 800);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRefreshTime(new Date());
    }, 1000);
  };

  const formatLastUpdated = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Analytics Dashboard - CRM Pro</title>
          <meta name="description" content="Comprehensive CRM analytics and performance insights" />
        </Helmet>
        
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-20 p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Loading Analytics...</p>
                <p className="text-sm text-muted-foreground">Fetching your performance data</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Analytics Dashboard - CRM Pro</title>
        <meta name="description" content="Comprehensive CRM analytics and performance insights for sales teams" />
        <meta name="keywords" content="CRM analytics, sales performance, pipeline analysis, revenue forecasting" />
      </Helmet>
      
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 md:ml-20 p-6">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                  Comprehensive performance insights and business metrics
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatLastUpdated(refreshTime)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  iconName="RefreshCw"
                  disabled={isLoading}
                >
                  Refresh
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Download"
                >
                  Export Report
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <FilterControls onFiltersChange={handleFiltersChange} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              {kpiData.map((kpi, index) => (
                <KPICard
                  key={index}
                  title={kpi.title}
                  value={kpi.value}
                  target={kpi.target}
                  change={kpi.change}
                  changeType={kpi.changeType}
                  icon={kpi.icon}
                  color={kpi.color}
                />
              ))}
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              <SalesPerformanceChart />
              <PipelineFunnelChart />
            </div>

            {/* Team Performance */}
            <div className="mb-8">
              <TeamPerformanceWidget />
            </div>

            {/* Revenue Forecasting */}
            <div className="mb-8">
              <RevenueForecasting />
            </div>

            {/* Lead Source Analysis */}
            <div className="mb-8">
              <LeadSourceAnalysis />
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Avg Sales Cycle</h3>
                    <p className="text-sm text-muted-foreground">Time to close deals</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">45 days</span>
                    <span className="text-sm text-success font-medium">-3 days</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Improved by 6.3% from last month
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="Award" size={20} className="text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Win Rate</h3>
                    <p className="text-sm text-muted-foreground">Deals won vs lost</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">68%</span>
                    <span className="text-sm text-success font-medium">+5%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Above industry average of 62%
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="AlertTriangle" size={20} className="text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">At Risk Deals</h3>
                    <p className="text-sm text-muted-foreground">Require attention</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">12</span>
                    <span className="text-sm text-warning font-medium">$180k</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total value at risk
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>


    </div>
  );
};

export default AnalyticsDashboard;
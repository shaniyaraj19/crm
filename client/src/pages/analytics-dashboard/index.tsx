import React, { useState, useEffect } from 'react';
// Removed react-helmet to avoid UNSAFE_componentWillMount warning
import Layout from '../../components/Layout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import MetricsGrid from './components/MetricsGrid';
import SalesPerformanceChart from './components/SalesPerformanceChart';
import PipelineFunnelChart from './components/PipelineFunnelChart';
import RevenueForecasting from './components/RevenueForecasting';
import TopPerformersCard from './components/TopPerformersCard';
import ActivitySummary from './components/ActivitySummary';
import AnalyticsFilters from './components/AnalyticsFilters';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { api } from '../../services/api';

interface AnalyticsFilters {
  dateRange: string;
  teamMember: string;
  productLine: string;
  territory: string;
}

interface KPIData {
  totalRevenue: { value: string; change: string; changeType: 'positive' | 'negative' | 'neutral' };
  totalDeals: { value: string; change: string; changeType: 'positive' | 'negative' | 'neutral' };
  totalContacts: { value: string; change: string; changeType: 'positive' | 'negative' | 'neutral' };
  totalCompanies: { value: string; change: string; changeType: 'positive' | 'negative' | 'neutral' };
  conversionRate: { value: string; change: string; changeType: 'positive' | 'negative' | 'neutral' };
  averageDealSize: { value: string; change: string; changeType: 'positive' | 'negative' | 'neutral' };
}

const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30days',
    teamMember: 'all',
    productLine: 'all',
    territory: 'all'
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());
  
  // Real data from API
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [salesPerformance, setSalesPerformance] = useState<any[]>([]);
  const [pipelineFunnel, setPipelineFunnel] = useState<any[]>([]);
  const [revenueForecasting, setRevenueForecasting] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [activitySummary, setActivitySummary] = useState<any>({});

  // Fetch KPI data from API
  const fetchKPIData = async () => {
    try {
      const response = await api.get('/analytics/kpis', {
        params: {
          dateRange: filters.dateRange,
          teamMember: filters.teamMember !== 'all' ? filters.teamMember : undefined,
          productLine: filters.productLine !== 'all' ? filters.productLine : undefined,
          territory: filters.territory !== 'all' ? filters.territory : undefined
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        
        // Transform API data to match frontend expectations
        const transformedKPIs = [
          {
            title: 'Monthly Revenue',
            value: `$${(data.totalRevenue / 1000).toFixed(1)}K`,
            target: `$${(data.revenueTarget / 1000).toFixed(1)}K`,
            change: `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%`,
            changeType: data.revenueGrowth >= 0 ? 'positive' : 'negative',
            icon: 'DollarSign',
            color: 'primary'
          },
          {
            title: 'Deals Closed',
            value: data.dealsWon.toString(),
            target: data.dealsTarget.toString(),
            change: `${data.dealsGrowth > 0 ? '+' : ''}${data.dealsGrowth.toFixed(1)}%`,
            changeType: data.dealsGrowth >= 0 ? 'positive' : 'negative',
            icon: 'Target',
            color: 'success'
          },
          {
            title: 'Pipeline Value',
            value: `$${(data.pipelineValue / 1000000).toFixed(1)}M`,
            target: `$${(data.pipelineTarget / 1000000).toFixed(1)}M`,
            change: `${data.pipelineGrowth > 0 ? '+' : ''}${data.pipelineGrowth.toFixed(1)}%`,
            changeType: data.pipelineGrowth >= 0 ? 'positive' : 'negative',
            icon: 'TrendingUp',
            color: 'warning'
          },
          {
            title: 'Conversion Rate',
            value: `${data.conversionRate.toFixed(1)}%`,
            target: `${data.conversionTarget.toFixed(1)}%`,
            change: `${data.conversionGrowth > 0 ? '+' : ''}${data.conversionGrowth.toFixed(1)}%`,
            changeType: data.conversionGrowth >= 0 ? 'positive' : 'negative',
            icon: 'Percent',
            color: data.conversionGrowth >= 0 ? 'success' : 'error'
          },
          {
            title: 'Avg Deal Size',
            value: `$${(data.avgDealSize / 1000).toFixed(1)}K`,
            target: `$${(data.avgDealTarget / 1000).toFixed(1)}K`,
            change: `${data.avgDealGrowth > 0 ? '+' : ''}${data.avgDealGrowth.toFixed(1)}%`,
            changeType: data.avgDealGrowth >= 0 ? 'positive' : 'negative',
            icon: 'Calculator',
            color: 'primary'
          },
          {
            title: 'Active Leads',
            value: data.activeLeads.toLocaleString(),
            target: data.leadsTarget.toLocaleString(),
            change: `${data.leadsGrowth > 0 ? '+' : ''}${data.leadsGrowth.toFixed(1)}%`,
            changeType: data.leadsGrowth >= 0 ? 'positive' : 'negative',
            icon: 'Users',
            color: 'success'
          }
        ];

        setKpiData(transformedKPIs);
      }
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError('Failed to load KPI data');
    }
  };

  // Fetch sales performance data
  const fetchSalesPerformance = async () => {
    try {
      const response = await api.get('/analytics/sales-performance', {
        params: {
          dateRange: filters.dateRange,
          teamMember: filters.teamMember !== 'all' ? filters.teamMember : undefined
        }
      });

      if (response.data.success) {
        setSalesPerformance(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching sales performance:', err);
    }
  };

  // Fetch pipeline funnel data
  const fetchPipelineFunnel = async () => {
    try {
      const response = await api.get('/analytics/pipeline-funnel', {
        params: {
          dateRange: filters.dateRange,
          productLine: filters.productLine !== 'all' ? filters.productLine : undefined
        }
      });

      if (response.data.success) {
        setPipelineFunnel(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching pipeline funnel:', err);
    }
  };

  // Fetch revenue forecasting data
  const fetchRevenueForecasting = async () => {
    try {
      const response = await api.get('/analytics/revenue-forecast', {
        params: {
          dateRange: filters.dateRange,
          territory: filters.territory !== 'all' ? filters.territory : undefined
        }
      });

      if (response.data.success) {
        setRevenueForecasting(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching revenue forecasting:', err);
    }
  };

  // Fetch top performers data
  const fetchTopPerformers = async () => {
    try {
      const response = await api.get('/analytics/top-performers', {
        params: {
          dateRange: filters.dateRange,
          limit: 10
        }
      });

      if (response.data.success) {
        setTopPerformers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching top performers:', err);
    }
  };

  // Fetch activity summary data
  const fetchActivitySummary = async () => {
    try {
      const response = await api.get('/analytics/activity-summary', {
        params: {
          dateRange: filters.dateRange,
          teamMember: filters.teamMember !== 'all' ? filters.teamMember : undefined
        }
      });

      if (response.data.success) {
        setActivitySummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching activity summary:', err);
    }
  };

  // Fetch all analytics data
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([
        fetchKPIData(),
        fetchSalesPerformance(),
        fetchPipelineFunnel(),
        fetchRevenueForecasting(),
        fetchTopPerformers(),
        fetchActivitySummary()
      ]);

      setRefreshTime(new Date());
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  // Set page title
  useEffect(() => {
    document.title = 'Analytics Dashboard - V-Accel CRM';
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefreshData = () => {
    fetchAllData();
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get('/analytics/export', {
        params: filters,
        responseType: 'blob'
      });
      
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    }
  };

  return (
    <Layout>
      {/* Page title set via useEffect */}
      
      <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumbs 
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Analytics', href: '/analytics-dashboard', current: true }
              ]} 
            />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Last updated: {refreshTime.toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button 
              onClick={handleRefreshData}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <Icon name="RefreshCw" size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
            
            <Button 
              onClick={handleExportReport}
              variant="default" 
              size="sm"
              className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Icon name="Download" size={16} />
              <span>Export</span>
            </Button>
          </div>
        </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <AnalyticsFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              loading={isLoading}
            />

            {/* KPI Metrics Grid */}
            <MetricsGrid 
              metrics={kpiData}
              loading={isLoading}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SalesPerformanceChart 
                data={salesPerformance}
                loading={isLoading}
              />
              
              <PipelineFunnelChart 
                data={pipelineFunnel}
                loading={isLoading}
              />
            </div>

            {/* Revenue Forecasting */}
            <div className="mb-8">
              <RevenueForecasting 
                data={revenueForecasting}
                loading={isLoading}
              />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopPerformersCard 
                performers={topPerformers}
                loading={isLoading}
              />
              
              <ActivitySummary 
                activities={activitySummary}
                loading={isLoading}
              />
            </div>
      </div>


    </Layout>
  );
};

export default AnalyticsDashboard;
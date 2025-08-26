import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FilterControls = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    dateRange: '30days',
    teamMember: 'all',
    productLine: 'all',
    territory: 'all'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: '6months', label: 'Last 6 months' },
    { value: '1year', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const teamMemberOptions = [
    { value: 'all', label: 'All Team Members' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'michael-chen', label: 'Michael Chen' },
    { value: 'emily-rodriguez', label: 'Emily Rodriguez' },
    { value: 'david-wilson', label: 'David Wilson' },
    { value: 'lisa-thompson', label: 'Lisa Thompson' }
  ];

  const productLineOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'enterprise', label: 'Enterprise Solutions' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'starter', label: 'Starter Package' },
    { value: 'consulting', label: 'Consulting Services' }
  ];

  const territoryOptions = [
    { value: 'all', label: 'All Territories' },
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: '30days',
      teamMember: 'all',
      productLine: 'all',
      territory: 'all'
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.teamMember !== 'all' || 
           filters.productLine !== 'all' || 
           filters.territory !== 'all' ||
           filters.dateRange !== '30days';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-muted-foreground" />
            <span className="font-medium text-foreground">Filters</span>
            {hasActiveFilters() && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>

          {/* Always visible date range filter */}
          <div className="min-w-48">
            <Select
              options={dateRangeOptions}
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder="Select date range"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              iconName="X"
            >
              Clear All
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <Select
              label="Team Member"
              options={teamMemberOptions}
              value={filters.teamMember}
              onChange={(value) => handleFilterChange('teamMember', value)}
              placeholder="Select team member"
            />
          </div>

          <div>
            <Select
              label="Product Line"
              options={productLineOptions}
              value={filters.productLine}
              onChange={(value) => handleFilterChange('productLine', value)}
              placeholder="Select product line"
            />
          </div>

          <div>
            <Select
              label="Territory"
              options={territoryOptions}
              value={filters.territory}
              onChange={(value) => handleFilterChange('territory', value)}
              placeholder="Select territory"
            />
          </div>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange('dateRange', '7days')}
          className={filters.dateRange === '7days' ? 'bg-primary/10 text-primary' : ''}
        >
          This Week
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange('dateRange', '30days')}
          className={filters.dateRange === '30days' ? 'bg-primary/10 text-primary' : ''}
        >
          This Month
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange('dateRange', '90days')}
          className={filters.dateRange === '90days' ? 'bg-primary/10 text-primary' : ''}
        >
          This Quarter
        </Button>

        <div className="flex-1"></div>

        <Button
          variant="ghost"
          size="sm"
          iconName="Download"
        >
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;
import React from 'react';
import { Calendar, Filter, Users, Map } from 'lucide-react';

const FilterSelect = ({ label, value, onChange, options, icon: Icon, placeholder }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-medium text-gray-700 flex items-center space-x-1">
        {Icon && <Icon className="w-3 h-3" />}
        <span>{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const AnalyticsFilters = ({ filters = {}, onFiltersChange, className = "" }) => {
  const defaultFilters = {
    dateRange: '30days',
    teamMember: 'all',
    productLine: 'all',
    territory: 'all'
  };

  const currentFilters = { ...defaultFilters, ...filters };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange?.(newFilters);
  };

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
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'emily-davis', label: 'Emily Davis' },
    { value: 'alex-rodriguez', label: 'Alex Rodriguez' },
    { value: 'lisa-wang', label: 'Lisa Wang' }
  ];

  const productLineOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'enterprise', label: 'Enterprise Solutions' },
    { value: 'small-business', label: 'Small Business' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'support', label: 'Support & Maintenance' }
  ];

  const territoryOptions = [
    { value: 'all', label: 'All Territories' },
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' }
  ];

  const clearFilters = () => {
    onFiltersChange?.(defaultFilters);
  };

  const hasActiveFilters = Object.entries(currentFilters).some(
    ([key, value]) => value !== defaultFilters[key]
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterSelect
          label="Date Range"
          value={currentFilters.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          options={dateRangeOptions}
          icon={Calendar}
        />

        <FilterSelect
          label="Team Member"
          value={currentFilters.teamMember}
          onChange={(value) => handleFilterChange('teamMember', value)}
          options={teamMemberOptions}
          icon={Users}
        />

        <FilterSelect
          label="Product Line"
          value={currentFilters.productLine}
          onChange={(value) => handleFilterChange('productLine', value)}
          options={productLineOptions}
          icon={Filter}
        />

        <FilterSelect
          label="Territory"
          value={currentFilters.territory}
          onChange={(value) => handleFilterChange('territory', value)}
          options={territoryOptions}
          icon={Map}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentFilters).map(([key, value]) => {
              if (value === defaultFilters[key]) return null;
              
              const getFilterLabel = (key, value) => {
                const optionsMap = {
                  dateRange: dateRangeOptions,
                  teamMember: teamMemberOptions,
                  productLine: productLineOptions,
                  territory: territoryOptions
                };
                
                const option = optionsMap[key]?.find(opt => opt.value === value);
                return option ? option.label : value;
              };

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={() => handleFilterChange(key, defaultFilters[key])}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
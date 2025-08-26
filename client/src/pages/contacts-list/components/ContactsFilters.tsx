import React, { useState } from 'react';
import Select from '../../../components/ui/Select';

const ContactsFilters = ({ 
  filters, 
  onFilterChange,
  isExpanded = false // New prop to control expansion from parent
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Use parent's expansion state if provided, otherwise use internal state
  const shouldShowFilters = isExpanded || isFiltersExpanded;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Hot Lead', label: 'Hot Lead' },
    { value: 'Warm Lead', label: 'Warm Lead' },
    { value: 'Cold Lead', label: 'Cold Lead' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Prospect', label: 'Prospect' }
  ];

  const companyOptions = [
    { value: '', label: 'All Companies' },
    { value: 'TechCorp Solutions', label: 'TechCorp Solutions' },
    { value: 'Global Industries', label: 'Global Industries' },
    { value: 'Innovation Labs', label: 'Innovation Labs' },
    { value: 'Digital Dynamics', label: 'Digital Dynamics' },
    { value: 'Future Systems', label: 'Future Systems' },
    { value: 'Smart Solutions', label: 'Smart Solutions' },
    { value: 'NextGen Tech', label: 'NextGen Tech' },
    { value: 'Alpha Enterprises', label: 'Alpha Enterprises' }
  ];

  const ownerOptions = [
    { value: '', label: 'All Owners' },
    { value: 'John Smith', label: 'John Smith' },
    { value: 'Sarah Johnson', label: 'Sarah Johnson' },
    { value: 'Mike Davis', label: 'Mike Davis' },
    { value: 'Emily Chen', label: 'Emily Chen' },
    { value: 'David Wilson', label: 'David Wilson' }
  ];

  const tagOptions = [
    { value: '', label: 'All Tags' },
    { value: 'VIP', label: 'VIP' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'SMB', label: 'SMB' },
    { value: 'Startup', label: 'Startup' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Referral', label: 'Referral' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };



  return (
    <div className="bg-card rounded-lg border border-border shadow-elevation-1 p-6 mb-6">



      {/* Filter Controls */}
      {shouldShowFilters && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              placeholder="Select status"
            />
            
            <Select
              label="Company"
              options={companyOptions}
              value={filters.company}
              onChange={(value) => handleFilterChange('company', value)}
              placeholder="Select company"
              searchable
            />
            
            <Select
              label="Owner"
              options={ownerOptions}
              value={filters.owner}
              onChange={(value) => handleFilterChange('owner', value)}
              placeholder="Select owner"
            />
            
            <Select
              label="Tags"
              options={tagOptions}
              value={filters.tags}
              onChange={(value) => handleFilterChange('tags', value)}
              placeholder="Select tag"
            />
            
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder="Select date range"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsFilters;
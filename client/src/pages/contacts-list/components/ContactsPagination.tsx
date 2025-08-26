import React from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ContactsPagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ];

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="bg-card border-t border-border px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Results Info */}
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
            <span className="font-medium text-foreground">{endItem}</span> of{' '}
            <span className="font-medium text-foreground">{totalItems}</span> contacts
          </p>
          
          {/* Items per page selector */}
          <div className="hidden sm:block">
            <Select
              options={itemsPerPageOptions}
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
              className="w-32"
            />
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
            className="px-3"
          >
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center space-x-1">
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="px-3 py-2 min-w-[40px]"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Page Info */}
          <div className="sm:hidden flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            iconName="ChevronRight"
            iconPosition="right"
            className="px-3"
          >
            <span className="hidden sm:inline mr-1">Next</span>
          </Button>
        </div>
      </div>

      {/* Mobile Items per page */}
      <div className="sm:hidden mt-4 pt-4 border-t border-border">
        <Select
          label="Items per page"
          options={itemsPerPageOptions}
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ContactsPagination;
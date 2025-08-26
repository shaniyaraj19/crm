import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: 'Add Contact',
      description: 'Create a new contact record',
      icon: 'UserPlus',
      variant: 'default',
      action: () => {
        console.log('Adding new contact...');
        // Navigate to add contact form or open modal
      }
    },
    {
      id: 2,
      title: 'Create Deal',
      description: 'Start a new sales opportunity',
      icon: 'DollarSign',
      variant: 'secondary',
      action: () => {
        console.log('Creating new deal...');
        // Navigate to create deal form or open modal
      }
    },
    {
      id: 3,
      title: 'Log Activity',
      description: 'Record a call, email, or meeting',
      icon: 'Activity',
      variant: 'outline',
      action: () => {
        console.log('Logging activity...');
        // Open activity logging modal
      }
    },
    {
      id: 4,
      title: 'Import Contacts',
      description: 'Upload contacts from CSV file',
      icon: 'Upload',
      variant: 'ghost',
      action: () => {
        console.log('Importing contacts...');
        // Open import modal or navigate to import page
      }
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            onClick={action.action}
            iconName={action.icon}
            iconPosition="left"
            className="h-auto p-4 justify-start text-left"
            fullWidth
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{action.title}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {action.description}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const getContextualActions = () => {
    const path = location.pathname;
    
    if (path === '/contacts-list' || path === '/dashboard') {
      return [
        {
          label: 'Add Contact',
          icon: 'UserPlus',
          action: () => {
            console.log('Adding new contact...');
            setIsExpanded(false);
          },
          primary: true
        },
        {
          label: 'Import Contacts',
          icon: 'Upload',
          action: () => {
            console.log('Importing contacts...');
            setIsExpanded(false);
          }
        },
        {
          label: 'Create Deal',
          icon: 'DollarSign',
          action: () => {
            console.log('Creating new deal...');
            setIsExpanded(false);
          }
        }
      ];
    }
    
    if (path === '/contact-details' || path.startsWith('/contact-details/')) {
      return [
        {
          label: 'Add Note',
          icon: 'FileText',
          action: () => {
            console.log('Adding note...');
            setIsExpanded(false);
          },
          primary: true
        },
        {
          label: 'Schedule Call',
          icon: 'Phone',
          action: () => {
            console.log('Scheduling call...');
            setIsExpanded(false);
          }
        },
        {
          label: 'Send Email',
          icon: 'Mail',
          action: () => {
            console.log('Sending email...');
            setIsExpanded(false);
          }
        }
      ];
    }
    
    if (path === '/analytics-dashboard') {
      return [
        {
          label: 'Export Report',
          icon: 'Download',
          action: () => {
            console.log('Exporting report...');
            setIsExpanded(false);
          },
          primary: true
        },
        {
          label: 'Schedule Report',
          icon: 'Calendar',
          action: () => {
            console.log('Scheduling report...');
            setIsExpanded(false);
          }
        }
      ];
    }
    
    return [];
  };

  const actions = getContextualActions();

  // Don't render on login page or if no actions available
  if (location.pathname === '/login' || actions.length === 0) {
    return null;
  }

  const primaryAction = actions.find(action => action.primary);
  const secondaryActions = actions.filter(action => !action.primary);

  const handlePrimaryAction = () => {
    if (primaryAction) {
      primaryAction.action();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-1000">
      {/* Secondary Actions */}
      {isExpanded && secondaryActions.length > 0 && (
        <div className="mb-4 space-y-2">
          {secondaryActions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center justify-end space-x-3 animate-in slide-in-from-bottom-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-card text-card-foreground px-3 py-1 rounded-md shadow-elevation-1 text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
              <Button
                variant="secondary"
                size="icon"
                onClick={action.action}
                className="w-12 h-12 shadow-elevation-2"
              >
                <Icon name={action.icon} size={20} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Action Button */}
      <div className="flex items-center space-x-2">
        {/* Expand/Collapse Button */}
        {secondaryActions.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleExpanded}
            className="w-12 h-12 shadow-elevation-2 bg-card hover:bg-muted"
          >
            <Icon 
              name={isExpanded ? 'X' : 'MoreHorizontal'} 
              size={20} 
              className="transition-smooth"
            />
          </Button>
        )}

        {/* Primary Action Button */}
        {primaryAction && (
          <Button
            variant="default"
            onClick={handlePrimaryAction}
            className="h-12 px-6 shadow-elevation-2 bg-primary hover:bg-primary/90"
            iconName={primaryAction.icon}
            iconPosition="left"
          >
            <span className="hidden sm:inline">{primaryAction.label}</span>
            <span className="sm:hidden">
              <Icon name={primaryAction.icon} size={20} />
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuickActionButton;
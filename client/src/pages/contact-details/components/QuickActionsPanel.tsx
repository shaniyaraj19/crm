import React from 'react';

import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ contact }) => {
  const handleCall = () => {
    window.open(`tel:${contact.phone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${contact.email}`, '_self');
  };

  const handleScheduleMeeting = () => {
    console.log('Scheduling meeting with', contact.firstName);
  };

  const handleAddNote = () => {
    console.log('Adding note for', contact.firstName);
  };

  const handleCreateDeal = () => {
    console.log('Creating deal for', contact.firstName);
  };

  const handleAddTask = () => {
    console.log('Adding task for', contact.firstName);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Quick Actions</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <Button
          variant="default"
          fullWidth
          onClick={handleCall}
          iconName="Phone"
          iconPosition="left"
          className="justify-start"
        >
          Call {contact.firstName}
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={handleEmail}
          iconName="Mail"
          iconPosition="left"
          className="justify-start"
        >
          Send Email
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={handleScheduleMeeting}
          iconName="Calendar"
          iconPosition="left"
          className="justify-start"
        >
          Schedule Meeting
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={handleAddNote}
          iconName="FileText"
          iconPosition="left"
          className="justify-start"
        >
          Add Note
        </Button>
        
        <div className="pt-3 border-t border-border space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCreateDeal}
            iconName="DollarSign"
            iconPosition="left"
            className="justify-start"
          >
            Create Deal
          </Button>
          
          <Button
            variant="secondary"
            fullWidth
            onClick={handleAddTask}
            iconName="CheckSquare"
            iconPosition="left"
            className="justify-start"
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
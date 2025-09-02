import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActionsPanel = ({ contact, onAddNote }: { contact: any; onAddNote: (note: any) => void }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    content: '',
    type: 'general' as const
  });
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
    setShowNoteModal(true);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteForm.content.trim()) {
      onAddNote(noteForm);
      setNoteForm({ content: '', type: 'general' });
      setShowNoteModal(false);
    }
  };

  const handleCreateDeal = () => {
    console.log('Creating deal for', contact.firstName);
  };

  const handleAddTask = () => {
    console.log('Adding task for', contact.firstName);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg shadow-elevation-1">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Quick Actions</h3>
        </div>
        
        <div className="p-4 space-y-3">
        <Button
          variant="default"
          onClick={handleCall}
          iconName="Phone"
          iconPosition="left"
          className="w-full justify-start"
        >
          Call {contact.firstName}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleEmail}
          iconName="Mail"
          iconPosition="left"
          className="w-full justify-start"
        >
          Send Email
        </Button>
        
        <Button
          variant="outline"
          onClick={handleScheduleMeeting}
          iconName="Calendar"
          iconPosition="left"
          className="w-full justify-start"
        >
          Schedule Meeting
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddNote}
          iconName="FileText"
          iconPosition="left"
          className="w-full justify-start"
        >
          Add Note
        </Button>
        
        <div className="pt-3 border-t border-border space-y-3">
          <Button
            variant="secondary"
            onClick={handleCreateDeal}
            iconName="DollarSign"
            iconPosition="left"
            className="w-full justify-start"
          >
            Create Deal
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleAddTask}
            iconName="CheckSquare"
            iconPosition="left"
            className="w-full justify-start"
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>

    {/* Note Modal */}
    {showNoteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Add Note</h3>
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Note Type</label>
              <select
                value={noteForm.type}
                onChange={(e) => setNoteForm({...noteForm, type: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="general">General</option>
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note Content</label>
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="Enter your note here..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">Add Note</Button>
              <Button type="button" variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};

export default QuickActionsPanel;
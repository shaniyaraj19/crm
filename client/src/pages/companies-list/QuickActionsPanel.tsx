// import React from 'react';

// import Button from '../../components/ui/Button';

// const QuickActionsPanel = ({ company }: { company: any }) => {
//   const handleCall = () => {
//     window.open(`tel:${company.phone}`, '_self');
//   };

//   const handleEmail = () => {
//     window.open(`mailto:${company.email}`, '_self');
//   };

//   const handleScheduleMeeting = () => {
//     console.log('Scheduling meeting with', company.name);
//   };

//   const handleAddNote = () => {
//     console.log('Adding note for', company.name);
//   };

//   const handleCreateDeal = () => {
//     console.log('Creating deal for', company.name);
//   };

//   const handleAddTask = () => {
//     console.log('Adding task for', company.name);
//   };

//   const handleViewWebsite = () => {
//     if (company.website) {
//       window.open(company.website, '_blank');
//     }
//   };

//   const handleAddContact = () => {
//     console.log('Adding contact for', company.name);
//   };

//   return (
//     <div className="bg-card border border-border rounded-lg shadow-elevation-1">
//       <div className="p-4 border-b border-border">
//         <h3 className="text-lg font-medium text-foreground">Quick Actions</h3>
//       </div>
      
//       <div className="p-4 space-y-3">
//         {company.phone && (
//           <Button
//             variant="default"
//             onClick={handleCall}
//             iconName="Phone"
//             iconPosition="left"
//             className="w-full justify-start"
//           >
//             Call {company.name}
//           </Button>
//         )}
        
//         {company.email && (
//           <Button
//             variant="outline"
//             onClick={handleEmail}
//             iconName="Mail"
//             iconPosition="left"
//             className="w-full justify-start"
//           >
//             Send Email
//           </Button>
//         )}
        
//         <Button
//           variant="outline"
//           onClick={handleScheduleMeeting}
//           iconName="Calendar"
//           iconPosition="left"
//           className="w-full justify-start"
//         >
//           Schedule Meeting
//         </Button>
        
//         <Button
//           variant="outline"
//           onClick={handleAddNote}
//           iconName="FileText"
//           iconPosition="left"
//           className="w-full justify-start"
//         >
//           Add Note
//         </Button>
        
//         {company.website && (
//           <Button
//             variant="outline"
//             onClick={handleViewWebsite}
//             iconName="Globe"
//             iconPosition="left"
//             className="w-full justify-start"
//           >
//             Visit Website
//           </Button>
//         )}
        
//         <div className="pt-3 border-t border-border space-y-3">
//           <Button
//             variant="secondary"
//             onClick={handleCreateDeal}
//             iconName="DollarSign"
//             iconPosition="left"
//             className="w-full justify-start"
//           >
//             Create Deal
//           </Button>
          
//           {/* <Button
//             variant="secondary"
//             onClick={handleAddContact}
//             iconName="UserPlus"
//             iconPosition="left"
//             className="w-full justify-start"
//           >
//             Add Contact
//           </Button> */}
          
//           <Button
//             variant="secondary"
//             onClick={handleAddTask}
//             iconName="CheckSquare"
//             iconPosition="left"
//             className="w-full justify-start"
//           >
//             Add Task
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuickActionsPanel;


import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Add these interfaces for the new functionality
interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  notes: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  type: 'general' | 'meeting' | 'call' | 'email';
}

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  closeDate: string;
  description: string;
}

const QuickActionsPanel = ({ company }: { company: any }) => {
  // State for modals and forms
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  // Form states
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    attendees: '',
    notes: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
    assignedTo: '',
    status: 'pending' as const
  });

  const [noteForm, setNoteForm] = useState({
    content: '',
    type: 'general' as const
  });

  const [dealForm, setDealForm] = useState({
    name: '',
    value: '',
    stage: 'lead' as const,
    probability: 25,
    closeDate: '',
    description: ''
  });

  const handleCall = () => {
    window.open(`tel:${company.phone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${company.email}`, '_self');
  };

  const handleScheduleMeeting = () => {
    setShowMeetingModal(true);
  };

  const handleAddNote = () => {
    setShowNoteModal(true);
  };

  const handleCreateDeal = () => {
    setShowDealModal(true);
  };

  const handleAddTask = () => {
    setShowTaskModal(true);
  };

  const handleViewWebsite = () => {
    if (company.website) {
      window.open(company.website, '_blank');
    }
  };

  const handleAddContact = () => {
    console.log('Adding contact for', company.name);
  };

  // Form submission handlers
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: meetingForm.title,
      date: meetingForm.date,
      time: meetingForm.time,
      duration: meetingForm.duration,
      attendees: meetingForm.attendees.split(',').map(a => a.trim()).filter(Boolean),
      notes: meetingForm.notes
    };
    
    console.log('Meeting scheduled:', newMeeting);
    // Here you would typically save to your backend
    // saveMeeting(newMeeting);
    
    // Reset form and close modal
    setMeetingForm({
      title: '',
      date: '',
      time: '',
      duration: '30',
      attendees: '',
      notes: ''
    });
    setShowMeetingModal(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      assignedTo: taskForm.assignedTo,
      status: taskForm.status
    };
    
    console.log('Task created:', newTask);
    // Here you would typically save to your backend
    // saveTask(newTask);
    
    // Reset form and close modal
    setTaskForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: '',
      status: 'pending'
    });
    setShowTaskModal(false);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Note = {
      id: Date.now().toString(),
      content: noteForm.content,
      timestamp: new Date().toISOString(),
      type: noteForm.type
    };
    
    console.log('Note added:', newNote);
    // Here you would typically save to your backend
    // saveNote(newNote);
    
    // Reset form and close modal
    setNoteForm({
      content: '',
      type: 'general'
    });
    setShowNoteModal(false);
  };

  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeal: Deal = {
      id: Date.now().toString(),
      name: dealForm.name,
      value: parseFloat(dealForm.value),
      stage: dealForm.stage,
      probability: dealForm.probability,
      closeDate: dealForm.closeDate,
      description: dealForm.description
    };
    
    console.log('Deal created:', newDeal);
    // Here you would typically save to your backend
    // saveDeal(newDeal);
    
    // Reset form and close modal
    setDealForm({
      name: '',
      value: '',
      stage: 'lead',
      probability: 25,
      closeDate: '',
      description: ''
    });
    setShowDealModal(false);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg shadow-elevation-1">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Quick Actions</h3>
        </div>
        
        <div className="p-4 space-y-3">
          {company.phone && (
            <Button
              variant="default"
              onClick={handleCall}
              iconName="Phone"
              iconPosition="left"
              className="w-full justify-start"
            >
              Call {company.name}
            </Button>
          )}
          
          {company.email && (
            <Button
              variant="outline"
              onClick={handleEmail}
              iconName="Mail"
              iconPosition="left"
              className="w-full justify-start"
            >
              Send Email
            </Button>
          )}
          
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
          
          {company.website && (
            <Button
              variant="outline"
              onClick={handleViewWebsite}
              iconName="Globe"
              iconPosition="left"
              className="w-full justify-start"
            >
              Visit Website
            </Button>
          )}
          
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

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Schedule Meeting</h3>
            <form onSubmit={handleMeetingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <select
                  value={meetingForm.duration}
                  onChange={(e) => setMeetingForm({...meetingForm, duration: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Attendees (comma-separated)</label>
                <input
                  type="text"
                  value={meetingForm.attendees}
                  onChange={(e) => setMeetingForm({...meetingForm, attendees: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({...meetingForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">Schedule Meeting</Button>
                <Button type="button" variant="outline" onClick={() => setShowMeetingModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Task</h3>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Team member name"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">Create Task</Button>
                <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Deal</h3>
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deal Name</label>
                <input
                  type="text"
                  value={dealForm.name}
                  onChange={(e) => setDealForm({...dealForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deal Value ($)</label>
                <input
                  type="number"
                  value={dealForm.value}
                  onChange={(e) => setDealForm({...dealForm, value: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm({...dealForm, stage: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed-won">Closed Won</option>
                    <option value="closed-lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Probability (%)</label>
                  <input
                    type="number"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({...dealForm, probability: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Close Date</label>
                <input
                  type="date"
                  value={dealForm.closeDate}
                  onChange={(e) => setDealForm({...dealForm, closeDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={dealForm.description}
                  onChange={(e) => setDealForm({...dealForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Describe the deal..."
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">Create Deal</Button>
                <Button type="button" variant="outline" onClick={() => setShowDealModal(false)} className="flex-1">
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
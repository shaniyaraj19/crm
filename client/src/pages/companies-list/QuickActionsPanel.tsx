import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { api } from "../../services/api";
import { createDeal } from "../../services/deals";

interface QuickActionsPanelProps {
  company: any;
  onActionComplete?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ company, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Note states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  
  // Meeting states
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('60');
  const [meetingStatus, setMeetingStatus] = useState('scheduled');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  
  // Task states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [taskOwner, setTaskOwner] = useState('');

  // Email states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailFrom, setEmailFrom] = useState('');

  // Deal form states
  const [dealFormData, setDealFormData] = useState({
    title: '',
    value: '',
    probability: '50',
    expectedCloseDate: '',
    description: '',
    stage: 'Proposal'
  });
  const [availableStages, setAvailableStages] = useState([
    { value: 'Lead', label: 'Lead' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'Closed Won', label: 'Closed Won' },
    { value: 'Closed Lost', label: 'Closed Lost' }
  ]);
  const [formLoading, setFormLoading] = useState(false);

  // Owner options for task assignment
  const ownerOptions = [
    { value: 'danush-tom', label: 'Danush Tom' },
    { value: 'john-smith', label: 'John Smith' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-davis', label: 'Mike Davis' },
    { value: 'emily-chen', label: 'Emily Chen' }
  ];

  // Load pipeline stages when component mounts
  useEffect(() => {
    const loadPipelineStages = async () => {
      try {
        console.log('🔄 Loading pipeline stages...');
        const pipelineResponse = await api.get('/pipelines');
        console.log('📥 Pipeline response:', pipelineResponse);
        
        if (pipelineResponse.success && (pipelineResponse.data as any).pipelines.length > 0) {
          const defaultPipeline = (pipelineResponse.data as any).pipelines[0];
          console.log('🔍 Default pipeline:', defaultPipeline);
          
          if (defaultPipeline.stages && defaultPipeline.stages.length > 0) {
            const stages = defaultPipeline.stages.map((stage: any) => ({
              value: stage.name, // Use stage name instead of _id
              label: stage.name
            }));
            console.log('✅ Loaded stages:', stages);
            setAvailableStages(stages);
          } else {
            console.log('⚠️ No stages found in pipeline');
          }
        } else {
          console.log('⚠️ No pipelines found or API failed');
        }
      } catch (error) {
        console.error('❌ Error loading pipeline stages:', error);
        // Keep default stages if API fails
      }
    };

    loadPipelineStages();
  }, []);

  const handleCall = () => {
    if (company.phone) {
      window.open(`tel:${company.phone}`, '_self');
    } else {
      alert('No phone number available for this company.');
    }
  };

  const handleEmail = () => {
    if (company.email) {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = currentUser.email || 'user@accelsender.in';
      const userName = currentUser.firstName || 'User';
      
      setEmailTo(company.email);
      setEmailFrom(`${userName} <${userEmail}>`);
      setShowEmailModal(true);
    } else {
      alert('No email address available for this company.');
    }
  };

  const handleViewWebsite = () => {
    if (company.website) {
      window.open(company.website, '_blank');
    } else {
      alert('No website available for this company.');
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meetingTitle.trim() || !meetingDate || !meetingTime || !meetingAttendees.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      
      const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
      const scheduledAt = meetingDateTime.toISOString();
      
      // Get current user from localStorage for userId
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const activityData = {
        type: 'meeting',
        title: meetingTitle,
        description: meetingNotes || `Meeting with ${company.name}`,
        companyId: company.id || company._id,
        priority: 'medium',
        scheduledAt: scheduledAt,
        duration: parseInt(meetingDuration),
        status: meetingStatus,
        userId: currentUser._id, // Required field for Activity model
        attendees: meetingAttendees,
        notes: meetingNotes
      };

      console.log('Creating meeting with data:', activityData);
      const response = await api.post('/activities', activityData);
      console.log('Meeting creation response:', response);
      
      if (response.success) {
        alert('Meeting scheduled successfully!');
        setShowMeetingModal(false);
        resetMeetingForm();
        onActionComplete?.();
      } else {
        alert('Failed to schedule meeting. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Please enter both title and content for the note.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user from localStorage for userId
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const activityData = {
        type: 'note',
        title: noteTitle,
        description: noteContent,
        companyId: company.id || company._id,
        priority: 'medium',
        userId: currentUser._id, // Required field for Activity model
        noteType: noteType
      };

      console.log('Creating note with data:', activityData);
      const response = await api.post('/activities', activityData);
      console.log('Note creation response:', response);
      
      if (response.success) {
        alert('Note added successfully!');
        setShowNoteModal(false);
        setNoteTitle('');
        setNoteContent('');
        setNoteType('general');
        onActionComplete?.();
      } else {
        alert('Failed to add note. Please try again.');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deal form input changes
  const handleDealInputChange = (field: string, value: string) => {
    setDealFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle creating new deals
  const handleCreateDeal = async () => {
    // Validation
    if (!dealFormData.title.trim()) {
      alert('Please enter a valid deal title.');
      return;
    }

    if (!dealFormData.value || isNaN(Number(dealFormData.value))) {
      alert('Please enter a valid deal value.');
      return;
    }

    try {
      setFormLoading(true);

      // Prepare deal data
      const dealData = {
        title: dealFormData.title.trim(),
        description: dealFormData.description.trim(),
        value: Number(dealFormData.value),
        probability: Number(dealFormData.probability),
        expectedCloseDate: dealFormData.expectedCloseDate ? new Date(dealFormData.expectedCloseDate).toISOString() : new Date().toISOString(),
        stageId: dealFormData.stage,
        companyId: company.id || company._id
      };
      
      console.log('📤 Sending deal data:', JSON.stringify(dealData, null, 2));
      console.log('🔍 Available stages:', availableStages);
      console.log('🔍 Selected stage:', dealFormData.stage);

      const result = await createDeal(dealData);
      if (result.success) {
        console.log('✅ Deal created successfully:', result);
        alert('Deal created successfully!');
        setShowDealModal(false);
        resetDealForm();
        console.log('🔄 Calling onActionComplete callback');
        onActionComplete?.();
      } else {
        console.error('❌ Deal creation failed:', result);
        alert(result.message || 'Failed to create deal. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Error creating deal:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create deal. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error creating deal: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      alert('Please enter both title and description for the task.');
      return;
    }

    if (!taskOwner) {
      alert('Please assign the task to someone.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user from localStorage for userId
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const activityData = {
        type: 'task',
        title: taskTitle,
        description: taskDescription,
        companyId: company.id || company._id,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        status: taskStatus === 'in progress' ? 'in_progress' : taskStatus,
        userId: currentUser._id // Required field for Activity model
      };
      
      // Validate data before sending
      if (!activityData.title || !activityData.title.trim()) {
        alert('Task title is required.');
        return;
      }
      
      if (!activityData.userId) {
        alert('User ID is required.');
        return;
      }
      
      if (!activityData.companyId) {
        alert('Company ID is required.');
        return;
      }

      console.log('Current user from localStorage:', currentUser);
      console.log('Creating task with data:', activityData);
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      console.log('Access token exists:', !!token);
      
      // Validate required fields
      if (!currentUser._id) {
        alert('User ID not found. Please log in again.');
        return;
      }
      
      if (!company.id && !company._id) {
        alert('Company ID not found. Please refresh the page.');
        return;
      }
      
      // Log the complete user object to see what fields are available
      console.log('🔍 Complete user object:', JSON.stringify(currentUser, null, 2));
      console.log('🔍 User organizationId:', currentUser.organizationId);
      
      // Check if user has organizationId
      if (!currentUser.organizationId) {
        console.warn('⚠️ User does not have organizationId set. This might cause issues.');
      }
      
      console.log('📤 Sending task data to backend:', JSON.stringify(activityData, null, 2));
      const response = await api.post('/activities', activityData);
      console.log('📥 Task creation response:', response);
      
      if (response.success) {
        alert('Task added successfully!');
        setShowTaskModal(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskDueDate('');
        setTaskPriority('medium');
        setTaskStatus('pending');
        setTaskOwner('');
        onActionComplete?.();
      } else {
        alert('Failed to add task. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Error adding task:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      
      // Extract detailed error message
      let errorMessage = 'Failed to add task. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // If it's a validation error, show more details
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map((err: any) => 
          `${err.path || err.field}: ${err.message}`
        ).join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
      }
      
      alert(`Error adding task: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Please enter both subject and body for the email.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if user has organizationId
      if (!currentUser.organizationId) {
        console.warn('⚠️ User does not have organizationId set. This might cause issues.');
      }
      
      const activityData = {
        type: 'email',
        title: emailSubject,
        description: emailBody,
        companyId: company.id || company._id,
        priority: 'medium',
        status: 'completed',
        userId: currentUser._id, // Required field for Activity model
        customFields: {
          emailFrom: emailFrom,
          emailTo: emailTo,
          emailSentAt: new Date().toISOString(),
          senderName: currentUser.firstName || 'User',
          senderEmail: currentUser.email || 'user@accelsender.in'
        }
      };
      
      // Validate data before sending
      if (!activityData.title || !activityData.title.trim()) {
        alert('Email subject is required.');
        return;
      }
      
      if (!activityData.description || !activityData.description.trim()) {
        alert('Email body is required.');
        return;
      }
      
      if (!activityData.userId) {
        alert('User ID is required.');
        return;
      }
      
      if (!activityData.companyId) {
        alert('Company ID is required.');
        return;
      }

      const response = await api.post('/activities', activityData);
      if (response.success) {
        alert('Email sent successfully!');
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailBody('');
        setEmailTo('');
        setEmailFrom('');
        onActionComplete?.();
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to send email. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // If it's a validation error, show more details
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map((err: any) => 
          `${err.path || err.field}: ${err.message}`
        ).join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
      }
      
      alert(`Error sending email: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetMeetingForm = () => {
    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingDuration('60');
    setMeetingStatus('scheduled');
    setMeetingAttendees('');
    setMeetingNotes('');
  };

  const resetNoteForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteType('general');
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskStatus('pending');
    setTaskOwner('');
  };

  const resetEmailForm = () => {
    setEmailSubject('');
    setEmailBody('');
    setEmailTo('');
    setEmailFrom('');
  };

  const resetDealForm = () => {
    setDealFormData({
      title: '',
      value: '',
      probability: '50',
      expectedCloseDate: '',
      description: '',
      stage: 'proposal'
    });
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
            disabled={loading || !company.phone}
            >
              Call {company.name}
            </Button>
          
            <Button
              variant="outline"
              onClick={handleEmail}
              iconName="Mail"
              iconPosition="left"
              className="w-full justify-start"
            disabled={loading || !company.email}
            >
              Send Email
            </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowMeetingModal(true)}
            iconName="Calendar"
            iconPosition="left"
            className="w-full justify-start"
            disabled={loading}
          >
            Schedule Meeting
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowNoteModal(true)}
            iconName="FileText"
            iconPosition="left"
            className="w-full justify-start"
            disabled={loading}
          >
            Add Note
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowTaskModal(true)}
            iconName="CheckSquare"
            iconPosition="left"
            className="w-full justify-start"
            disabled={loading}
          >
           Add Task
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDealModal(true)}
            iconName="DollarSign"
            iconPosition="left"
            className="w-full justify-start"
            disabled={loading}
          >
            Create Deal
          </Button>

          {company.website && (
            <Button
              variant="outline"
              onClick={handleViewWebsite}
              iconName="Globe"
              iconPosition="left"
              className="w-full justify-start"
              disabled={loading}
            >
              Visit Website
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Schedule Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Enter meeting title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date *</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time *</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <select
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="15">10 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">45 minutes</option>
                    <option value="90">60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={meetingStatus}
                    onChange={(e) => setMeetingStatus(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Attendees *</label>
                <input
                  type="text"
                  value={meetingAttendees}
                  onChange={(e) => setMeetingAttendees(e.target.value)}
                  placeholder="Enter attendees (comma separated)"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Meeting notes (optional)"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                onClick={() => {
                  setShowMeetingModal(false);
                  resetMeetingForm();
                }}
                disabled={loading}
                >
                  Cancel
                </Button>
              <Button
                variant="default"
                onClick={handleScheduleMeeting}
                disabled={loading}
              >
                {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Add Note</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Note Type
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Note Content *
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note content here..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNoteModal(false);
                  resetNoteForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddNote}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Create Deal</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Deal Title *</label>
                <input
                  type="text"
                  value={dealFormData.title}
                  onChange={(e) => handleDealInputChange('title', e.target.value)}
                  placeholder="Enter deal title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Value (INR) *</label>
                  <input
                    type="number"
                    value={dealFormData.value}
                    onChange={(e) => handleDealInputChange('value', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Probability (%)</label>
                  <input
                    type="number"
                    value={dealFormData.probability}
                    onChange={(e) => handleDealInputChange('probability', e.target.value)}
                    placeholder="50"
                    min="0"
                    max="100"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Stage *</label>
                <select
                  value={dealFormData.stage}
                  onChange={(e) => handleDealInputChange('stage', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {availableStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Expected Close Date</label>
                <input
                  type="date"
                  value={dealFormData.expectedCloseDate}
                  onChange={(e) => handleDealInputChange('expectedCloseDate', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={dealFormData.description}
                  onChange={(e) => handleDealInputChange('description', e.target.value)}
                  placeholder="Deal description (optional)"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDealModal(false);
                  resetDealForm();
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleCreateDeal}
                disabled={formLoading}
              >
                {formLoading ? 'Creating...' : 'Create Deal'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Add Task</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Task Description *</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Assign To *</label>
                <select
                  value={taskOwner}
                  onChange={(e) => setTaskOwner(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select an owner...</option>
                  {ownerOptions.map((owner) => (
                    <option key={owner.value} value={owner.value}>
                      {owner.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTaskModal(false);
                  resetTaskForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddTask}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Send Email</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">From</label>
                <input
                  type="email"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="From email address"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">To</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="To email address"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Subject *</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Message *</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email message"
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                onClick={() => {
                  setShowEmailModal(false);
                  resetEmailForm();
                }}
                disabled={loading}
                >
                  Cancel
                </Button>
              <Button
                variant="default"
                onClick={handleSendEmail}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActionsPanel;

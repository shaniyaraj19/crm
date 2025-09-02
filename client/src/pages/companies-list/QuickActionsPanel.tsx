import React, { useState } from "react";
import Button from "../../components/ui/Button";

const QuickActionsPanel = ({
  company,
  onAddDeal,
  onAddNote,
  onAddTask,
  onAddSchedule,
  onCallActivity,
  onEmailActivity,
  onMeetingActivity,
  onNoteActivity,
  onTaskActivity,
}: {
  company: any;
  onAddDeal?: () => void;
  onAddNote: (note: any) => void;
  onAddTask: (task: any) => void;
  onAddSchedule?: (schedule: any) => void;
  onCallActivity?: () => void;
  onEmailActivity?: () => void;
  onMeetingActivity?: (meetingData: any) => void;
  onNoteActivity?: (noteData: any) => void;
  onTaskActivity?: (taskData: any) => void;
}) => {
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30",
    attendees: "",
    notes: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as const,
    assignedTo: "",
    status: "pending" as const,
  });

  const [noteForm, setNoteForm] = useState({
    content: "",
    type: "general" as const,
  });

  const handleCall = () => {
    window.open(`tel:${company.phone}`, "_self");
    onCallActivity?.();
  };
  const handleEmail = () => {
    window.open(`mailto:${company.email}`, "_self");
    onEmailActivity?.();
  };
  const handleScheduleMeeting = () => setShowMeetingModal(true);
  const handleAddNote = () => setShowNoteModal(true);
  const handleCreateDeal = () => {
    onAddDeal?.();
  };
  const handleAddTask = () => setShowTaskModal(true);
  const handleViewWebsite = () =>
    company.website && window.open(company.website, "_blank");

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createSchedule } = await import("../../services/schedules");
      const response = await createSchedule({
        meetingTitle: meetingForm.title,
        date: meetingForm.date,
        time: meetingForm.time,
        duration: parseInt(meetingForm.duration) as 10 | 30 | 45 | 60,
        attendees: meetingForm.attendees,
        notes: meetingForm.notes,
        companyId: company.id || company._id,
        status: "scheduled",
      });

      if (response && typeof response === "object" && "_id" in response) {
        onAddSchedule?.(response);
        onMeetingActivity?.(meetingForm);
        setMeetingForm({
          title: "",
          date: "",
          time: "",
          duration: "30",
          attendees: "",
          notes: "",
        });
        setShowMeetingModal(false);
      } else {
        alert("Failed to create schedule. Please try again.");
      }
    } catch {
      alert("Failed to create schedule. Please try again.");
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createTask } = await import("../../services/tasks");
      const response = await createTask({
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo,
        companyId: company.id || company._id,
        status: "pending",
      });

      if (response && typeof response === "object" && "_id" in response) {
        onAddTask(response);
        onTaskActivity?.(taskForm);
        setTaskForm({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          assignedTo: "",
          status: "pending",
        });
        setShowTaskModal(false);
      } else {
        alert("Failed to create task. Please try again.");
      }
    } catch {
      alert("Failed to create task. Please try again.");
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createNote } = await import("../../services/notes");
      const response = await createNote({
        content: noteForm.content,
        type: noteForm.type,
        companyId: company.id || company._id,
      });

      if (response && typeof response === "object" && "_id" in response) {
        onAddNote(response);
        onNoteActivity?.(noteForm);
        setNoteForm({ content: "", type: "general" });
        setShowNoteModal(false);
      } else {
        alert("Failed to create note. Please try again.");
      }
    } catch {
      alert("Failed to create note. Please try again.");
    }
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
                <label className="block text-sm font-medium mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, title: e.target.value })
                  }
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
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={meetingForm.duration}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Attendees (comma-separated)
                </label>
                <input
                  type="text"
                  value={meetingForm.attendees}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      attendees: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Schedule Meeting
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1"
                >
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
                <label className="block text-sm font-medium mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, assignedTo: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Team member name"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Create Task
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1"
                >
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
                <label className="block text-sm font-medium mb-1">
                  Note Type
                </label>
                <select
                  value={noteForm.type}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="general">General</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Note Content
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Enter your note here..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Add Note
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1"
                >
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

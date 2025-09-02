import React, { useState, useEffect } from "react";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

import { createNote, getNotes } from "src/services/notes";
import { Activity } from "../../services/activities";
import {
  getCompanyFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  FileRecord,
  formatFileSize,
  getFilePreviewBlobUrl,
} from "../../services/files";

interface CompanyTabsProps {
  company: any;
  deals?: Array<{
    id?: string;
    _id?: string;
    name: string;
    value: number;
    stage?: string;
    stageName?: string;
    probability: number;
    closeDate: string;
    owner?: string;
  }>;
  activities?: Activity[];
  onAddTask?: (task: any) => void;
  taskRefreshTrigger?: number;
  onAddSchedule?: (schedule: any) => void;
  scheduleRefreshTrigger?: number;
  onAddNote?: (note: any) => void;
  noteRefreshTrigger?: number;
  onEditDeal?: (deal: any) => void;
  onDeleteDeal?: (dealId: string) => void;
}

const CompanyTabs = ({
  company,
  deals = [],
  activities = [],
  onAddTask,
  taskRefreshTrigger,
  onAddSchedule,
  scheduleRefreshTrigger,
  onAddNote,
  noteRefreshTrigger,
  onEditDeal,
  onDeleteDeal,
}: CompanyTabsProps) => {
  const [activeTab, setActiveTab] = useState("activities");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    assignedTo: "",
  });

  // Schedules state
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    meetingTitle: "",
    date: "",
    time: "",
    duration: 30 as 10 | 30 | 45 | 60,
    attendees: "",
    notes: "",
  });

  // Edit note state
  const [editingNote, setEditingNote] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    content: "",
    type: "general" as "general" | "meeting" | "call" | "email",
  });

  // Edit task state
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    assignedTo: "",
    status: "pending" as "pending" | "in-progress" | "completed",
  });

  // Edit schedule state
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editScheduleForm, setEditScheduleForm] = useState({
    meetingTitle: "",
    date: "",
    time: "",
    duration: 30 as 10 | 30 | 45 | 60,
    attendees: "",
    notes: "",
    status: "scheduled" as "scheduled" | "completed" | "cancelled",
  });

  const tabs = [
    { id: "activities", label: "Activities", icon: "Activity" },
    { id: "deals", label: "Deals", icon: "DollarSign" },
    { id: "tasks", label: "Tasks", icon: "CheckSquare" },
    { id: "schedules", label: "Schedules", icon: "Calendar" },
    { id: "notes", label: "Notes", icon: "FileText" },
    { id: "files", label: "Files", icon: "Paperclip" },
  ];

  // Function to fetch notes from the API
  const fetchNotes = async () => {
    if (!company?.id && !company?._id) return;

    try {
      setNotesLoading(true);
      const companyId = company.id || company._id;

      const response = await getNotes(companyId);

      if (response && Array.isArray(response)) {
        setNotes(response);
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success
      ) {
        const responseData = response as any;
        setNotes(responseData.data || []);
      }
    } catch (error) {
      // Error fetching notes
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!company?.id && !company?._id) return;

    try {
      setTasksLoading(true);
      const companyId = company.id || company._id;

      const { getTasks } = await import("src/services/tasks");
      const response = await getTasks(companyId);

      if (response && Array.isArray(response)) {
        setTasks(response);
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success
      ) {
        const responseData = response as any;
        setTasks(responseData.data || []);
      }
    } catch (error) {
      // Error fetching tasks
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!company?.id && !company?._id) return;

    try {
      setSchedulesLoading(true);
      const companyId = company.id || company._id;

      const { getSchedules } = await import("src/services/schedules");
      const response = await getSchedules(companyId);

      if (response && Array.isArray(response)) {
        setSchedules(response);
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success
      ) {
        const responseData = response as any;
        setSchedules(responseData.data || []);
      }
    } catch (error) {
      // Error fetching schedules
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Files state
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (activeTab === "notes") {
      fetchNotes();
    }
    if (activeTab === "tasks") {
      fetchTasks();
    }
    if (activeTab === "schedules") {
      fetchSchedules();
    }
    if (activeTab === "files") {
      fetchFiles();
    }
  }, [company?.id, company?._id, activeTab]);

  useEffect(() => {
    if (taskRefreshTrigger && taskRefreshTrigger > 0) {
      fetchTasks();
    }
  }, [taskRefreshTrigger]);

  useEffect(() => {
    if (scheduleRefreshTrigger && scheduleRefreshTrigger > 0) {
      fetchSchedules();
    }
  }, [scheduleRefreshTrigger]);

  // Listen for note refresh trigger from parent
  useEffect(() => {
    if (noteRefreshTrigger && noteRefreshTrigger > 0) {
      fetchNotes();
    }
  }, [noteRefreshTrigger]);

  // Function to fetch files from the API
  const fetchFiles = async () => {
    if (!company?.id && !company?._id) return;

    try {
      setFilesLoading(true);
      const companyId = company.id || company._id;

      const response = await getCompanyFiles(companyId);

      setFiles(response.data.files || []);
    } catch (error) {
      // Error fetching files
    } finally {
      setFilesLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "FileText";
      case "docx":
        return "FileText";
      case "xlsx":
        return "FileSpreadsheet";
      default:
        return "File";
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800";
      case "docx":
      case "doc":
        return "bg-blue-100 text-blue-800";
      case "xlsx":
      case "xls":
        return "bg-green-100 text-green-800";
      case "pptx":
      case "ppt":
        return "bg-orange-100 text-orange-800";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "bg-purple-100 text-purple-800";
      case "mp4":
      case "avi":
      case "mov":
        return "bg-indigo-100 text-indigo-800";
      case "mp3":
      case "wav":
      case "aac":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingFile(true);
      setUploadProgress(0);

      const companyId = company.id || company._id;

      const response = await uploadFile(selectedFile, {
        companyId: companyId,
      });

      setFiles((prev) => [response.data.file, ...prev]);
      setSelectedFile(null);
      setUploadProgress(100);

      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploadingFile(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileDownload = async (file: FileRecord) => {
    try {
      const blob = await downloadFile(file._id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download file. Please try again.");
    }
  };

  const handleFilePreview = async (file: FileRecord) => {
    try {
      setPreviewLoading(true);
      setPreviewFile(file);
      setShowFilePreview(true);

      // Generate blob URL for preview
      const blobUrl = await getFilePreviewBlobUrl(file._id);
      setPreviewBlobUrl(blobUrl);
    } catch (error) {
      alert("Failed to open file preview. Please try again.");
      setShowFilePreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      try {
        await deleteFile(fileId);
        setFiles((prev) => prev.filter((f) => f._id !== fileId));
      } catch (error) {
        alert("Failed to delete file. Please try again.");
      }
    }
  };

  const handleClosePreview = () => {
    // Clean up blob URL to prevent memory leaks
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setShowFilePreview(false);
    setPreviewFile(null);
    setPreviewLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const response = await createNote({
          content: newNote,
          companyId: company.id || company._id,
          type: "general",
        });

        if (response && typeof response === "object" && "_id" in response) {
          setNewNote("");
          await fetchNotes();
        }
      } catch (error) {
        // Error creating note
      }
    }
  };

  const handleEditNote = async (note: any) => {
    try {
      setEditingNote(note);
      setEditForm({
        content: note.content,
        type: note.type,
      });
      setShowEditModal(true);
    } catch (error) {
      // Error opening edit modal
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this note? This action cannot be undone."
        )
      ) {
        const { deleteNote } = await import("src/services/notes");
        const response = await deleteNote(noteId);

        if (response && typeof response === "object" && "success" in response) {
          const responseData = response as any;
          if (responseData.success) {
            await fetchNotes();
          } else {
            alert(
              `Failed to delete note: ${
                responseData.message || "Unknown error"
              }`
            );
          }
        } else {
          await fetchNotes();
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(`Failed to delete note: ${error.response.data.message}`);
      } else {
        alert("Failed to delete note. Please try again.");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editForm.content.trim()) return;

    try {
      const { updateNote } = await import("src/services/notes");
      const response = await updateNote(editingNote._id, {
        content: editForm.content,
        type: editForm.type,
        companyId: editingNote.companyId,
      });

      if (response) {
        setShowEditModal(false);
        setEditingNote(null);
        setEditForm({ content: "", type: "general" });
        await fetchNotes();
      }
    } catch (error: any) {
      alert("Failed to update note. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingNote(null);
    setEditForm({ content: "", type: "general" });
  };

  // Task handlers
  const handleAddTask = async () => {
    if (
      !newTask.title.trim() ||
      !newTask.description.trim() ||
      !newTask.dueDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { createTask } = await import("src/services/tasks");
      const response = await createTask({
        ...newTask,
        companyId: company.id || company._id,
      });

      if (response && typeof response === "object" && "_id" in response) {
        setNewTask({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          assignedTo: "",
        });
        await fetchTasks();
      } else {
        alert("Failed to create task. Please try again.");
      }
    } catch (error: any) {
      alert("Failed to create task. Please try again.");
    }
  };

  const handleEditTask = async (task: any) => {
    try {
      setEditingTask(task);
      setEditTaskForm({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        priority: task.priority,
        assignedTo:
          task.assignedTo?.id || task.assignedTo?._id || task.assignedTo || "",
        status: task.status,
      });
      setShowEditTaskModal(true);
    } catch (error) {
      // Error opening edit task modal
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this task? This action cannot be undone."
        )
      ) {
        const { deleteTask } = await import("src/services/tasks");
        const response = await deleteTask(taskId);

        if (
          response &&
          typeof response === "object" &&
          "success" in response &&
          response.success
        ) {
          await fetchTasks();
        } else {
          alert("Failed to delete task. Please try again.");
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(`Failed to delete task: ${error.response.data.message}`);
      } else {
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleSaveTaskEdit = async () => {
    if (
      !editingTask ||
      !editTaskForm.title.trim() ||
      !editTaskForm.description.trim() ||
      !editTaskForm.dueDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { updateTask } = await import("src/services/tasks");
      const response = await updateTask(editingTask._id, {
        title: editTaskForm.title,
        description: editTaskForm.description,
        dueDate: editTaskForm.dueDate,
        priority: editTaskForm.priority,
        assignedTo: editTaskForm.assignedTo,
        status: editTaskForm.status,
        companyId: editingTask.companyId,
      });

      if (response) {
        setShowEditTaskModal(false);
        setEditingTask(null);
        setEditTaskForm({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          assignedTo: "",
          status: "pending",
        });
        await fetchTasks();
      }
    } catch (error: any) {
      alert("Failed to update task. Please try again.");
    }
  };

  const handleCancelTaskEdit = () => {
    setShowEditTaskModal(false);
    setEditingTask(null);
    setEditTaskForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assignedTo: "",
      status: "pending",
    });
  };

  // Schedule handlers
  const handleAddSchedule = async () => {
    if (
      !newSchedule.meetingTitle.trim() ||
      !newSchedule.date ||
      !newSchedule.time ||
      !newSchedule.attendees.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { createSchedule } = await import("src/services/schedules");
      const response = await createSchedule({
        ...newSchedule,
        companyId: company.id || company._id,
      });

      if (response && typeof response === "object" && "_id" in response) {
        setNewSchedule({
          meetingTitle: "",
          date: "",
          time: "",
          duration: 30,
          attendees: "",
          notes: "",
        });
        await fetchSchedules();
      } else {
        alert("Failed to create schedule. Please try again.");
      }
    } catch (error: any) {
      alert("Failed to create schedule. Please try again.");
    }
  };

  const handleEditSchedule = async (schedule: any) => {
    try {
      setEditingSchedule(schedule);
      setEditScheduleForm({
        meetingTitle: schedule.meetingTitle,
        date: schedule.date
          ? new Date(schedule.date).toISOString().split("T")[0]
          : "",
        time: schedule.time,
        duration: schedule.duration,
        attendees: schedule.attendees,
        notes: schedule.notes || "",
        status: schedule.status,
      });
      setShowEditScheduleModal(true);
    } catch (error) {
      // Error opening edit schedule modal
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this schedule? This action cannot be undone."
        )
      ) {
        const { deleteSchedule } = await import("src/services/schedules");
        const response = await deleteSchedule(scheduleId);

        if (
          response &&
          typeof response === "object" &&
          "success" in response &&
          response.success
        ) {
          await fetchSchedules();
        } else {
          alert("Failed to delete schedule. Please try again.");
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(`Failed to delete schedule: ${error.response.data.message}`);
      } else {
        alert("Failed to delete schedule. Please try again.");
      }
    }
  };

  const handleSaveScheduleEdit = async () => {
    if (
      !editingSchedule ||
      !editScheduleForm.meetingTitle.trim() ||
      !editScheduleForm.date ||
      !editScheduleForm.time ||
      !editScheduleForm.attendees.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { updateSchedule } = await import("src/services/schedules");
      const response = await updateSchedule(editingSchedule._id, {
        meetingTitle: editScheduleForm.meetingTitle,
        date: editScheduleForm.date,
        time: editScheduleForm.time,
        duration: editScheduleForm.duration,
        attendees: editScheduleForm.attendees,
        notes: editScheduleForm.notes,
        status: editScheduleForm.status,
        companyId: editingSchedule.companyId,
      });

      if (response) {
        setShowEditScheduleModal(false);
        setEditingSchedule(null);
        setEditScheduleForm({
          meetingTitle: "",
          date: "",
          time: "",
          duration: 30,
          attendees: "",
          notes: "",
          status: "scheduled",
        });
        await fetchSchedules();
      }
    } catch (error: any) {
      alert("Failed to update schedule. Please try again.");
    }
  };

  const handleCancelScheduleEdit = () => {
    setShowEditScheduleModal(false);
    setEditingSchedule(null);
    setEditScheduleForm({
      meetingTitle: "",
      date: "",
      time: "",
      duration: 30,
      attendees: "",
      notes: "",
      status: "scheduled",
    });
  };

  // Deal handlers
  const handleEditDeal = (deal: any) => {
    if (onEditDeal) {
      onEditDeal(deal);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    if (onDeleteDeal) {
      onDeleteDeal(dealId);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "activities":
        return (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon
                    name={
                      activity.type === "call"
                        ? "Phone"
                        : activity.type === "email"
                        ? "Mail"
                        : activity.type === "meeting"
                        ? "Users"
                        : activity.type === "task"
                        ? "CheckSquare"
                        : activity.type === "note"
                        ? "FileText"
                        : activity.type === "deal"
                        ? "DollarSign"
                        : "Activity"
                    }
                    size={16}
                    className="text-primary"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(
                        activity.createdAt
                          ? new Date(activity.createdAt)
                          : new Date()
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>
                      {typeof activity.createdBy === "object" &&
                      activity.createdBy?.firstName
                        ? `${activity.createdBy.firstName} ${activity.createdBy.lastName}`
                        : typeof activity.createdBy === "string"
                        ? activity.createdBy
                        : "Unknown User"}
                    </span>
                    {activity.duration && (
                      <>
                        <span>•</span>
                        <span>{activity.duration} min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "deals":
        return (
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="DollarSign"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p className="text-lg font-medium">No deals yet</p>
                <p className="text-sm">
                  Create your first deal using the Quick Actions panel
                </p>
              </div>
            ) : (
              deals.map((deal) => (
                <div key={deal.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {deal.name}
                      </h4>
                      <span className="text-lg font-semibold text-foreground">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDeal(deal)}
                        iconName="Edit"
                        iconPosition="left"
                        className="h-8 px-2 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteDeal(deal.id || deal._id || "")
                        }
                        iconName="Trash2"
                        iconPosition="left"
                        className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stage</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-medium capitalize ${
                          (deal.stageName || deal.stage) === "Onboarding"
                            ? "bg-blue-100 text-blue-800"
                            : (deal.stageName || deal.stage) ===
                              "Implementation"
                            ? "bg-amber-100 text-amber-800"
                            : (deal.stageName || deal.stage) === "Go-Live"
                            ? "bg-red-100 text-red-800"
                            : (deal.stageName || deal.stage) === "Success"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {deal.stageName || deal.stage || "Unknown Stage"}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Probability</p>
                      <p className="font-medium text-foreground">
                        {deal.probability}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Close Date</p>
                      <p className="font-medium text-foreground">
                        {deal.closeDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(deal.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg"></div>

            {tasksLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="CheckSquare"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p className="text-lg font-medium">No tasks yet</p>
                <p className="text-sm">Add your first task above</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id || task.id}
                  className="p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {task.title}
                      </h4>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        iconName="Edit"
                        iconPosition="left"
                        className="h-8 px-2 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task._id || task.id)}
                        iconName="Trash2"
                        iconPosition="left"
                        className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Due: {formatDate(new Date(task.dueDate))}</span>
                      <span>
                        Assigned to: {task.assignedTo || "Unassigned"}
                      </span>
                    </div>
                    <span>
                      Created by:{" "}
                      {task.createdBy?.firstName
                        ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
                        : "Unknown User"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "schedules":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg"></div>

            {schedulesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading schedules...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="Calendar"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p className="text-lg font-medium">No schedules yet</p>
                <p className="text-sm">Add your first schedule above</p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule._id || schedule.id}
                  className="p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {schedule.meetingTitle}
                      </h4>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          schedule.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : schedule.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {schedule.status}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {schedule.duration} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSchedule(schedule)}
                        iconName="Edit"
                        iconPosition="left"
                        className="h-8 px-2 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteSchedule(schedule._id || schedule.id)
                        }
                        iconName="Trash2"
                        iconPosition="left"
                        className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      <span className="text-foreground">
                        {new Date(schedule.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="text-foreground">{schedule.time}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted-foreground text-sm">
                      Attendees:{" "}
                    </span>
                    <span className="text-foreground text-sm">
                      {schedule.attendees}
                    </span>
                  </div>
                  {schedule.notes && (
                    <div className="mb-3">
                      <span className="text-muted-foreground text-sm">
                        Notes:{" "}
                      </span>
                      <span className="text-foreground text-sm">
                        {schedule.notes}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created by:{" "}
                    {schedule.createdBy?.firstName
                      ? `${schedule.createdBy.firstName} ${schedule.createdBy.lastName}`
                      : "Unknown User"}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "notes":
        return (
          <div className="space-y-4">
            {notesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading notes...</p>
              </div>
            ) : null}
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="FileText"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p className="text-lg font-medium">No notes yet</p>
                <p className="text-sm">Add your first note above</p>
              </div>
            ) : (
              <>
                {notes.map((note) => {
                  return (
                    <div
                      key={note._id || note.id}
                      className="p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">
                            {note.createdBy?.firstName
                              ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
                              : "Unknown User"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(
                              new Date(note.createdAt || note.timestamp)
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            iconName="Edit"
                            iconPosition="left"
                            className="h-8 px-2 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNote(note._id || note.id)
                            }
                            iconName="Trash2"
                            iconPosition="left"
                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-line">
                        {note.content}
                      </div>
                      {note.type && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            {note.type}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );

      case "files":
        return (
          <div className="space-y-4">
            {/* File Upload Section */}
            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border">
              <div className="text-center mb-4">
                <Icon
                  name="Upload"
                  size={32}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here or
                </p>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.aac"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="mb-3"
                >
                  Choose Files
                </Button>

                {selectedFile && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon
                          name={getFileIcon(
                            selectedFile.name.split(".").pop()?.toLowerCase() ||
                              "unknown"
                          )}
                          size={16}
                        />
                        <span className="text-sm font-medium">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        onClick={handleFileUpload}
                        disabled={uploadingFile}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                      >
                        {uploadingFile ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </div>
                    {uploadingFile && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Files List Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">
                Uploaded Files
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchFiles}
                disabled={filesLoading}
                className="h-8 w-8 p-0"
                title="Refresh files"
              >
                <Icon
                  name={filesLoading ? "Loader" : "RefreshCw"}
                  size={16}
                  className={filesLoading ? "animate-spin" : ""}
                />
              </Button>
            </div>

            {/* Files List */}
            {filesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="File"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p className="text-lg font-medium">No files uploaded yet</p>
                <p className="text-sm">Upload your first file above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon
                        name={getFileIcon(file.fileType)}
                        size={20}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <button
                          onClick={() => handleFilePreview(file)}
                          className="font-medium text-foreground truncate cursor-pointer transition-colors underline-offset-2"
                          title="Click to preview file"
                        >
                          {file.originalName}
                        </button>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getFileTypeColor(
                            file.fileType
                          )}`}
                        >
                          {file.fileType.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(Number(file.size))}</span>
                        <span>•</span>
                        <span>
                          Uploaded by{" "}
                          {typeof file.uploadedBy === "object" &&
                          file.uploadedBy?.firstName
                            ? `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`
                            : typeof file.uploadedBy === "string"
                            ? file.uploadedBy
                            : "Unknown User"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(new Date(file.createdAt))}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDownload(file)}
                        iconName="Download"
                        iconPosition="left"
                        className="h-8 px-2 text-xs"
                        title="Download"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDelete(file._id)}
                        iconName="Trash2"
                        iconPosition="left"
                        className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 w-full">
      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <nav
          className="flex space-x-6 px-4 sm:space-x-8 sm:px-6"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">{renderTabContent()}</div>

      {/* Edit Note Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Note</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Note Type
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as any })
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
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Enter your note here..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTaskEdit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={editTaskForm.title}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editTaskForm.dueDate}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={editTaskForm.priority}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
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
                    Status
                  </label>
                  <select
                    value={editTaskForm.status}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={editTaskForm.assignedTo}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        assignedTo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editTaskForm.description}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Enter task description..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelTaskEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Schedule</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveScheduleEdit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={editScheduleForm.meetingTitle}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        meetingTitle: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editScheduleForm.date}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={editScheduleForm.time}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration
                  </label>
                  <select
                    value={editScheduleForm.duration}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        duration: parseInt(e.target.value) as 10 | 30 | 45 | 60,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={editScheduleForm.status}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Attendees
                </label>
                <input
                  type="text"
                  value={editScheduleForm.attendees}
                  onChange={(e) =>
                    setEditScheduleForm({
                      ...editScheduleForm,
                      attendees: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={editScheduleForm.notes}
                  onChange={(e) =>
                    setEditScheduleForm({
                      ...editScheduleForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Enter meeting notes..."
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelScheduleEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewFile.originalName}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileDownload(previewFile)}
                  iconName="Download"
                  iconPosition="left"
                  className="text-sm"
                >
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClosePreview}
                  iconName="X"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading preview...</span>
                </div>
              ) : previewBlobUrl ? (
                <div className="w-full h-full">
                  {previewFile.mimetype.startsWith("image/") ? (
                    <img
                      src={previewBlobUrl}
                      alt={previewFile.originalName}
                      className="max-w-full max-h-full object-contain mx-auto"
                    />
                  ) : previewFile.mimetype === "application/pdf" ? (
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-96 border-0"
                      title={previewFile.originalName}
                    />
                  ) : previewFile.mimetype.startsWith("video/") ? (
                    <video
                      src={previewBlobUrl}
                      controls
                      className="max-w-full max-h-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : previewFile.mimetype.startsWith("audio/") ? (
                    <audio src={previewBlobUrl} controls className="w-full">
                      Your browser does not support the audio tag.
                    </audio>
                  ) : previewFile.mimetype.startsWith("text/") ? (
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-96 border-0"
                      title={previewFile.originalName}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Icon
                        name="File"
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-gray-600">
                        Preview not available for this file type
                      </p>
                      <Button
                        onClick={() => handleFileDownload(previewFile)}
                        className="mt-4"
                        iconName="Download"
                        iconPosition="left"
                      >
                        Download File
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon
                    name="AlertCircle"
                    size={48}
                    className="mx-auto mb-4 text-red-400"
                  />
                  <p className="text-red-600">Failed to load preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CompanyTabs;

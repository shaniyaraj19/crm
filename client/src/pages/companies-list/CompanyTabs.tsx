import React, { useState, useEffect } from "react";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

// Note: Using activities endpoint instead of separate note service
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
  taskRefreshTrigger?: number;
  scheduleRefreshTrigger?: number;
  noteRefreshTrigger?: number;
  onEditDeal?: (deal: any) => void;
  onDeleteDeal?: (dealId: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const CompanyTabs = ({
  company,
  deals = [],
  activities = [],

  taskRefreshTrigger,
  scheduleRefreshTrigger,
  noteRefreshTrigger,
  onEditDeal,
  onDeleteDeal,
  activeTab: externalActiveTab,
  onTabChange,
}: CompanyTabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState("activities");

  console.log(deals , 'deals');
  
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);


  // Schedules state
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);


  // Edit note state
  const [editingNote, setEditingNote] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
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

      const { api } = await import("src/services/api");
      const response = await api.get(`/activities/company/${companyId}?type=note`);

      console.log('Fetch Notes Response:', response);
      console.log('Company ID:', companyId);

      if (response && response.success && response.data) {
        const activities = (response.data as any).activities || [];
        console.log('Notes Activities:', activities);
        setNotes(activities);
      } else {
        console.log('No notes data found');
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
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

      console.log('Fetch Tasks Response:', response);
      console.log('Company ID:', companyId);

      if (response && (response as any).success && (response as any).data) {
        const activities = ((response as any).data as any).activities || [];
        console.log('Task Activities:', activities);
        setTasks(activities);
      } else {
        console.log('No tasks data found');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
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

      console.log('Fetch Schedules Response:', response);
      console.log('Company ID:', companyId);

      if (response && (response as any).success && (response as any).data) {
        const activities = ((response as any).data as any).activities || [];
        console.log('Schedule Activities:', activities);
        setSchedules(activities);
      } else {
        console.log('No schedules data found');
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
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
      console.log('🔄 Task refresh triggered:', taskRefreshTrigger);
      fetchTasks();
    }
  }, [taskRefreshTrigger]);

  useEffect(() => {
    if (scheduleRefreshTrigger && scheduleRefreshTrigger > 0) {
      console.log('🔄 Schedule refresh triggered:', scheduleRefreshTrigger);
      fetchSchedules();
    }
  }, [scheduleRefreshTrigger]);

  useEffect(() => {
    if (noteRefreshTrigger && noteRefreshTrigger > 0) {
      console.log('🔄 Note refresh triggered:', noteRefreshTrigger);
      fetchNotes();
    }
  }, [noteRefreshTrigger]);

  const fetchFiles = async () => {
    if (!company?.id && !company?._id) return;

    try {
      setFilesLoading(true);
      const companyId = company.id || company._id;

      const response = await getCompanyFiles(companyId);

      setFiles(response.data.files || []);
    } catch (error) {
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

  const getFileTypeColor = (type: string, filename?: string) => {
    if (!type) return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300";

    const fileType = type.toLowerCase().trim();

    if (filename) {
      const extension = filename.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "pdf":
          return "bg-gradient-to-r from-red-100 to-red-200 text-red-600 border border-red-300";
        case "docx":
        case "doc":
          return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border border-blue-300";
        case "xlsx":
        case "xls":
          return "bg-gradient-to-r from-green-100 to-green-200 text-green-600 border border-green-300";
        case "pptx":
        case "ppt":
          return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-600 border border-orange-300";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
        case "svg":
          return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 border border-purple-300";
        case "txt":
        case "md":
          return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300";
      }
    }
    switch (fileType) {
      case "image":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 border border-purple-300";
      case "document":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border border-blue-300";
      case "video":
        return "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 border border-indigo-300";
      case "audio":
        return "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-600 border border-pink-300";
      case "archive":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-600 border border-yellow-300";
      case "text":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300";
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300";
      case "meeting":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border border-blue-300";
      case "call":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-600 border border-green-300";
      case "email":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 border border-purple-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300";
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



  const handleEditNote = async (note: any) => {
    try {
      setEditingNote(note);
      setEditForm({
        title: note.title || "",
        content: note.description || note.content,
        type: note.customFields?.noteType || note.type || "general",
      });
      setShowEditModal(true);
    } catch (error) {}
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
    if (!editingNote || !editForm.title?.trim() || !editForm.content?.trim()) return;

    try {
      const { api } = await import("src/services/api");
      const response = await api.put(`/activities/${editingNote._id}`, {
        title: editForm.title,
        description: editForm.content,
        type: editForm.type,
        companyId: editingNote.companyId,
      });

      if (response && response.success) {
        setShowEditModal(false);
        setEditingNote(null);
        setEditForm({ title: "", content: "", type: "general" });
        await fetchNotes();
      }
    } catch (error: any) {
      alert("Failed to update note. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingNote(null);
    setEditForm({ title: "", content: "", type: "general" });
  };

  // Task handlers

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
          task.assignedTo || task.userId?.id || task.userId?._id || task.userId || "",
        status: task.status === 'in_progress' ? 'in-progress' : task.status,
      });
      setShowEditTaskModal(true);
    } catch (error) {}
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
      !editTaskForm.title?.trim() ||
      !editTaskForm.description?.trim() ||
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

  const handleEditSchedule = async (schedule: any) => {
    try {
      setEditingSchedule(schedule);
      setEditScheduleForm({
        meetingTitle: schedule.title || schedule.meetingTitle,
        date: schedule.scheduledAt 
          ? new Date(schedule.scheduledAt).toISOString().split("T")[0]
          : schedule.customFields?.meetingDate || "",
        time: schedule.scheduledAt 
          ? new Date(schedule.scheduledAt).toTimeString().split(" ")[0].substring(0, 5)
          : schedule.customFields?.meetingTime || "",
        duration: schedule.duration,
        attendees: schedule.customFields?.attendees || schedule.attendees || "",
        notes: schedule.description || schedule.notes || "",
        status: schedule.status,
      });
      setShowEditScheduleModal(true);
    } catch (error) {}
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
      !editScheduleForm.meetingTitle?.trim() ||
      !editScheduleForm.date ||
      !editScheduleForm.time ||
      !editScheduleForm.attendees?.trim()
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

  // Deal edit state
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [showEditDealModal, setShowEditDealModal] = useState(false);
  const [editDealForm, setEditDealForm] = useState({
    title: "",
    description: "",
    value: "",
    probability: "",
    expectedCloseDate: "",
    stage: "",
  });

  // Deal handlers
  const handleEditDeal = async (deal: any) => {
    try {
      setEditingDeal(deal);
      setEditDealForm({
        title: deal.name || deal.title || "",
        description: deal.description || "",
        value: deal.value?.toString() || "",
        probability: deal.probability?.toString() || "",
        expectedCloseDate: deal.closeDate || deal.expectedCloseDate || "",
        stage: deal.stageId || deal.stage || "",
      });
      setShowEditDealModal(true);
    } catch (error) {
      console.error('Error setting up deal edit:', error);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this deal? This action cannot be undone.")) {
        const { deleteDeal } = await import("../../services/deals");
        const response = await deleteDeal(dealId);

        if (response && response.success) {
          // Call parent callback to refresh deals
          if (onDeleteDeal) {
            onDeleteDeal(dealId);
          }
          alert("Deal deleted successfully!");
        } else {
          alert("Failed to delete deal. Please try again.");
        }
      }
    } catch (error: any) {
      console.error('Error deleting deal:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to delete deal. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error deleting deal: ${errorMessage}`);
    }
  };

  const handleSaveDealEdit = async () => {
    if (!editingDeal || !editDealForm.title?.trim() || !editDealForm.value || !editDealForm.probability) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { updateDeal } = await import("../../services/deals");
      const dealData = {
        title: editDealForm.title.trim(),
        description: editDealForm.description.trim(),
        value: Number(editDealForm.value),
        probability: Number(editDealForm.probability),
        expectedCloseDate: editDealForm.expectedCloseDate ? new Date(editDealForm.expectedCloseDate).toISOString() : new Date().toISOString(),
        stageId: editDealForm.stage,
      };

      const response = await updateDeal(editingDeal.id || editingDeal._id, dealData);

      if (response && response.success) {
        setShowEditDealModal(false);
        setEditingDeal(null);
        setEditDealForm({
          title: "",
          description: "",
          value: "",
          probability: "",
          expectedCloseDate: "",
          stage: "",
        });
        // Call parent callback to refresh deals
        if (onEditDeal) {
          onEditDeal(editingDeal);
        }
        alert("Deal updated successfully!");
      } else {
        alert("Failed to update deal. Please try again.");
      }
    } catch (error: any) {
      console.error('Error updating deal:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to update deal. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error updating deal: ${errorMessage}`);
    }
  };

  const handleCancelDealEdit = () => {
    setShowEditDealModal(false);
    setEditingDeal(null);
    setEditDealForm({
      title: "",
      description: "",
      value: "",
      probability: "",
      expectedCloseDate: "",
      stage: "",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "activities":
        return (
          <div className="space-y-4">
            {activities
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
              })
              .map((activity) => (
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
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-medium capitalize ${getActivityTypeColor(
                        activity.type
                      )}`}
                    >
                      {activity.type}
                    </span>
                  </div>
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
                <div key={deal.id} className="p-4 bg-muted/30 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {deal.name}
                      </h4>
                      {/* <span className="text-lg font-semibold text-foreground">
                        {formatCurrency(deal.value)}
                      </span> */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDeal(deal)}
                        iconName="Edit"
                        iconPosition="left"
                        className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                            ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border border-blue-300"
                            : (deal.stageName || deal.stage) ===
                              "Implementation"
                            ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-600 border border-amber-300"
                            : (deal.stageName || deal.stage) === "Go-Live"
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-600 border border-red-300"
                            : (deal.stageName || deal.stage) === "Success"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-600 border border-green-300"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300"
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
                  className="p-4 bg-muted/30 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {task.title}
                      </h4>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          task.priority === "high"
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-600 border border-red-300"
                            : task.priority === "medium"
                            ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-600 border border-yellow-300"
                            : "bg-gradient-to-r from-green-100 to-green-200 text-green-600 border border-green-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          task.status === "completed"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-600 border border-green-300"
                            : task.status === "in-progress"
                            ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border border-blue-300"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300"
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
                        className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                      <span>Due: {task.dueDate ? formatDate(new Date(task.dueDate)) : "No due date"}</span>
                      <span>
                        Assigned to: {task.assignedTo || task.userId?.firstName ? `${task.userId.firstName} ${task.userId.lastName}` : "Unassigned"}
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
                  className="p-4 bg-muted/30 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {schedule.title || schedule.meetingTitle}
                      </h4>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          schedule.status === "completed"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-600 border border-green-300"
                            : schedule.status === "cancelled"
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-600 border border-red-300"
                            : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border border-blue-300"
                        }`}
                      >
                        {schedule.status}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 border border-purple-300 rounded-full">
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
                        className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                        {schedule.scheduledAt ? new Date(schedule.scheduledAt).toLocaleDateString() : 
                         schedule.customFields?.meetingDate ? new Date(schedule.customFields.meetingDate).toLocaleDateString() : 
                         "No date set"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="text-foreground">
                        {schedule.scheduledAt ? new Date(schedule.scheduledAt).toLocaleTimeString() : 
                         schedule.customFields?.meetingTime || "No time set"}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted-foreground text-sm">
                      Attendees:{" "}
                    </span>
                    <span className="text-foreground text-sm">
                      {schedule.customFields?.attendees || schedule.attendees || "No attendees"}
                    </span>
                  </div>
                  {(schedule.description || schedule.notes) && (
                    <div className="mb-3">
                      <span className="text-muted-foreground text-sm">
                        Notes:{" "}
                      </span>
                      <span className="text-foreground text-sm">
                        {schedule.description || schedule.notes}
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
                      className="p-4 bg-muted/30 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-end mb-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            iconName="Edit"
                            iconPosition="left"
                            className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {note.title || 'Untitled Note'}
                        </h4>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-line">
                        {note.description || note.content}
                      </div>
                      <div className="mt-2 flex items-center space-x-3">
                        {(note.customFields?.noteType || note.type) && (
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full font-medium capitalize ${getActivityTypeColor(
                              note.customFields?.noteType || note.type
                            )}`}
                          >
                            {note.customFields?.noteType || note.type}
                          </span>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Created by: {note.createdBy?.firstName
                              ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
                              : "Unknown User"}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(
                              new Date(note.createdAt || note.timestamp)
                            )}
                          </span>
                        </div>
                      </div>
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
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                            file.fileType,
                            file.originalName
                          )}`}
                        >
                          {file.originalName.split(".").pop()?.toUpperCase() ||
                            file.fileType.toUpperCase()}
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
                        className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Edit Note</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Enter note title..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Note Type
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as any })
                  }
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
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  placeholder="Enter your note content here..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Edit Task</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Task Title *</label>
                <input
                  type="text"
                  value={editTaskForm.title}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter task title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Task Description *</label>
                <textarea
                  value={editTaskForm.description}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter task description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select
                    value={editTaskForm.priority}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={editTaskForm.status}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        status: e.target.value as any,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Due Date</label>
                  <input
                    type="date"
                    value={editTaskForm.dueDate}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        dueDate: e.target.value,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Assign To *</label>
                  <input
                    type="text"
                    value={editTaskForm.assignedTo}
                    onChange={(e) =>
                      setEditTaskForm({
                        ...editTaskForm,
                        assignedTo: e.target.value,
                      })
                    }
                    placeholder="Enter assignee name"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelTaskEdit}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveTaskEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Edit Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Meeting Title *</label>
                <input
                  type="text"
                  value={editScheduleForm.meetingTitle}
                  onChange={(e) =>
                    setEditScheduleForm({
                      ...editScheduleForm,
                      meetingTitle: e.target.value,
                    })
                  }
                  placeholder="Enter meeting title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date *</label>
                  <input
                    type="date"
                    value={editScheduleForm.date}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        date: e.target.value,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time *</label>
                  <input
                    type="time"
                    value={editScheduleForm.time}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        time: e.target.value,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <select
                    value={editScheduleForm.duration}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        duration: parseInt(e.target.value) as 10 | 30 | 45 | 60,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={editScheduleForm.status}
                    onChange={(e) =>
                      setEditScheduleForm({
                        ...editScheduleForm,
                        status: e.target.value as any,
                      })
                    }
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
                  value={editScheduleForm.attendees}
                  onChange={(e) =>
                    setEditScheduleForm({
                      ...editScheduleForm,
                      attendees: e.target.value,
                    })
                  }
                  placeholder="Enter attendees (comma separated)"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={editScheduleForm.notes}
                  onChange={(e) =>
                    setEditScheduleForm({
                      ...editScheduleForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Meeting notes (optional)"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelScheduleEdit}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveScheduleEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[60vw] h-[85vh] mx-4 overflow-hidden">
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
                  className="text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
            <div className="p-4 overflow-auto h-[calc(85vh-80px)]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading preview...</span>
                </div>
              ) : previewBlobUrl ? (
                <div className="w-full h-full">
                  {previewFile.mimetype.startsWith("image/") ? (
                    <div className="flex items-center justify-center h-full w-full">
                      <img
                        src={previewBlobUrl}
                        alt={previewFile.originalName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : previewFile.mimetype === "application/pdf" ? (
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-[calc(85vh-120px)] border-0"
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
                        className="mt-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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

      {/* Edit Deal Modal */}
      {showEditDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Edit Deal</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Deal Title *</label>
                <input
                  type="text"
                  value={editDealForm.title}
                  onChange={(e) =>
                    setEditDealForm({
                      ...editDealForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter deal title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={editDealForm.description}
                  onChange={(e) =>
                    setEditDealForm({
                      ...editDealForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter deal description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Value *</label>
                  <input
                    type="number"
                    value={editDealForm.value}
                    onChange={(e) =>
                      setEditDealForm({
                        ...editDealForm,
                        value: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Probability *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editDealForm.probability}
                    onChange={(e) =>
                      setEditDealForm({
                        ...editDealForm,
                        probability: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Close Date</label>
                  <input
                    type="date"
                    value={editDealForm.expectedCloseDate}
                    onChange={(e) =>
                      setEditDealForm({
                        ...editDealForm,
                        expectedCloseDate: e.target.value,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stage</label>
                  <select
                    value={editDealForm.stage}
                    onChange={(e) =>
                      setEditDealForm({
                        ...editDealForm,
                        stage: e.target.value,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Stage</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Implementation">Implementation</option>
                    <option value="Go-Live">Go-Live</option>
                    <option value="Success">Success</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelDealEdit}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveDealEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CompanyTabs;
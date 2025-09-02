import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { api } from "../../services/api";
import {
  getDealsByCompany,
  transformDealForFrontend,
  CreateDealRequest,
  createDeal,
} from "../../services/deals";
import {
  getActivities,
  createActivity,
  transformActivityForFrontend,
  Activity,
  CreateActivityRequest,
} from "../../services/activities";

import Header from "../../components/ui/Header";
import Sidebar from "../../components/ui/Sidebar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

import CompanyInfoCard from "./CompanyInfoCard";
import QuickActionsPanel from "./QuickActionsPanel";
import RelatedDealsCard from "./RelatedDealsCard";
import RecentActivityCard from "./RecentActivityCard";
import CompanyTabs from "./CompanyTabs";

const CompanyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [deals, setDeals] = useState<any[]>([]);

  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);
  const [noteRefreshTrigger, setNoteRefreshTrigger] = useState(0);

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Deal modal state
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealForm, setDealForm] = useState({
    name: "",
    value: "",
    stageId: "",
    probability: 25,
    closeDate: "",
    description: "",
  });
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [loadingPipelineStages, setLoadingPipelineStages] = useState(false);

  // Helpers

  const normalizeCompany = (c: any) =>
    c && {
      id: c._id || c.id,
      name: c.name || "",
      industry: c.industry || "",
      companySize: c.employeeCount
        ? `${c.employeeCount} employees`
        : c.companySize || "",
      status: c.type || c.status || "active",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      linkedin: c.linkedinUrl || c.linkedin || "",
      address: c.address
        ? `${c.address.street || ""}, ${c.address.city || ""}, ${
            c.address.state || ""
          } ${c.address.zipCode || ""}`
        : "",
      foundedYear: c.foundedYear || "",
      tags: c.tags || [],
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      owner: c.createdBy || "Unassigned",
    };

  // Loaders

  const loadCompany = async () => {
    try {
      setLoading(true);

      const stateCompany = (location as any)?.state?.company;
      if (stateCompany) {
        setCompany(normalizeCompany(stateCompany));
        return;
      }

      if (id) {
        const response = await api.get(`/companies/${id}`);
        if (response.success) {
          const c = (response.data as any)?.company || response.data;
          setCompany(normalizeCompany(c));
        }
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (isLoadingActivities) return;
    const companyId = company?.id || company?._id;
    if (!companyId) return;

    try {
      setIsLoadingActivities(true);

      const response = await getActivities({ companyId, limit: 50 });
      if (response.success && response.data?.activities) {
        setActivities(
          response.data.activities.map(transformActivityForFrontend)
        );
      } else {
        setActivities([]);
      }
    } catch (error) {
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const loadDeals = async () => {
    const companyId = company?.id || company?._id;
    if (!companyId) return;

    try {
      const response = await getDealsByCompany(companyId);

      if (response.success && response.data?.deals) {
        const transformedDeals = response.data.deals.map(
          transformDealForFrontend
        );
        setDeals(transformedDeals);
      } else {
        setDeals([]);
      }
    } catch (error) {
      setDeals([]);
    }
  };

  // Handlers (Deals)

  const handleShowDealModal = async () => {
    setEditingDeal(null);
    setDealForm({
      name: "",
      value: "",
      stageId: "",
      probability: 25,
      closeDate: "",
      description: "",
    });

    // Load pipeline stages first
    setLoadingPipelineStages(true);
    try {
      const { getDefaultPipeline } = await import("../../services/deals");
      const defaultPipeline = await getDefaultPipeline();
      if (defaultPipeline && defaultPipeline.stages) {
        setPipelineStages(defaultPipeline.stages);
        // Set default stage to first stage if available
        if (defaultPipeline.stages.length > 0) {
          const firstStage = defaultPipeline.stages[0];
          setDealForm((prev) => ({
            ...prev,
            stageId: firstStage._id,
            probability: firstStage.probability,
          }));
        }
      } else {
        alert("No pipeline stages available. Please create a pipeline first.");
        return;
      }
    } catch (error) {
      alert("Failed to load pipeline stages. Please try again.");
      return;
    } finally {
      setLoadingPipelineStages(false);
    }

    setShowDealModal(true);
  };

  const handleAddDeal = async (newDeal: any) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) {
        alert("Company ID not found. Please refresh the page and try again.");
        return;
      }

      const dealData: CreateDealRequest = {
        title: newDeal.name,
        value: newDeal.value,
        stageId: newDeal.stageId,
        probability: newDeal.probability,
        expectedCloseDate: newDeal.closeDate,
        description: newDeal.description,
        companyId,
      };

      const response = await createDeal(dealData);

      // Immediately update the UI
      await loadDeals();
      setShowDealModal(false);

      // Add activity for deal creation with the created deal data
      if (response.success && response.data?.deal) {
        const createdDeal = response.data.deal;
        handleDealActivity({
          _id: createdDeal._id,
          name: createdDeal.title,
          value: createdDeal.value,
          stageId: createdDeal.stageId,
        });
      } else if (response.success && response.data) {
        // Try alternative response structure
        const createdDeal = response.data as any;
        handleDealActivity({
          _id: createdDeal._id,
          name: createdDeal.title,
          value: createdDeal.value,
          stageId: createdDeal.stageId,
        });
      }

      // Show success message
      alert("Deal created successfully!");
    } catch (error: any) {
      let msg = "Failed to create deal. Please try again.";
      if (error.message?.includes("No pipelines available")) {
        msg = "No sales pipeline found. Please create a pipeline first.";
      } else if (error.message?.includes("Pipeline and stage information")) {
        msg = "Pipeline configuration error. Please contact support.";
      } else if (error.message?.includes("Failed to fetch pipelines")) {
        msg = "Network error. Please check your connection.";
      } else if (error.message) {
        msg = error.message;
      }
      alert(msg);
    }
  };

  const handleShowEditDeal = async (deal: any) => {
    setEditingDeal(deal);
    setDealForm({
      name: deal.name,
      value: deal.value.toString(),
      stageId: deal.stageId || deal.stage,
      probability: deal.probability || 25,
      closeDate: deal.closeDate,
      description: deal.description || "",
    });

    // Load pipeline stages
    setLoadingPipelineStages(true);
    try {
      const { getDefaultPipeline } = await import("../../services/deals");
      const defaultPipeline = await getDefaultPipeline();
      if (defaultPipeline && defaultPipeline.stages) {
        setPipelineStages(defaultPipeline.stages);
      } else {
        alert("No pipeline stages available. Please create a pipeline first.");
        return;
      }
    } catch (error) {
      alert("Failed to load pipeline stages. Please try again.");
      return;
    } finally {
      setLoadingPipelineStages(false);
    }

    setShowDealModal(true);
  };

  const handleEditDeal = async (updatedDeal: any) => {
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const companyId = company?.id || company?._id;

      if (!companyId || !objectIdRegex.test(companyId)) {
        alert("Invalid company ID format.");
        return;
      }

      const dealId = updatedDeal._id || updatedDeal.id;
      if (!objectIdRegex.test(dealId)) {
        alert("Invalid deal ID format.");
        return;
      }

      if (!deals.some((d) => d.id === dealId || d._id === dealId)) {
        alert("Deal not found. Please refresh.");
        return;
      }

      const dealData: any = {
        title: updatedDeal.name,
        value: updatedDeal.value,
        stageId: updatedDeal.stageId,
        probability: updatedDeal.probability,
        description: updatedDeal.description,
        companyId,
      };

      if (updatedDeal.closeDate) {
        const date = new Date(updatedDeal.closeDate);
        if (!isNaN(date.getTime())) {
          dealData.expectedCloseDate = date.toISOString();
        }
      }

      // Use the service function instead of raw fetch
      const { updateDeal } = await import("../../services/deals");
      await updateDeal(dealId, dealData);

      // Immediately update the UI
      await loadDeals();
      setShowDealModal(false);

      // Add activity for deal editing
      handleDealEditActivity(updatedDeal);

      alert("Deal updated successfully!");
    } catch (error: any) {
      alert(`Failed to update deal: ${error.message || "Unknown error"}`);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      // First, get the deal info to create activity before deletion
      const { getDeals } = await import("../../services/deals");
      const allDealsResponse = await getDeals();
      let dealInfo = null;

      if (allDealsResponse.success && allDealsResponse.data?.deals) {
        dealInfo = allDealsResponse.data.deals.find(
          (deal: any) => deal._id === dealId || deal.id === dealId
        );
      }

      // Use the service function instead of raw fetch
      const { deleteDeal } = await import("../../services/deals");
      await deleteDeal(dealId);

      // Immediately update the UI
      await loadDeals();

      // Add activity for deal deletion
      if (dealInfo) {
        handleDealDeleteActivity(dealId, dealInfo.title, dealInfo.value);
      }

      alert("Deal deleted successfully!");
    } catch (error: any) {
      alert(`Failed to delete deal: ${error.message || "Unknown error"}`);
    }
  };

  // Handlers (Company + Tabs)

  const handleSaveCompany = (updated: any) => {
    setCompany(updated);
    loadCompany();
  };

  const handleAddNote = () => setNoteRefreshTrigger((v) => v + 1);
  const handleAddTask = () => setTaskRefreshTrigger((v) => v + 1);
  const handleAddSchedule = () => setScheduleRefreshTrigger((v) => v + 1);

  // Activity handlers

  const handleCallActivity = async () => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const activityData: CreateActivityRequest = {
        title: `Call made to ${company?.name}`,
        description: `Outbound call completed with ${company?.name}`,
        type: "call",
        status: "completed",
        companyId,
        duration: 15,
      };

      await createActivity(activityData);
      await loadActivities(); // Reload activities from backend
    } catch (error) {
      // Error creating call activity
    }
  };

  const handleEmailActivity = async () => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const activityData: CreateActivityRequest = {
        title: `Email sent to ${company?.name}`,
        description: `Email sent to ${company?.email || "company contact"}`,
        type: "email",
        status: "completed",
        companyId,
        duration: 5,
      };

      await createActivity(activityData);
      await loadActivities(); // Reload activities from backend
    } catch (error) {
      // Error creating email activity
    }
  };

  const handleMeetingActivity = async (meetingData: any) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const activityData: CreateActivityRequest = {
        title: `Meeting scheduled: ${meetingData.title}`,
        description: `Meeting scheduled for ${meetingData.date} at ${meetingData.time} with ${meetingData.attendees}`,
        type: "meeting",
        status: "completed",
        companyId,
        duration: meetingData.duration || 60,
        dueDate: meetingData.date,
      };

      await createActivity(activityData);
      await loadActivities(); // Reload activities from backend
    } catch (error) {
    }
  };

  const handleNoteActivity = async (noteData: any) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const activityData: CreateActivityRequest = {
        title: `Note added: ${noteData.type}`,
        description:
          noteData.content?.substring(0, 100) +
          (noteData.content?.length > 100 ? "..." : ""),
        type: "note",
        status: "completed",
        companyId,
        notes: noteData.content,
      };

      await createActivity(activityData);
      await loadActivities(); // Reload activities from backend
    } catch (error) {
      // Error creating note activity
    }
  };

  const handleTaskActivity = async (taskData: any) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const activityData: CreateActivityRequest = {
        title: `Task created: ${taskData.title}`,
        description: `Task assigned to ${
          taskData.assignedTo || "Unassigned"
        } with ${taskData.priority} priority`,
        type: "task",
        status: "pending",
        companyId,
        dueDate: taskData.dueDate,
        duration: taskData.duration || 30,
      };

      await createActivity(activityData);
      await loadActivities(); // Reload activities from backend
    } catch (error) {
      // Error creating task activity
    }
  };

  const handleDealActivity = async (dealData: any) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) {
        return;
      }

      // Only create activity if we have a real deal ID (not a temporary one)
      const dealId =
        dealData._id ||
        (dealData.id && dealData.id.length === 24 ? dealData.id : null);
      if (!dealId) {
        return;
      }

      // Get stage name from pipeline stages
      const stageName =
        pipelineStages.find((stage) => stage._id === dealData.stageId)?.name ||
        "Unknown Stage";

      const activityData: CreateActivityRequest = {
        title: `Deal created: ${dealData.name}`,
        description: `New deal worth $${dealData.value} in ${stageName} stage`,
        type: "note",
        status: "completed",
        companyId,
        dealId,
      };

      await createActivity(activityData);
      await loadActivities();
    } catch (error) {
      // Error creating deal activity
    }
  };

  const handleDealEditActivity = async (dealData: any) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const dealId = dealData._id || dealData.id;
      if (!dealId) return;

      // Get stage name from pipeline stages
      const stageName =
        pipelineStages.find((stage) => stage._id === dealData.stageId)?.name ||
        "Unknown Stage";

      const activityData: CreateActivityRequest = {
        title: `Deal updated: ${dealData.name}`,
        description: `Deal worth $${dealData.value} was updated to ${stageName} stage`,
        type: "note",
        status: "completed",
        companyId,
        dealId,
      };

      await createActivity(activityData);
      await loadActivities();
    } catch (error) {
      // Error creating deal edit activity
    }
  };

  const handleDealDeleteActivity = async (
    _dealId: string,
    dealName: string,
    dealValue: number
  ) => {
    try {
      const companyId = company?.id || company?._id;
      if (!companyId) return;

      const activityData: CreateActivityRequest = {
        title: `Deal deleted: ${dealName}`,
        description: `Deal worth $${dealValue} was deleted`,
        type: "note",
        status: "completed",
        companyId,
      };

      await createActivity(activityData);
      await loadActivities();
    } catch (error) {
      // Error creating deal delete activity
    }
  };

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !dealForm.name ||
      !dealForm.value ||
      !dealForm.closeDate ||
      !dealForm.stageId
    ) {
      alert("Please fill in all required fields including stage");
      return;
    }

    const newDeal = {
      id: editingDeal ? editingDeal.id : Date.now().toString(),
      name: dealForm.name,
      value: Number(dealForm.value),
      stageId: dealForm.stageId,
      probability: dealForm.probability,
      closeDate: dealForm.closeDate,
      description: dealForm.description,
    };

    if (editingDeal) {
      await handleEditDeal(newDeal);
    } else {
      await handleAddDeal(newDeal);
    }
  };

  // Effects

  useEffect(() => {
    loadCompany();
  }, [id]);

  useEffect(() => {
    if ((company?.id || company?._id) && deals.length === 0) {
      loadDeals();
    }
  }, [company?.id, company?._id]);

  useEffect(() => {
    if ((company?.id || company?._id) && activities.length === 0) {
      loadActivities();
    }
  }, [company?.id, company?._id]);

  // UI States

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-6 py-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading company details...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-6 py-4 text-center">
            <h2 className="text-2xl font-semibold mb-4">Company Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/companies")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Companies
            </button>
          </main>
        </div>
      </div>
    );
  }

  // Main Render

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Breadcrumbs />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              <CompanyInfoCard company={company} onSave={handleSaveCompany} />
              <CompanyTabs
                company={company}
                deals={deals}
                activities={activities}
                onAddTask={handleAddTask}
                taskRefreshTrigger={taskRefreshTrigger}
                onAddSchedule={handleAddSchedule}
                scheduleRefreshTrigger={scheduleRefreshTrigger}
                onAddNote={handleAddNote}
                noteRefreshTrigger={noteRefreshTrigger}
                onEditDeal={handleShowEditDeal}
                onDeleteDeal={handleDeleteDeal}
              />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              <QuickActionsPanel
                company={company}
                onAddDeal={handleShowDealModal}
                onAddNote={handleAddNote}
                onAddTask={handleAddTask}
                onAddSchedule={handleAddSchedule}
                onCallActivity={handleCallActivity}
                onEmailActivity={handleEmailActivity}
                onMeetingActivity={handleMeetingActivity}
                onNoteActivity={handleNoteActivity}
                onTaskActivity={handleTaskActivity}
              />
              <RelatedDealsCard
                deals={deals}
                onAddDeal={handleShowDealModal}
                onEditDeal={handleShowEditDeal}
                onDeleteDeal={handleDeleteDeal}
              />
              <RecentActivityCard activities={activities} />
            </div>
          </div>
        </main>
      </div>

      {/* Deal Creation/Edit Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">
                {editingDeal ? "Edit Deal" : "Create New Deal"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDealModal(false)}
                className="h-8 w-8 p-0"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Deal Name *
                </label>
                <input
                  type="text"
                  value={dealForm.name}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="Enter deal name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Value *
                </label>
                <input
                  type="number"
                  value={dealForm.value}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, value: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="Enter deal value"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Stage *
                </label>
                <select
                  value={dealForm.stageId}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, stageId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                  disabled={loadingPipelineStages}
                >
                  <option value="">
                    {loadingPipelineStages
                      ? "Loading stages..."
                      : "Select a stage"}
                  </option>
                  {pipelineStages.map((stage) => (
                    <option key={stage._id} value={stage._id}>
                      {stage.name} ({stage.probability}%)
                    </option>
                  ))}
                </select>
                {loadingPipelineStages && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Loading pipeline stages...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Probability (%)
                </label>
                <input
                  type="number"
                  value={dealForm.probability}
                  onChange={(e) =>
                    setDealForm({
                      ...dealForm,
                      probability: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Close Date *
                </label>
                <input
                  type="date"
                  value={dealForm.closeDate}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, closeDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={dealForm.description}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder="Enter deal description"
                />
              </div>
            <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loadingPipelineStages || !dealForm.stageId}
                >
                  {editingDeal ? "Update Deal" : "Create Deal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDealModal(false)}
                  className="flex-1"
                  disabled={loadingPipelineStages}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CompanyDetails;

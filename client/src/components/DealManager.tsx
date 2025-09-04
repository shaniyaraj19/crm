import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { api } from '../services/api';
import { 
  getDealsByCompany, 
  transformDealForFrontend, 
  CreateDealRequest, 
  createDeal,
  Deal
} from '../services/deals';
interface DealManagerProps {
  companyId: string;
  onDealsUpdate?: (deals: Deal[]) => void;
  onDealActivity?: (dealData: any) => void;
  onShowDealModal?: () => void;
  showDealModalTrigger?: number;
}

const DealManager: React.FC<DealManagerProps> = ({
  companyId,
  onDealsUpdate,
  onDealActivity,
  onShowDealModal: _onShowDealModal,
  showDealModalTrigger,
}) => {
  const [, setDeals] = useState<Deal[]>([]);
  const [showDealModal, setShowDealModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    probability: '50',
    expectedCloseDate: '',
    description: '',
    stage: 'proposal'
  });

  const [availableStages, setAvailableStages] = useState([
    { value: 'proposal', label: 'Proposal' },
    { value: 'need analysis', label: 'Need Analysis' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'review', label: 'Review' },
    { value: 'closed won', label: 'Closed Won' },
    { value: 'closed lost', label: 'Closed Lost' }
  ]);
  const [formLoading, setFormLoading] = useState(false);

  // Load deals
  const loadDeals = async () => {
    if (!companyId) return;

    try {
      const response = await getDealsByCompany(companyId);

      if (response.success && response.data?.deals) {
        const transformedDeals = response.data.deals.map(transformDealForFrontend);
        setDeals(transformedDeals);
        onDealsUpdate?.(transformedDeals);
      } else {
        setDeals([]);
        onDealsUpdate?.([]);
      }
    } catch (error) {
      setDeals([]);
      onDealsUpdate?.([]);
    }
  };

  // Load pipeline stages
  const loadPipelineStages = async () => {
    try {
      const pipelineResponse = await api.get('/pipelines?isDefault=true');
      if (pipelineResponse.success && (pipelineResponse.data as any).pipelines.length > 0) {
        const defaultPipeline = (pipelineResponse.data as any).pipelines[0];
        if (defaultPipeline.stages && defaultPipeline.stages.length > 0) {
          const stages = defaultPipeline.stages.map((stage: any) => ({
            value: stage._id || stage.name,
            label: stage.name || stage._id
          }));
          setAvailableStages(stages);
          return stages;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading pipeline stages:', error);
      return null;
    }
  };

  // Show deal modal for creation
  const handleShowDealModal = async () => {
    setFormData({
      title: '',
      value: '',
      probability: '50',
      expectedCloseDate: '',
      description: '',
      stage: 'proposal'
    });

    await loadPipelineStages();
    setShowDealModal(true);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new deal
  const handleAddDeal = async (newDeal: any) => {
    try {
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
        onDealActivity?.({
          _id: createdDeal._id,
          name: createdDeal.title,
          value: createdDeal.value,
          stageId: createdDeal.stageId,
        });
      } else if (response.success && response.data) {
        // Try alternative response structure
        const createdDeal = response.data as any;
        onDealActivity?.({
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



  // Handle deal form submission
  const handleDealSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a valid deal title.');
      return;
    }

    if (!formData.value || isNaN(Number(formData.value))) {
      alert('Please enter a valid deal value.');
      return;
    }

    try {
      setFormLoading(true);

      // Prepare deal data
      const dealData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        stageId: formData.stage,
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString() : undefined,
        value: Number(formData.value),
        probability: Number(formData.probability),
        companyId: companyId,
        currency: 'INR',
        priority: 'medium'
      };
      
      // Get pipeline ID for new deals
      try {
        const pipelineResponse = await api.get('/pipelines?isDefault=true');
        if (pipelineResponse.success && (pipelineResponse.data as any).pipelines.length > 0) {
          const defaultPipeline = (pipelineResponse.data as any).pipelines[0];
          dealData.pipelineId = defaultPipeline._id;
        }
      } catch (error) {
        console.error('Error getting pipeline:', error);
      }

      await handleAddDeal(dealData);
    } catch (error) {
      console.error('Error in deal form submission:', error);
      alert('Failed to save deal. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle close modal
  const handleClose = () => {
    setFormData({
      title: '',
      value: '',
      probability: '50',
      expectedCloseDate: '',
      description: '',
      stage: 'proposal'
    });
    setShowDealModal(false);
  };



  // Load deals when component mounts or companyId changes
  useEffect(() => {
    if (companyId) {
      loadDeals();
    }
  }, [companyId]);

  // Listen for modal trigger from parent
  useEffect(() => {
    if (showDealModalTrigger && showDealModalTrigger > 0) {
      handleShowDealModal();
    }
  }, [showDealModalTrigger]);

  return (
    <>
      {/* Deal Creation/Edit Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">
              Create New Deal
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Deal Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter deal title"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Value (INR) *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
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
                    value={formData.probability}
                    onChange={(e) => handleInputChange('probability', e.target.value)}
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
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
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
                  value={formData.expectedCloseDate}
                  onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Deal description (optional)"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleDealSubmit}
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Create Deal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DealManager;

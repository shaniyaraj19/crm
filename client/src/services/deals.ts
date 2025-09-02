import { api } from './api';

export interface PipelineStage {
  _id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

export interface Pipeline {
  _id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  isActive: boolean;
}

export interface Deal {
  id?: string;
  name: string;
  value: number;
  stageId: string; // Use stageId instead of hardcoded stage names
  stageName?: string; // For display purposes
  probability: number;
  closeDate: string;
  description: string;
  companyId?: string;
  contactId?: string;
  owner?: string;
}

export interface CreateDealRequest {
  title: string;
  value: number;
  stageId: string; // Use stageId directly instead of stage name
  probability: number;
  expectedCloseDate: string;
  description: string;
  companyId?: string;
  contactId?: string;
  assignedTo?: string;
}

export interface CreateDealResponse {
  success: boolean;
  data: {
    deal: {
      _id: string;
      title: string;
      value: number;
      stageId: string;
      probability: number;
      expectedCloseDate: string;
      description: string;
      companyId?: string;
      contactId?: string;
      assignedTo?: string;
    };
  };
  message: string;
}

export interface GetDealsResponse {
  success: boolean;
  data: {
    deals: Array<{
      _id: string;
      title: string;
      value: number;
      stageId: string;
      probability: number;
      expectedCloseDate: string;
      description: string;
      companyId?: string;
      contactId?: string;
      assignedTo?: {
        firstName: string;
        lastName: string;
      };
    }>;
  };
}

// Get available pipelines and stages
export const getPipelines = async (): Promise<Pipeline[]> => {
  try {
    // Add cache-busting timestamp to prevent 304 responses
    const response = await api.get(`/pipelines?t=${Date.now()}`);
    
    console.log('🔍 Pipelines response:', response);
    
    let pipelines: Pipeline[] = [];
    if (response.data && typeof response.data === 'object') {
      const responseData = response.data as any;
      if (responseData.data && Array.isArray(responseData.data.pipelines)) {
        pipelines = responseData.data.pipelines;
      } else if (Array.isArray(responseData.pipelines)) {
        pipelines = responseData.pipelines;
      } else if (Array.isArray(responseData)) {
        pipelines = responseData;
      }
    }
    
    console.log('✅ Parsed pipelines:', pipelines);
    return pipelines;
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    throw new Error('Failed to fetch pipelines');
  }
};

// Get stages for a specific pipeline
export const getPipelineStages = async (pipelineId: string): Promise<PipelineStage[]> => {
  try {
    const pipelines = await getPipelines();
    const pipeline = pipelines.find(p => p._id === pipelineId);
    return pipeline?.stages || [];
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    throw new Error('Failed to fetch pipeline stages');
  }
};

// Get default pipeline (first active pipeline)
export const getDefaultPipeline = async (): Promise<Pipeline | null> => {
  try {
    const pipelines = await getPipelines();
    return pipelines.find(p => p.isActive) || pipelines[0] || null;
  } catch (error) {
    console.error('Error fetching default pipeline:', error);
    return null;
  }
};

// Create a new deal
export const createDeal = async (dealData: CreateDealRequest): Promise<CreateDealResponse> => {
  try {
    // Validate required fields
    if (!dealData.stageId) {
      throw new Error('Stage selection is required');
    }
    
    // Validate other required fields
    if (dealData.companyId && !/^[0-9a-fA-F]{24}$/.test(dealData.companyId)) {
      throw new Error('Invalid company ID format');
    }
    
    if (dealData.contactId && !/^[0-9a-fA-F]{24}$/.test(dealData.contactId)) {
      throw new Error('Invalid contact ID format');
    }
    
    // Get default pipeline to get pipelineId
    const defaultPipeline = await getDefaultPipeline();
    if (!defaultPipeline) {
      throw new Error('No active pipeline available. Please create a pipeline first.');
    }
    
    // Find the selected stage
    const selectedStage = defaultPipeline.stages.find(stage => 
      stage._id === dealData.stageId || stage._id?.toString() === dealData.stageId
    );
    
    if (!selectedStage) {
      throw new Error('Selected stage not found in pipeline');
    }
    
    const backendDealData: any = {
      title: dealData.title,
      description: dealData.description || '',
      value: Number(dealData.value),
      currency: 'USD',
      priority: 'medium',
      status: 'open',
      probability: selectedStage.probability, // Use stage probability
      expectedCloseDate: new Date(dealData.expectedCloseDate).toISOString(),
      pipelineId: defaultPipeline._id,
      stageId: selectedStage._id, // Use the actual stage ID
      ...(dealData.contactId ? { contactId: dealData.contactId } : {}),
      ...(dealData.companyId ? { companyId: dealData.companyId } : {}),
      source: 'manual',
      tags: ['manual-creation']
    };

    console.log('🔍 Creating deal with data:', backendDealData);

    const response = await api.post("/deals", backendDealData);
    
    console.log('✅ Deal creation response:', response);
    
    // Backend returns { success: true, message: string, data: { deal: ... } }
    if (response.success && response.data) {
      const responseData = response.data as any;
      // Return the standardized response
      return {
        success: true,
        data: { deal: responseData.deal },
        message: response.message || 'Deal created successfully'
      } as CreateDealResponse;
    } else {
      throw new Error(response.message || 'Failed to create deal');
    }
  } catch (error: any) {
    console.error('❌ Error creating deal:', error);
    throw new Error(error.message || 'Failed to create deal');
  }
};

// Get all deals
export const getDeals = async (): Promise<GetDealsResponse> => {
  try {
    const res = await api.get("/deals");
    return res.data as GetDealsResponse;
  } catch (err: any) {
    console.error("❌ Error fetching deals:", err.response?.data || err.message);
    throw err;
  }
};

// Get deals by company
export const getDealsByCompany = async (companyId: string): Promise<GetDealsResponse> => {
  try {
    // Add cache-busting timestamp to prevent 304 responses
    const res = await api.get(`/deals?t=${Date.now()}`);
    const allDeals = (res.data as any).data?.deals || (res.data as any).deals || [];
    
    console.log('🔍 All deals from backend:', allDeals);
    
    const companyDeals = allDeals.filter((deal: any) => {
      const dealCompanyId = deal.companyId?._id || deal.companyId;
      return dealCompanyId === companyId;
    });
    
    console.log('🔍 Company deals after filtering:', companyDeals);
    
    let stageMapping: { [key: string]: string } = {};
    try {
      // Add cache-busting timestamp to prevent 304 responses
      const pipelineRes = await api.get(`/pipelines?t=${Date.now()}`);
      const pipelineData = pipelineRes.data as any;
      if (pipelineData?.pipelines && pipelineData.pipelines.length > 0) {
        const pipeline = pipelineData.pipelines[0];
        pipeline.stages?.forEach((stage: any) => {
          stageMapping[stage._id] = stage.name;
        });
      }
    } catch {
      // ignore if pipeline fetch fails
    }
    
    const transformedDeals = companyDeals.map((deal: any) => {
      let frontendStage = deal.frontendStage;
      
      if (!frontendStage && deal.description) {
        const stageMatch = deal.description.match(/\[Frontend Stage: (.*?)\]/);
        if (stageMatch) frontendStage = stageMatch[1];
      }
      if (!frontendStage && deal.tags) {
        const stageTag = deal.tags.find((tag: string) => tag.startsWith('frontend-stage:'));
        if (stageTag) frontendStage = stageTag.replace('frontend-stage:', '');
      }
      
      const stageName = frontendStage || stageMapping[deal.stageId] || 'Unknown Stage';
      
      return {
        _id: deal._id || deal.id,
        title: deal.title,
        value: deal.value,
        stageId: deal.stageId || deal.stage,
        stage: stageName,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate,
        description: deal.description,
        companyId: deal.companyId?._id || deal.companyId,
        contactId: deal.contactId?._id || deal.contactId,
        assignedTo: deal.assignedTo
      };
    });
    
    return { success: true, data: { deals: transformedDeals } };
  } catch (err: any) {
    console.error("❌ Error fetching deals by company:", err.response?.data || err.message);
    return { success: true, data: { deals: [] } };
  }
};

// Update an existing deal
export const updateDeal = async (dealId: string, dealData: Partial<CreateDealRequest>): Promise<CreateDealResponse> => {
  try {
    console.log('🔍 Updating deal with data:', { dealId, dealData });
    
    const response = await api.put(`/deals/${dealId}`, dealData);
    
    console.log('✅ Deal update response:', response);
    
    if (response.success && response.data) {
      const responseData = response.data as any;
      return {
        success: true,
        data: { deal: responseData.deal },
        message: response.message || 'Deal updated successfully'
      } as CreateDealResponse;
    } else {
      throw new Error(response.message || 'Failed to update deal');
    }
  } catch (error: any) {
    console.error('❌ Error updating deal:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update deal');
  }
};

// Delete a deal
export const deleteDeal = async (dealId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 Deleting deal:', dealId);
    
    const response = await api.delete(`/deals/${dealId}`);
    
    console.log('✅ Deal deletion response:', response);
    
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Deal deleted successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to delete deal');
    }
  } catch (error: any) {
    console.error('❌ Error deleting deal:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete deal');
  }
};

// Transform backend deal to frontend format
export const transformDealForFrontend = (backendDeal: any): Deal => {
  const formatCloseDate = (dateString: string) => {
    if (!dateString) return 'No date set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toISOString().split('T')[0];
    } catch {
      return 'Invalid date';
    }
  };
  
  let frontendStage = backendDeal.frontendStage;
  
  if (!frontendStage && backendDeal.description) {
    const stageMatch = backendDeal.description.match(/\[Frontend Stage: (.*?)\]/);
    if (stageMatch) frontendStage = stageMatch[1];
  }
  if (!frontendStage && backendDeal.tags) {
    const stageTag = backendDeal.tags.find((tag: string) => tag.startsWith('frontend-stage:'));
    if (stageTag) frontendStage = stageTag.replace('frontend-stage:', '');
  }
  
  return {
    id: backendDeal._id || backendDeal.id,
    name: backendDeal.title,
    value: backendDeal.value,
    stageId: backendDeal.stageId || backendDeal.stage || 'Unknown Stage',
    stageName: frontendStage || backendDeal.stageName || backendDeal.stage || 'Unknown Stage',
    probability: backendDeal.probability,
    closeDate: formatCloseDate(backendDeal.expectedCloseDate),
    description: backendDeal.description,
    companyId: backendDeal.companyId?._id || backendDeal.companyId,
    contactId: backendDeal.contactId?._id || backendDeal.contactId,
    owner: backendDeal.assignedTo?.firstName 
      ? `${backendDeal.assignedTo.firstName} ${backendDeal.assignedTo.lastName}` 
      : backendDeal.assignedTo || 'Unassigned'
  };
};

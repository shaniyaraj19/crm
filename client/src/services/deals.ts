import { api } from './api';

// Simple retry function with exponential backoff
const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
};

export interface DealData {
  title: string;
  description?: string;
  value?: number;
  probability?: number;
  expectedCloseDate?: string;
  stageId?: string;
  contactId?: string;
  currency?: string;
  priority?: string;
  pipelineId?: string;
}

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

export interface GetCompanyDealsResponse {
  success: boolean;
  data: {
    deals: Deal[];
  };
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

export class DealService {
  /**
   * Create a new deal
   */
  static async createDeal(dealData: DealData): Promise<any> {
    try {
      console.log('Creating deal:', dealData);
      
      // Get default pipeline if not provided
      if (!dealData.pipelineId) {
        const pipelineResponse = await api.get('/pipelines?isDefault=true');
        if (pipelineResponse.success && (pipelineResponse.data as any).pipelines.length > 0) {
          const defaultPipeline = (pipelineResponse.data as any).pipelines[0];
          dealData.pipelineId = defaultPipeline._id;
        }
      }

      const response = await retryWithBackoff(() => api.post('/deals', dealData));
      console.log('Create deal response:', response);
      
      if (response.success) {
        return { success: true, deal: (response.data as any).deal };
      } else {
        return { success: false, error: 'Failed to create deal' };
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      return { success: false, error: 'Error creating deal' };
    }
  }

  /**
   * Update an existing deal
   */
  static async updateDeal(dealId: string, dealData: DealData): Promise<any> {
    try {
      console.log('Updating deal:', dealId, dealData);
      
      const response = await retryWithBackoff(() => api.put(`/deals/${dealId}`, dealData));
      console.log('Update deal response:', response);
      
      if (response.success) {
        return { success: true, deal: (response.data as any).deal };
      } else {
        return { success: false, error: 'Failed to update deal' };
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      return { success: false, error: 'Error updating deal' };
    }
  }

  /**
   * Delete a deal
   */
  static async deleteDeal(dealId: string): Promise<any> {
    try {
      console.log('Deleting deal:', dealId);
      
      const response = await retryWithBackoff(() => api.delete(`/deals/${dealId}`));
      console.log('Delete deal response:', response);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: 'Failed to delete deal' };
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      return { success: false, error: 'Error deleting deal' };
    }
  }

  /**
   * Get deals for a contact
   */
  static async getContactDeals(contactId: string): Promise<any> {
    try {
      console.log('Fetching deals for contact:', contactId);
      const response = await retryWithBackoff(() => api.get(`/deals?contactId=${contactId}&limit=50`));
      
      if (response.success) {
        const deals = (response.data as any).deals || [];
        console.log('Fetched deals for contact:', deals.length);
        return { success: true, deals };
      } else {
        return { success: false, error: 'Failed to fetch deals' };
      }
    } catch (error) {
      console.error('Error fetching contact deals:', error);
      return { success: false, error: 'Error fetching deals' };
    }
  }

  /**
   * Get deals for a company
   */
  static async getCompanyDeals(companyId: string): Promise<any> {
    try {
      console.log('Fetching deals for company:', companyId);
      const response = await retryWithBackoff(() => api.get(`/deals?companyId=${companyId}&limit=50`));
      
      if (response.success) {
        const deals = (response.data as any).deals || [];
        console.log('Fetched deals for company:', deals.length);
        return { success: true, deals };
      } else {
        return { success: false, error: 'Failed to fetch deals' };
      }
    } catch (error) {
      console.error('Error fetching company deals:', error);
      return { success: false, error: 'Error fetching deals' };
    }
  }
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
    console.log('🔍 All pipelines:', pipelines);
    
    const defaultPipeline = pipelines.find(p => p.isActive) || pipelines[0] || null;
    console.log('🔍 Selected default pipeline:', defaultPipeline);
    
    return defaultPipeline;
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
    console.log('🔍 Default pipeline:', defaultPipeline);
    
    if (!defaultPipeline) {
      throw new Error('No active pipeline available. Please create a pipeline first.');
    }
    
    console.log('🔍 Pipeline stages:', defaultPipeline.stages);
    
    // Find the selected stage by name
    const selectedStage = defaultPipeline.stages.find(stage => 
      stage.name === dealData.stageId
    );
    
    if (!selectedStage) {
      console.error('🔍 Available stages:', defaultPipeline.stages.map(s => ({ name: s.name, id: s._id })));
      console.error('🔍 Selected stage:', dealData.stageId);
      throw new Error(`Selected stage "${dealData.stageId}" not found in pipeline. Available stages: ${defaultPipeline.stages.map(s => s.name).join(', ')}`);
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
      stageId: selectedStage.name, // Use the stage name (since backend expects stage names)
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

// // Get deals by company
// export const getDealsByCompany = async (companyId: string): Promise<GetDealsResponse> => {
//   try {
//     // Add cache-busting timestamp to prevent 304 responses
//     const res = await api.get(`/deals?t=${Date.now()}`);
//     const allDeals = (res.data as any).data?.deals || (res.data as any).deals || [];
    
//     console.log('🔍 All deals from backend:', allDeals);
    
//     const companyDeals = allDeals.filter((deal: any) => {
//       const dealCompanyId = deal.companyId?._id || deal.companyId;
//       return dealCompanyId === companyId;
//     });
    
//     console.log('🔍 Company deals after filtering:', companyDeals);
    
//     let stageMapping: { [key: string]: string } = {};
//     try {
//       // Add cache-busting timestamp to prevent 304 responses
//       const pipelineRes = await api.get(`/pipelines?t=${Date.now()}`);
//       const pipelineData = pipelineRes.data as any;
//       if (pipelineData?.pipelines && pipelineData.pipelines.length > 0) {
//         const pipeline = pipelineData.pipelines[0];
//         pipeline.stages?.forEach((stage: any) => {
//           stageMapping[stage._id] = stage.name;
//         });
//       }
//     } catch {
//       // ignore if pipeline fetch fails
//     }
    
//     const transformedDeals = companyDeals.map((deal: any) => {
//       let frontendStage = deal.frontendStage;
      
//       if (!frontendStage && deal.description) {
//         const stageMatch = deal.description.match(/\[Frontend Stage: (.*?)\]/);
//         if (stageMatch) frontendStage = stageMatch[1];
//       }
//       if (!frontendStage && deal.tags) {
//         const stageTag = deal.tags.find((tag: string) => tag.startsWith('frontend-stage:'));
//         if (stageTag) frontendStage = stageTag.replace('frontend-stage:', '');
//       }
      
//       const stageName = frontendStage || stageMapping[deal.stageId] || 'Unknown Stage';
      
//       return {
//         _id: deal._id || deal.id,
//         title: deal.title,
//         value: deal.value,
//         stageId: deal.stageId || deal.stage,
//         stage: stageName,
//         probability: deal.probability,
//         expectedCloseDate: deal.expectedCloseDate,
//         description: deal.description,
//         companyId: deal.companyId?._id || deal.companyId,
//         contactId: deal.contactId?._id || deal.contactId,
//         assignedTo: deal.assignedTo
//       };
//     });
    
//     return { success: true, data: { deals: transformedDeals } };
//   } catch (err: any) {
//     console.error("❌ Error fetching deals by company:", err.response?.data || err.message);
//     return { success: true, data: { deals: [] } };
//   }
// };


export const getDealsByCompany = async (companyId: string): Promise<GetDealsResponse> => {
  try {
    // Add cache-busting timestamp to prevent 304 responses
    const res = await api.get(`/deals/company/${companyId}?t=${Date.now()}`);
    console.log('🔍 Raw API response:', res.data);
    
    // Handle different response structures
    if (res.data && typeof res.data === 'object') {
      const responseData = res.data as any;
      // If response has deals array directly
      if (Array.isArray(responseData.deals)) {
        return { success: true, data: { deals: responseData.deals } };
      }
      // If response has success and data structure
      if (responseData.success !== undefined && responseData.data) {
        return responseData as GetDealsResponse;
      }
      // If response is the deals array itself
      if (Array.isArray(responseData)) {
        return { success: true, data: { deals: responseData } };
      }
    }
    
    // Fallback
    return { success: true, data: { deals: [] } };
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
    // stageName: frontendStage || backendDeal.stageName || backendDeal.stage || 'Unknown Stage',
    stageName: frontendStage || backendDeal.stageHistory[0]?.stageName || backendDeal.stage || 'Unknown Stage',

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

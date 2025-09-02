import { api } from './api';

export interface Activity {
  _id?: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal'; // Keep 'deal' for backward compatibility
  status?: 'pending' | 'completed' | 'cancelled';
  dueDate?: string;
  duration?: number; // Changed from string to number to match backend model
  notes?: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  userId?: string;
  createdBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal'; // Keep 'deal' for backward compatibility
  status?: 'pending' | 'completed' | 'cancelled';
  dueDate?: string;
  duration?: number; // Changed from string to number to match backend model
  notes?: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  userId?: string;
}

export interface GetActivitiesResponse {
  success: boolean;
  data: {
    activities: Activity[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CreateActivityResponse {
  success: boolean;
  data: {
    activity: Activity;
  };
  message: string;
}

// Get activities with optional filtering
export const getActivities = async (filters?: {
  companyId?: string;
  contactId?: string;
  dealId?: string;
  type?: string;
  limit?: number;
}): Promise<GetActivitiesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.contactId) params.append('contactId', filters.contactId);
    if (filters?.dealId) params.append('dealId', filters.dealId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    // Add cache-busting timestamp to prevent 304 responses
    params.append('t', Date.now().toString());
    
    const queryString = params.toString();
    const url = `/activities${queryString ? `?${queryString}` : ''}`;
    
    console.log('🔍 Fetching activities from:', url);
    const response = await api.get(url);
    console.log('📊 Activities response:', response);
    return response as GetActivitiesResponse;
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    throw new Error(error.message || 'Failed to fetch activities');
  }
};

// Create a new activity
export const createActivity = async (activityData: CreateActivityRequest): Promise<CreateActivityResponse> => {
  try {
    const response = await api.post('/activities', activityData);
    
    console.log('✅ Activity created successfully:', response);
    
    if (response.success && response.data) {
      const responseData = response.data as any;
      return {
        success: true,
        data: { activity: responseData.activity },
        message: response.message || 'Activity created successfully'
      } as CreateActivityResponse;
    } else {
      throw new Error(response.message || 'Failed to create activity');
    }
  } catch (error: any) {
    console.error('❌ Error creating activity:', error);
    console.error('❌ Error details:', error.response?.data);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create activity');
  }
};

// Update an activity
export const updateActivity = async (id: string, activityData: Partial<CreateActivityRequest>): Promise<CreateActivityResponse> => {
  try {
    const response = await api.put(`/activities/${id}`, activityData);
    
    if (response.success && response.data) {
      const responseData = response.data as any;
      return {
        success: true,
        data: { activity: responseData.activity },
        message: response.message || 'Activity updated successfully'
      } as CreateActivityResponse;
    } else {
      throw new Error(response.message || 'Failed to update activity');
    }
  } catch (error: any) {
    console.error('❌ Error updating activity:', error);
    throw new Error(error.message || 'Failed to update activity');
  }
};

// Delete an activity
export const deleteActivity = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/activities/${id}`);
    
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Activity deleted successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to delete activity');
    }
  } catch (error: any) {
    console.error('❌ Error deleting activity:', error);
    throw new Error(error.message || 'Failed to delete activity');
  }
};

// Transform backend activity to frontend format
export const transformActivityForFrontend = (backendActivity: any): Activity => {
  return {
    _id: backendActivity._id,
    title: backendActivity.title,
    description: backendActivity.description,
    type: backendActivity.type,
    status: backendActivity.status,
    dueDate: backendActivity.dueDate,
    duration: backendActivity.duration,
    notes: backendActivity.notes,
    companyId: backendActivity.companyId?._id || backendActivity.companyId,
    contactId: backendActivity.contactId?._id || backendActivity.contactId,
    dealId: backendActivity.dealId?._id || backendActivity.dealId,
    userId: backendActivity.userId?._id || backendActivity.userId,
    createdBy: backendActivity.createdBy, // Keep the populated user data
    createdAt: backendActivity.createdAt,
    updatedAt: backendActivity.updatedAt
  };
};

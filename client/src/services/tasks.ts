import api from "./api";

export interface Task {
    id?: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    companyId: string;
    status?: 'pending' | 'in-progress' | 'completed';
    createdBy?: string;
    updatedBy?: string;
}

export const createTask = async (task: Task) => {
    try {
        const response = await api.post('/tasks', task);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getTasks = async (companyId: string) => {
    try {
        const response = await api.get(`/tasks/company/${companyId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getTaskById = async (taskId: string) => {
    try {
        const response = await api.get(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateTask = async (taskId: string, task: Partial<Task>) => {
    try {
        const response = await api.put(`/tasks/${taskId}`, task);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteTask = async (taskId: string) => {
    try {
        const response = await api.delete(`/tasks/${taskId}`);
        return response;
    } catch (error) {
        console.error('🔍 Tasks Service: Delete error:', error);
        throw error;
    }
};

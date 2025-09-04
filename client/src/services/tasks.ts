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
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activityData = {
            type: 'task',
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status === 'in-progress' ? 'in_progress' : (task.status || 'pending'),
            companyId: task.companyId,
            userId: currentUser._id,
            assignedTo: task.assignedTo
        };
        const response = await api.post('/activities', activityData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getTasks = async (companyId: string) => {
    try {
        const response = await api.get(`/activities/company/${companyId}?type=task`);
        return response;
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
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activityData = {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status === 'in-progress' ? 'in_progress' : task.status,
            userId: currentUser._id,
            assignedTo: task.assignedTo
        };
        const response = await api.put(`/activities/${taskId}`, activityData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteTask = async (taskId: string) => {
    try {
        const response = await api.delete(`/activities/${taskId}`);
        return response;
    } catch (error) {
        console.error('🔍 Tasks Service: Delete error:', error);
        throw error;
    }
};

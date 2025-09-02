import api from "./api";

export interface Schedule {
    id?: string;
    meetingTitle: string;
    date: string;
    time: string;
    duration: 10 | 30 | 45 | 60;
    attendees: string;
    notes?: string;
    companyId: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
    createdBy?: string;
    updatedBy?: string;
}

export const createSchedule = async (schedule: Schedule) => {
    try {
        const response = await api.post('/schedules', schedule);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getSchedules = async (companyId: string) => {
    try {
        const response = await api.get(`/schedules/company/${companyId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getScheduleById = async (scheduleId: string) => {
    try {
        const response = await api.get(`/schedules/${scheduleId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateSchedule = async (scheduleId: string, schedule: Partial<Schedule>) => {
    try {
        const response = await api.put(`/schedules/${scheduleId}`, schedule);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteSchedule = async (scheduleId: string) => {
    try {
        const response = await api.delete(`/schedules/${scheduleId}`);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

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
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activityData = {
            type: 'meeting',
            title: schedule.meetingTitle,
            description: schedule.notes || `Meeting with ${schedule.attendees}`,
            scheduledAt: new Date(`${schedule.date}T${schedule.time}`).toISOString(),
            duration: schedule.duration,
            status: schedule.status || 'scheduled',
            companyId: schedule.companyId,
            userId: currentUser._id,
            customFields: {
                attendees: schedule.attendees,
                meetingDate: schedule.date,
                meetingTime: schedule.time,
                meetingTitle: schedule.meetingTitle
            }
        };
        const response = await api.post('/activities', activityData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getSchedules = async (companyId: string) => {
    try {
        const response = await api.get(`/activities/company/${companyId}?type=meeting`);
        return response;
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
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activityData = {
            title: schedule.meetingTitle,
            description: schedule.notes || `Meeting with ${schedule.attendees}`,
            scheduledAt: schedule.date && schedule.time ? new Date(`${schedule.date}T${schedule.time}`).toISOString() : undefined,
            duration: schedule.duration,
            status: schedule.status,
            userId: currentUser._id,
            customFields: {
                attendees: schedule.attendees,
                meetingDate: schedule.date,
                meetingTime: schedule.time,
                meetingTitle: schedule.meetingTitle
            }
        };
        const response = await api.put(`/activities/${scheduleId}`, activityData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteSchedule = async (scheduleId: string) => {
    try {
        const response = await api.delete(`/activities/${scheduleId}`);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

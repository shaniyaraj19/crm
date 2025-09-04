import api from "./api";

export interface Note {
    id?: string;
    title?: string;
    content: string;
    type: string;
    companyId: string;
    createdBy?: string; 
    updatedBy?: string;
}




export const createNote = async (note: Note) => {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activityData = {
            type: 'note',
            title: note.title || 'Untitled Note',
            description: note.content,
            companyId: note.companyId,
            priority: 'medium',
            userId: currentUser._id,
            customFields: {
                noteType: note.type
            }
        };
        const response = await api.post('/activities', activityData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getNotes = async (companyId: string) => {
    try {
        const response = await api.get(`/activities/company/${companyId}?type=note`);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getNoteById = async (noteId: string) => {
    try {
            const response = await api.get(`/notes/${noteId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateNote = async (noteId: string, note: Note) => {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activityData = {
            title: note.title || 'Untitled Note',
            description: note.content,
            userId: currentUser._id,
            customFields: {
                noteType: note.type
            }
        };
        const response = await api.put(`/activities/${noteId}`, activityData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteNote = async (noteId: string) => {
    try {
        const response = await api.delete(`/activities/${noteId}`);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
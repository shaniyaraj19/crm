import api from "./api";

export interface Note {
    id?: string;
    content: string;
    type: string;
    companyId: string;
    createdBy?: string; 
    updatedBy?: string;
}




export const createNote = async (note: Note) => {
    try {
        
        const response = await api.post('/notes', note);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getNotes = async (companyId: string) => {
    try {
        const response = await api.get(`/notes/company/${companyId}`);
        return response.data;
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
        const response = await api.put(`/notes/${noteId}`, note);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteNote = async (noteId: string) => {
    try {
        
        const response = await api.delete(`/notes/${noteId}`);
        
        return response.data;
    } catch (error) {
       
        throw error;
    }
};
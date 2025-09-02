import { api } from './api';

export interface FileRecord {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organizationId: string;
  companyId?: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  fileType: string;
  downloadCount: number;
  lastDownloadedAt?: string;
}

export interface UploadFileRequest {
  file: File;
  companyId?: string;
  description?: string;
  isPublic?: boolean;
}

export interface UploadMultipleFilesRequest {
  files: File[];
  companyId?: string;
  description?: string;
  isPublic?: boolean;
}

export interface GetFilesResponse {
  success: boolean;
  data: {
    files: FileRecord[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface GetFileResponse {
  success: boolean;
  data: {
    file: FileRecord;
  };
  message?: string;
}

export interface UploadFileResponse {
  success: boolean;
  data: {
    file: FileRecord;
  };
  message: string;
}

export interface UploadMultipleFilesResponse {
  success: boolean;
  data: {
    files: FileRecord[];
  };
  message: string;
}

// Upload single file
export const uploadFile = async (file: File | Blob, metadata?: Partial<UploadFileRequest>): Promise<UploadFileResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata?.companyId) {
      formData.append('companyId', metadata.companyId);
    }
    if (metadata?.description) {
      formData.append('description', metadata.description);
    }
    if (metadata?.isPublic !== undefined) {
      formData.append('isPublic', metadata.isPublic.toString());
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response as UploadFileResponse;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload file');
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files: (File | Blob)[], metadata?: Partial<UploadMultipleFilesRequest>): Promise<UploadMultipleFilesResponse> => {
  try {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (metadata?.companyId) {
      formData.append('companyId', metadata.companyId);
    }
    if (metadata?.description) {
      formData.append('description', metadata.description);
    }
    if (metadata?.isPublic !== undefined) {
      formData.append('isPublic', metadata.isPublic.toString());
    }

    const response = await api.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response as UploadMultipleFilesResponse;
  } catch (error: any) {
    console.error('Error uploading files:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload files');
  }
};

// Get files by company ID
export const getCompanyFiles = async (companyId: string): Promise<GetFilesResponse> => {
  try {
    const response = await api.get(`/files/company/${companyId}`);
    return response as GetFilesResponse;
  } catch (error: any) {
    console.error('Error fetching company files:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch company files');
  }
};

// Download file
export const downloadFile = async (fileId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  } catch (error: any) {
    console.error('Error downloading file:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to download file');
  }
};

// Get file preview URL
export const getFilePreviewUrl = (fileId: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const token = localStorage.getItem('access_token');
  return `${baseUrl}/files/${fileId}/preview${token ? `?access_token=${token}` : ''}`;
};

// Get file preview as blob URL for better authentication handling
export const getFilePreviewBlobUrl = async (fileId: string): Promise<string> => {
  try {
    const response = await api.get(`/files/${fileId}/preview`, {
      responseType: 'blob',
    });
    const blob = response as unknown as Blob;
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error('Error fetching file preview blob:', error);
    throw new Error('Failed to load file preview');
  }
};

// Delete file
export const deleteFile = async (fileId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/files/${fileId}`);
    return response as { success: boolean; message: string };
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete file');
  }
};

// Helper function to get file icon based on file type
export const getFileIcon = (fileType: string): string => {
  switch (fileType) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Music';
    case 'pdf':
      return 'FileText';
    case 'document':
      return 'FileText';
    case 'spreadsheet':
      return 'Table';
    case 'presentation':
      return 'Presentation';
    default:
      return 'File';
  }
};

// Helper function to check if file is previewable
export const isPreviewable = (mimeType: string): boolean => {
  return mimeType.startsWith('image/') || 
         mimeType.startsWith('video/') || 
         mimeType.startsWith('audio/') || 
         mimeType.includes('pdf') ||
         mimeType.includes('text/');
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

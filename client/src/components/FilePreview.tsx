import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { downloadFile, getFilePreviewBlobUrl, FileRecord } from '../services/files';

interface FilePreviewProps {
  file: FileRecord;
  isOpen: boolean;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose }) => {
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    } else {
      // Clean up blob URL when modal closes
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
    }
  }, [isOpen, file]);

  const loadPreview = async () => {
    if (!file) return;

    try {
      setPreviewLoading(true);
      // Generate blob URL for preview
      const blobUrl = await getFilePreviewBlobUrl(file._id);
      setPreviewBlobUrl(blobUrl);
    } catch (error) {
      console.error('Failed to load file preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileDownload = async () => {
    try {
      const blob = await downloadFile(file._id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download file. Please try again.');
    }
  };

  const handleClose = () => {
    // Clean up blob URL to prevent memory leaks
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[60vw] h-[85vh] mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {file.originalName}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileDownload}
              iconName="Download"
              iconPosition="left"
              className="text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              iconName="X"
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
        <div className="p-4 overflow-auto h-[calc(85vh-80px)]">
          {previewLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading preview...</span>
            </div>
          ) : previewBlobUrl ? (
            <div className="w-full h-full">
              {file.mimetype.startsWith('image/') ? (
                <div className="flex items-center justify-center h-full w-full">
                  <img
                    src={previewBlobUrl}
                    alt={file.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : file.mimetype === 'application/pdf' ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-[calc(85vh-120px)] border-0"
                  title={file.originalName}
                />
              ) : file.mimetype.startsWith('video/') ? (
                <video
                  src={previewBlobUrl}
                  controls
                  className="max-w-full max-h-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : file.mimetype.startsWith('audio/') ? (
                <audio src={previewBlobUrl} controls className="w-full">
                  Your browser does not support the audio tag.
                </audio>
              ) : file.mimetype.startsWith('text/') ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-96 border-0"
                  title={file.originalName}
                />
              ) : (
                <div className="text-center py-8">
                  <Icon
                    name="File"
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <p className="text-gray-600">
                    Preview not available for this file type
                  </p>
                  <Button
                    onClick={handleFileDownload}
                    className="mt-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Download File
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon
                name="AlertCircle"
                size={48}
                className="mx-auto mb-4 text-red-400"
              />
              <p className="text-red-600">Failed to load preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;

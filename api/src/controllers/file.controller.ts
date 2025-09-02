import { Request, Response } from 'express';
import { File } from '../models/File';
import { Company } from '../models/Company';
import { Types } from 'mongoose';
import fs from 'fs';

import { ApiResponse } from '../types/common';
import { getFileTypeFromMimetype } from '../middleware/upload';

export class FileController {
  /**
   * Upload a single file
   */
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
          error: 'NO_FILE_UPLOADED'
        });
        return;
      }

      const { companyId, description, isPublic } = req.body;
      const userId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      // Validate company relationship if provided
      if (companyId) {
        const company = await Company.findOne({ _id: companyId, organizationId });
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found',
            error: 'COMPANY_NOT_FOUND'
          });
          return;
        }
      }

      // Create file record
      const fileData: Partial<any> = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        description: description || '',
        organizationId: new Types.ObjectId(organizationId),
        uploadedBy: new Types.ObjectId(userId),
        isPublic: isPublic === 'true',
        createdBy: new Types.ObjectId(userId),
        fileType: getFileTypeFromMimetype(req.file.mimetype),
      };

      // Add company relationship if provided
      if (companyId) {
        fileData.companyId = new Types.ObjectId(companyId);
      }

      const file = new File(fileData);
      await file.save();

      // Populate user info
      await file.populate('uploadedBy', 'firstName lastName email');

      const response: ApiResponse = {
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: file
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: 'UPLOAD_ERROR'
      });
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded',
          error: 'NO_FILES_UPLOADED'
        });
        return;
      }

      const { companyId, description, isPublic } = req.body;
      const userId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      // Validate company relationship if provided
      if (companyId) {
        const company = await Company.findOne({ _id: companyId, organizationId });
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found',
            error: 'COMPANY_NOT_FOUND'
          });
          return;
        }
      }

      const uploadedFiles = [];

      for (const file of files) {
        const fileData: Partial<any> = {
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          description: description || '',
          organizationId: new Types.ObjectId(organizationId),
          uploadedBy: new Types.ObjectId(userId),
          isPublic: isPublic === 'true',
          createdBy: new Types.ObjectId(userId),
          fileType: getFileTypeFromMimetype(file.mimetype),
        };

        // Add company relationship if provided
        if (companyId) {
          fileData.companyId = new Types.ObjectId(companyId);
        }

        const fileRecord = new File(fileData);
        await fileRecord.save();
        await fileRecord.populate('uploadedBy', 'firstName lastName email');
        
        uploadedFiles.push(fileRecord);
      }

      const response: ApiResponse = {
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: {
          files: uploadedFiles
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: 'UPLOAD_ERROR'
      });
    }
  }

  /**
   * Get files by company ID
   */
  static async getCompanyFiles(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const userId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const files = await File.find({
        companyId: companyId,
        organizationId,
        isDeleted: { $ne: true }
      })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

      const response: ApiResponse = {
        success: true,
        message: 'Files retrieved successfully',
        data: {
          files: files
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching company files:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching files',
        error: 'FETCH_ERROR'
      });
    }
  }

  /**
   * Download a file
   */
  static async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const file = await File.findOne({
        _id: fileId,
        organizationId,
        isDeleted: { $ne: true }
      });

      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found',
          error: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Check if user can access the file
      if (!file.isPublic && !file.uploadedBy.equals(new Types.ObjectId(userId))) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      // Check if file exists on disk
      if (!fs.existsSync(file.path)) {
        res.status(404).json({
          success: false,
          message: 'File not found on disk',
          error: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Increment download count
      file.downloadCount += 1;
      file.lastDownloadedAt = new Date();
      await file.save();

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      res.setHeader('Content-Length', file.size);

      // Stream the file
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('Error streaming file for download:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: 'DOWNLOAD_ERROR'
          });
        }
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file',
        error: 'DOWNLOAD_ERROR'
      });
    }
  }

  /**
   * Preview a file (serve with inline disposition)
   */
  static async previewFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const file = await File.findOne({
        _id: fileId,
        organizationId,
        isDeleted: { $ne: true }
      });

      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found',
          error: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Check if user can access the file
      if (!file.isPublic && !file.uploadedBy.equals(new Types.ObjectId(userId))) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      // Check if file exists on disk
      if (!fs.existsSync(file.path)) {
        res.status(404).json({
          success: false,
          message: 'File not found on disk',
          error: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Set headers for file preview (inline disposition)
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      res.setHeader('Content-Length', file.size);

      // Stream the file
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('Error streaming file for preview:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error previewing file',
            error: 'PREVIEW_ERROR'
          });
        }
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      res.status(500).json({
        success: false,
        message: 'Error previewing file',
        error: 'PREVIEW_ERROR'
      });
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const file = await File.findOne({
        _id: fileId,
        organizationId,
        isDeleted: { $ne: true }
      });

      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found',
          error: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Check if user can delete the file (only uploader or admin)
      if (!file.uploadedBy.equals(new Types.ObjectId(userId))) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      // Soft delete the file
      file.isDeleted = true;
      file.deletedBy = new Types.ObjectId(userId);
      file.deletedAt = new Date();
      await file.save();

      // Optionally delete the physical file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const response: ApiResponse = {
        success: true,
        message: 'File deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file',
        error: 'DELETE_ERROR'
      });
    }
  }
}

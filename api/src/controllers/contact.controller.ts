import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact';

import {
  NotFoundError,
  ValidationError
} from '../errors';
import { HTTP_STATUS } from '../constants';
import { ApiResponse } from '../types/common';
import { logger } from '../utils/logger';

export class ContactController {
  /**
   * Get all contacts with filtering and pagination
   */
  static async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        assignedTo,
        tags,
        company,
        sort = 'createdAt',
        order = 'desc'
      } = req.query as any;

      // Build query
      const query: any = {
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      };

      // Apply filters
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.status = status;
      }

      if (assignedTo) {
        query.assignedTo = assignedTo;
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
      }

      if (company) {
        query.companyId = company;
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = Math.min(parseInt(limit), 100);

      // Execute query
      const [contacts, total] = await Promise.all([
        Contact.find(query)
          .populate('companyId', 'name industry website')
          .populate('assignedTo', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName')
          .sort({ [sort]: order === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Contact.countDocuments(query)
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          contacts,
          pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contact by ID
   */
  static async getContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const contact = await Contact.findOne({
        _id: id,
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      })
        .populate('companyId', 'name industry website logo')
        .populate('assignedTo', 'firstName lastName email profilePicture')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      if (!contact) {
        throw new NotFoundError('Contact');
      }

      // Get related deals
      const { Deal } = await import('../models/Deal');
      const relatedDeals = await Deal.find({
        contactId: id,
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      })
        .populate('pipelineId', 'name')
        .select('title value status probability expectedCloseDate')
        .limit(10)
        .sort({ createdAt: -1 });

      // Get recent activities
      const { Activity } = await import('../models/Activity');
      const recentActivities = await Activity.find({
        contactId: id,
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      })
        .populate('userId', 'firstName lastName')
        .select('type title description createdAt completed')
        .limit(10)
        .sort({ createdAt: -1 });

      const response: ApiResponse = {
        success: true,
        data: {
          contact,
          relatedDeals,
          recentActivities
        }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new contact
   */
  static async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contactData = {
        ...req.body,
        organizationId: req.user?.organizationId,
        createdBy: req.user?.userId
      };

      // Check for duplicate email
      const existingContact = await Contact.findOne({
        email: contactData.email,
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      });

      if (existingContact) {
        throw new ValidationError('Contact with this email already exists');
      }

      const contact = new Contact(contactData);
      await contact.save();

      // Populate relations
      await contact.populate([
        { path: 'companyId', select: 'name industry' },
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName' }
      ]);

      logger.info(`New contact created: ${contact.email} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Contact created successfully',
        data: { contact }
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update contact
   */
  static async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: req.user?.userId
      };

      // Remove fields that shouldn't be updated
      delete updateData.organizationId;
      delete updateData.createdBy;
      delete updateData.createdAt;

      const contact = await Contact.findOneAndUpdate(
        {
          _id: id,
          organizationId: req.user?.organizationId,
          isDeleted: { $ne: true }
        },
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'companyId', select: 'name industry' },
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'updatedBy', select: 'firstName lastName' }
      ]);

      if (!contact) {
        throw new NotFoundError('Contact');
      }

      logger.info(`Contact updated: ${contact.email} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Contact updated successfully',
        data: { contact }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete contact (soft delete)
   */
  static async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const contact = await Contact.findOneAndUpdate(
        {
          _id: id,
          organizationId: req.user?.organizationId,
          isDeleted: { $ne: true }
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.userId
        },
        { new: true }
      );

      if (!contact) {
        throw new NotFoundError('Contact');
      }

      logger.info(`Contact deleted: ${contact.email} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Contact deleted successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk actions on contacts
   */
  static async bulkActions(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, contactIds, data } = req.body;

      if (!Array.isArray(contactIds) || contactIds.length === 0) {
        throw new ValidationError('Contact IDs are required');
      }

      const query = {
        _id: { $in: contactIds },
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      };

      let updateData: any = {};
      let message = '';

      switch (action) {
        case 'delete':
          updateData = {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: req.user?.userId
          };
          message = `${contactIds.length} contacts deleted successfully`;
          break;

        case 'assign':
          if (!data?.assignedTo) {
            throw new ValidationError('Assigned user is required');
          }
          updateData = {
            assignedTo: data.assignedTo,
            updatedBy: req.user?.userId
          };
          message = `${contactIds.length} contacts assigned successfully`;
          break;

        case 'updateStatus':
          if (!data?.status) {
            throw new ValidationError('Status is required');
          }
          updateData = {
            status: data.status,
            updatedBy: req.user?.userId
          };
          message = `${contactIds.length} contacts status updated successfully`;
          break;

        case 'addTags':
          if (!data?.tags || !Array.isArray(data.tags)) {
            throw new ValidationError('Tags are required');
          }
          updateData = {
            $addToSet: { tags: { $each: data.tags } },
            updatedBy: req.user?.userId
          };
          message = `Tags added to ${contactIds.length} contacts successfully`;
          break;

        default:
          throw new ValidationError('Invalid bulk action');
      }

      const result = await Contact.updateMany(query, updateData);

      logger.info(`Bulk action ${action} performed on ${result.modifiedCount} contacts by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message,
        data: {
          modifiedCount: result.modifiedCount
        }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contact statistics
   */
  static async getContactStats(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;

      const stats = await Contact.aggregate([
        { $match: { organizationId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            totalContacts: { $sum: 1 },
            activeContacts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            leadContacts: {
              $sum: { $cond: [{ $eq: ['$status', 'lead'] }, 1, 0] }
            },
            customerContacts: {
              $sum: { $cond: [{ $eq: ['$status', 'customer'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get contacts created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const newContactsThisMonth = await Contact.countDocuments({
        organizationId,
        isDeleted: { $ne: true },
        createdAt: { $gte: startOfMonth }
      });

      const response: ApiResponse = {
        success: true,
        data: {
          ...stats[0],
          newContactsThisMonth
        }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search contacts
   */
  static async searchContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit = 10 } = req.query as any;

      if (!q || q.length < 2) {
        throw new ValidationError('Search query must be at least 2 characters');
      }

      const contacts = await Contact.find({
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true },
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ]
      })
        .select('firstName lastName email phone company status')
        .limit(parseInt(limit))
        .sort({ firstName: 1 });

      const response: ApiResponse = {
        success: true,
        data: { contacts }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
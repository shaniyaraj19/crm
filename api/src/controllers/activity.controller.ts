import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity';
import {
  NotFoundError
} from '../errors';
import { HTTP_STATUS } from '../constants';
import { ApiResponse } from '../types/common';
import { logger } from '../utils/logger';

export class ActivityController {
  /**
   * Get all activities with filtering and pagination
   */
  static async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        type,
        status,
        userId,
        contactId,
        dealId,
        companyId,
        dueDate,
        sort = 'dueDate',
        order = 'asc'
      } = req.query as any;

      // Build query
      const query: any = {
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      };

      // Apply filters
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      }

      if (userId) {
        query.userId = userId;
      }

      if (contactId) {
        query.contactId = contactId;
      }

      if (dealId) {
        query.dealId = dealId;
      }

      if (companyId) {
        query.companyId = companyId;
      }

      if (dueDate) {
        const date = new Date(dueDate);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        query.dueDate = {
          $gte: date,
          $lt: nextDate
        };
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = Math.min(parseInt(limit), 100);

      // Execute query
      const [activities, total] = await Promise.all([
        Activity.find(query)
          .populate('userId', 'firstName lastName email profilePicture')
          .populate('contactId', 'firstName lastName email')
          .populate('dealId', 'title value')
          .populate('companyId', 'name')
          .populate('createdBy', 'firstName lastName')
          .sort({ [sort]: order === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Activity.countDocuments(query)
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          activities,
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
   * Get activity by ID
   */
  static async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const activity = await Activity.findOne({
        _id: id,
        organizationId: req.user?.organizationId,
        isDeleted: { $ne: true }
      })
        .populate('userId', 'firstName lastName email profilePicture')
        .populate('contactId', 'firstName lastName email company')
        .populate('dealId', 'title value status')
        .populate('companyId', 'name industry')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      if (!activity) {
        throw new NotFoundError('Activity');
      }

      const response: ApiResponse = {
        success: true,
        data: { activity }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new activity
   */
  static async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activityData = {
        ...req.body,
        organizationId: req.user?.organizationId,
        createdBy: req.user?.userId
      };

      // If no user assigned, assign to creator
      if (!activityData.userId) {
        activityData.userId = req.user?.userId;
      }

      const activity = new Activity(activityData);
      await activity.save();

      // Populate relations
      await activity.populate([
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'contactId', select: 'firstName lastName email' },
        { path: 'dealId', select: 'title value' },
        { path: 'companyId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName' }
      ]);

      logger.info(`New activity created: ${activity.title} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Activity created successfully',
        data: { activity }
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update activity
   */
  static async updateActivity(req: Request, res: Response, next: NextFunction) {
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

      const activity = await Activity.findOneAndUpdate(
        {
          _id: id,
          organizationId: req.user?.organizationId,
          isDeleted: { $ne: true }
        },
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'contactId', select: 'firstName lastName email' },
        { path: 'dealId', select: 'title value' },
        { path: 'companyId', select: 'name' },
        { path: 'updatedBy', select: 'firstName lastName' }
      ]);

      if (!activity) {
        throw new NotFoundError('Activity');
      }

      logger.info(`Activity updated: ${activity.title} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Activity updated successfully',
        data: { activity }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete activity (soft delete)
   */
  static async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const activity = await Activity.findOneAndUpdate(
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

      if (!activity) {
        throw new NotFoundError('Activity');
      }

      logger.info(`Activity deleted: ${activity.title} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Activity deleted successfully'
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark activity as complete
   */
  static async completeActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { outcome, timeSpent, followUpRequired, followUpDate } = req.body;

      const activity = await Activity.findOneAndUpdate(
        {
          _id: id,
          organizationId: req.user?.organizationId,
          isDeleted: { $ne: true }
        },
        {
          status: 'completed',
          completedAt: new Date(),
          outcome,
          timeSpent,
          followUpRequired,
          followUpDate,
          updatedBy: req.user?.userId
        },
        { new: true }
      ).populate([
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'contactId', select: 'firstName lastName email' },
        { path: 'dealId', select: 'title value' }
      ]);

      if (!activity) {
        throw new NotFoundError('Activity');
      }

      logger.info(`Activity completed: ${activity.title} by ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Activity marked as complete',
        data: { activity }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming activities for user
   */
  static async getUpcomingActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query as any;
      const userId = req.user?.userId;

      const activities = await Activity.find({
        organizationId: req.user?.organizationId,
        userId,
        isDeleted: { $ne: true },
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $exists: true, $gte: new Date() }
      })
        .populate('contactId', 'firstName lastName email')
        .populate('dealId', 'title value')
        .populate('companyId', 'name')
        .sort({ dueDate: 1 })
        .limit(parseInt(limit));

      const response: ApiResponse = {
        success: true,
        data: { activities }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overdue activities for user
   */
  static async getOverdueActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query as any;
      const userId = req.user?.userId;

      const activities = await Activity.find({
        organizationId: req.user?.organizationId,
        userId,
        isDeleted: { $ne: true },
        status: { $in: ['pending', 'in_progress', 'overdue'] },
        dueDate: { $exists: true, $lt: new Date() }
      })
        .populate('contactId', 'firstName lastName email')
        .populate('dealId', 'title value')
        .populate('companyId', 'name')
        .sort({ dueDate: -1 })
        .limit(parseInt(limit));

      const response: ApiResponse = {
        success: true,
        data: { activities }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get activity statistics
   */
  static async getActivityStats(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      const userId = req.user?.userId;

      const stats = await Activity.aggregate([
        { $match: { organizationId, userId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            completedActivities: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pendingActivities: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            overdueActivities: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $ne: ['$status', 'completed'] },
                      { $lt: ['$dueDate', new Date()] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            }
          }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: stats[0] || {
          totalActivities: 0,
          completedActivities: 0,
          pendingActivities: 0,
          overdueActivities: 0
        }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
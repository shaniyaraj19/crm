import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Deal } from '../models/Deal';
import { Pipeline } from '../models/Pipeline';
import { User } from '../models/User';
import { NotFoundError, ValidationError } from '../errors';
import { HTTP_STATUS, PAGINATION } from '../constants';
import { ApiResponse, DealStatus } from '../types/common';
import { logger } from '../utils/logger';

export class DealController {
  /**
   * Get all deals with filtering and pagination
   */
  static async getDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        sort = 'createdAt',
        order = 'desc',
        search,
        pipelineId,
        stageId,
        assignedTo,
        status,
        priority,
        startDate,
        endDate,
        minValue,
        maxValue,
        tags,
      } = req.query;

      // Build query
      const query: any = { organizationId };

      // Role-based filtering - sales reps can only see their own deals
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      } else if (assignedTo) {
        query.assignedTo = assignedTo;
      }

      // Apply filters
      if (pipelineId) query.pipelineId = pipelineId;
      if (stageId) query.stageId = stageId;
      if (status) query.status = status;
      if (priority) query.priority = priority;

      // Date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      // Value range filter
      if (minValue || maxValue) {
        query.value = {};
        if (minValue) query.value.$gte = Number(minValue);
        if (maxValue) query.value.$lte = Number(maxValue);
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
      }

      // Search filter
      if (search) {
        query.$text = { $search: search as string };
      }

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(Number(limit), PAGINATION.MAX_LIMIT);
      const skip = (pageNum - 1) * limitNum;

      // Sort
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = { [sort as string]: sortOrder };

      // Execute query
      const [deals, total] = await Promise.all([
        Deal.find(query)
          .populate('pipelineId', 'name stages')
          .populate('assignedTo', 'firstName lastName email profilePicture')
          .populate('contactId', 'firstName lastName email company')
          .populate('companyId', 'name industry')
          .populate('createdBy', 'firstName lastName email')
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Deal.countDocuments(query),
      ]);

      const response: ApiResponse = {
        success: true,
        data: { deals },
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // get sepcified company deals
  static async getCompanyDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const deals = await Deal.find({ companyId, organizationId }).populate('stageId', 'name')
      const response: ApiResponse = {
        success: true,
        data: { deals },
      };
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deal by ID
   */
  static async getDealById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;

      const query: any = { _id: id, organizationId };
      
      // Role-based access control
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      const deal = await Deal.findOne(query)
        .populate('pipelineId', 'name stages')
        .populate('assignedTo', 'firstName lastName email profilePicture phone')
        .populate('contactId', 'firstName lastName email phone company')
        .populate('companyId', 'name industry website phone')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .populate('stageHistory.changedBy', 'firstName lastName email');

      if (!deal) {
        throw new NotFoundError('Deal');
      }

      const response: ApiResponse = {
        success: true,
        data: { deal },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new deal
   */
  static async createDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const dealData = req.body;

      // Validate pipeline and stage
      const pipeline = await Pipeline.findOne({ 
        _id: dealData.pipelineId, 
        organizationId 
      });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      const stage = pipeline.stages.find(s => s.name === dealData.stageId);
      if (!stage) {
        throw new NotFoundError('Stage');
      }

      // Set probability from stage if not provided
      if (!dealData.probability) {
        dealData.probability = stage.probability;
      }

      // Validate assigned user
      if (dealData.assignedTo) {
        const assignedUser = await User.findOne({ 
          _id: dealData.assignedTo, 
          organizationId 
        });
        if (!assignedUser) {
          throw new NotFoundError('Assigned user');
        }
      }

      const deal = new Deal({
        ...dealData,
        organizationId,
        createdBy: userId,
        currentStageEnteredAt: new Date(),
      });

      await deal.save();

      // Populate for response
      await deal.populate([
        { path: 'pipelineId', select: 'name stages' },
        { path: 'assignedTo', select: 'firstName lastName email profilePicture' },
        { path: 'contactId', select: 'firstName lastName email' },
        { path: 'companyId', select: 'name industry' },
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Deal created successfully',
        data: { deal },
      };

      logger.info(`Deal created: ${deal.title} by user ${userId}`);
      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update deal
   */
  static async updateDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const updateData = req.body;

      const query: any = { _id: id, organizationId };
      
      // Role-based access control
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      const deal = await Deal.findOne(query);
      if (!deal) {
        throw new NotFoundError('Deal');
      }

      // If updating stage, validate and track history
      if (updateData.stageId && updateData.stageId !== deal.stageId) {
        const pipeline = await Pipeline.findById(deal.pipelineId);
        if (!pipeline) {
          throw new NotFoundError('Pipeline');
        }

        const newStage = pipeline.stages.find(s => s.name === updateData.stageId);
        if (!newStage) {
          throw new NotFoundError('Stage');
        }

        // Move to new stage
        deal.moveToStage(updateData.stageId, updateData.stageChangeReason, userId);
        
        // Update probability from stage
        if (!updateData.probability) {
          updateData.probability = newStage.probability;
        }

        // Update status based on stage
        if (newStage.isClosedWon) {
          updateData.status = DealStatus.WON;
          updateData.actualCloseDate = new Date();
        } else if (newStage.isClosedLost) {
          updateData.status = DealStatus.LOST;
          updateData.actualCloseDate = new Date();
        }
      }

      // Validate assigned user if changed
      if (updateData.assignedTo && updateData.assignedTo !== deal.assignedTo?.toString()) {
        const assignedUser = await User.findOne({ 
          _id: updateData.assignedTo, 
          organizationId 
        });
        if (!assignedUser) {
          throw new NotFoundError('Assigned user');
        }
      }

      // Update deal
      Object.assign(deal, updateData);
      deal.updatedBy = new Types.ObjectId(userId);

      await deal.save();

      // Populate for response
      await deal.populate([
        { path: 'pipelineId', select: 'name stages' },
        { path: 'assignedTo', select: 'firstName lastName email profilePicture' },
        { path: 'contactId', select: 'firstName lastName email' },
        { path: 'companyId', select: 'name industry' },
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Deal updated successfully',
        data: { deal },
      };

      logger.info(`Deal updated: ${deal.title} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete deal
   */
  static async deleteDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;

      const query: any = { _id: id, organizationId };
      
      // Role-based access control
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      const deal = await Deal.findOne(query);
      if (!deal) {
        throw new NotFoundError('Deal');
      }

      // Soft delete using findOneAndUpdate to avoid pre-save hooks
      await Deal.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: new Types.ObjectId(userId)
          }
        },
        { new: true }
      );

      const response: ApiResponse = {
        success: true,
        message: 'Deal deleted successfully',
      };

      logger.info(`Deal deleted: ${deal.title} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Move deal to different stage
   */
  static async moveDealToStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const { stageId, reason } = req.body;

      const query: any = { _id: id, organizationId };
      
      // Role-based access control
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      const deal = await Deal.findOne(query);
      if (!deal) {
        throw new NotFoundError('Deal');
      }

      if (deal.stageId === stageId) {
        throw new ValidationError('Deal is already in this stage');
      }

      // Validate new stage
      const pipeline = await Pipeline.findById(deal.pipelineId);
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      const newStage = pipeline.stages.find(s => s.name === stageId);
      if (!newStage) {
        throw new NotFoundError('Stage');
      }

      if (!newStage.isActive) {
        throw new ValidationError('Cannot move deal to inactive stage');
      }

      // Move deal to new stage
      deal.moveToStage(stageId, reason, userId);
      deal.probability = newStage.probability;
      deal.updatedBy = new Types.ObjectId(userId);

      // Update status based on stage
      if (newStage.isClosedWon) {
        deal.status = DealStatus.WON;
        deal.actualCloseDate = new Date();
      } else if (newStage.isClosedLost) {
        deal.status = DealStatus.LOST;
        deal.actualCloseDate = new Date();
      } else {
        deal.status = DealStatus.OPEN;
        deal.actualCloseDate = null as any;
      }

      await deal.save();

      const response: ApiResponse = {
        success: true,
        message: 'Deal moved successfully',
        data: { deal },
      };

      logger.info(`Deal ${deal.title} moved to stage ${newStage.name} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add note to deal
   */
  static async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const { content, isPrivate = false } = req.body;

      const query: any = { _id: id, organizationId };
      
      // Role-based access control
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      const deal = await Deal.findOne(query);
      if (!deal) {
        throw new NotFoundError('Deal');
      }

      const note = {
        content,
        createdBy: userId,
        createdAt: new Date(),
        isPrivate,
      };

      if (!deal.notes) {
        deal.notes = [];
      }
      deal.notes.push(note);
      deal.updatedBy = new Types.ObjectId(userId);
      await deal.save();

      // Populate the new note
      await deal.populate('notes.createdBy', 'firstName lastName email');

      const response: ApiResponse = {
        success: true,
        message: 'Note added successfully',
        data: { note: deal.notes![deal.notes!.length - 1] },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deal analytics
   */
  static async getDealAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;
      const { period = '30d', pipelineId } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Build query
      const query: any = { organizationId, createdAt: { $gte: startDate } };
      
      // Role-based filtering
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      if (pipelineId) {
        query.pipelineId = pipelineId;
      }

      // Get analytics
      const analytics = await Deal.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalDeals: { $sum: 1 },
            totalValue: { $sum: '$value' },
            avgValue: { $avg: '$value' },
            wonDeals: {
              $sum: { $cond: [{ $eq: ['$status', DealStatus.WON] }, 1, 0] }
            },
            lostDeals: {
              $sum: { $cond: [{ $eq: ['$status', DealStatus.LOST] }, 1, 0] }
            },
            wonValue: {
              $sum: { $cond: [{ $eq: ['$status', DealStatus.WON] }, '$value', 0] }
            },
          }
        }
      ]);

      const result = analytics[0] || {
        totalDeals: 0,
        totalValue: 0,
        avgValue: 0,
        wonDeals: 0,
        lostDeals: 0,
        wonValue: 0,
      };

      // Calculate win rate
      const winRate = result.totalDeals > 0 ? 
        (result.wonDeals / result.totalDeals) * 100 : 0;

      const response: ApiResponse = {
        success: true,
        data: {
          period,
          analytics: {
            ...result,
            winRate: Math.round(winRate * 100) / 100,
          },
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deals by pipeline stage (Kanban view)
   */
  static async getDealsByStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { pipelineId } = req.params;
      const { userId, role } = req.user!;
      // Check if user has organizationId, if not, use userId as organizationId (for single-user setups)
      const organizationId = req.user?.organizationId || req.user?.userId;

      // Validate pipeline
      const pipeline = await Pipeline.findOne({ _id: pipelineId, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      // Build query
      const query: any = { organizationId, pipelineId };
      
      // Role-based filtering
      if (role === 'sales_rep') {
        query.assignedTo = userId;
      }

      // Get deals grouped by stage
      const dealsByStage = await Promise.all(
        pipeline.stages.map(async (stage) => {
          const deals = await Deal.find({ ...query, stageId: stage._id })
            .populate('assignedTo', 'firstName lastName email profilePicture')
            .populate('contactId', 'firstName lastName email')
            .populate('companyId', 'name')
            .sort({ createdAt: -1 })
            .lean();

          const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

          return {
            stage: {
              _id: stage._id,
              name: stage.name,
              color: stage.color,
              probability: stage.probability,
            },
            deals,
            dealCount: deals.length,
            totalValue,
          };
        })
      );

      const response: ApiResponse = {
        success: true,
        data: {
          pipeline: {
            _id: pipeline._id,
            name: pipeline.name,
          },
          stages: dealsByStage,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
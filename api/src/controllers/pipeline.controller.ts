import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Pipeline, IPipelineStage } from '../models/Pipeline';
import { Deal } from '../models/Deal';
import { NotFoundError, ValidationError, ConflictError } from '../errors';
import { HTTP_STATUS, PIPELINE_SETTINGS } from '../constants';
import { ApiResponse } from '../types/common';
import { logger } from '../utils/logger';

export class PipelineController {
  /**
   * Get all pipelines for organization
   */
  static async getPipelines(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.user!;
      const { includeInactive = false } = req.query;

      const query: any = { organizationId };
      if (!includeInactive) {
        query.isActive = true;
      }

      const pipelines = await Pipeline.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ isDefault: -1, createdAt: -1 });

      const response: ApiResponse = {
        success: true,
        data: { pipelines },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pipeline by ID
   */
  static async getPipelineById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId })
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      // Get deals count for each stage
      const stagesWithCounts = await Promise.all(
        pipeline.stages.map(async (stage) => {
          const dealCount = await Deal.countDocuments({
            pipelineId: pipeline._id,
            stageId: stage._id,
            organizationId,
          });

          const totalValue = await Deal.aggregate([
            {
              $match: {
                pipelineId: pipeline._id,
                stageId: stage._id,
                organizationId: organizationId,
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$value' }
              }
            }
          ]);

          return {
            ...stage,
            dealCount,
            totalValue: totalValue[0]?.total || 0,
          };
        })
      );

      const response: ApiResponse = {
        success: true,
        data: {
          pipeline: {
            ...pipeline.toObject(),
            stages: stagesWithCounts,
          },
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new pipeline
   */
  static async createPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId, userId } = req.user!;
      const pipelineData = req.body;

      // Validate stages
      if (!pipelineData.stages || pipelineData.stages.length < 2) {
        throw new ValidationError('Pipeline must have at least 2 stages');
      }

      // If this is set as default, unset other default pipelines
      if (pipelineData.isDefault) {
        await Pipeline.updateMany(
          { organizationId, isDefault: true },
          { isDefault: false }
        );
      }

      // Create pipeline with default stages if none provided
      if (!pipelineData.stages.length) {
        pipelineData.stages = PIPELINE_SETTINGS.DEFAULT_STAGES.map((stage, index) => ({
          ...stage,
          order: index,
          isActive: true,
          isClosedWon: stage.name === 'Closed Won',
          isClosedLost: stage.name === 'Closed Lost',
        }));
      }

      const pipeline = new Pipeline({
        ...pipelineData,
        organizationId,
        createdBy: userId,
      });

      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Pipeline created successfully',
        data: { pipeline },
      };

      logger.info(`Pipeline created: ${pipeline.name} by user ${userId}`);
      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update pipeline
   */
  static async updatePipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId, userId } = req.user!;
      const updateData = req.body;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      // If setting as default, unset other default pipelines
      if (updateData.isDefault && !pipeline.isDefault) {
        await Pipeline.updateMany(
          { organizationId, isDefault: true, _id: { $ne: id } },
          { isDefault: false }
        );
      }

      // Update pipeline
      Object.assign(pipeline, updateData);
      pipeline.updatedBy = new Types.ObjectId(userId);

      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Pipeline updated successfully',
        data: { pipeline },
      };

      logger.info(`Pipeline updated: ${pipeline.name} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete pipeline
   */
  static async deletePipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId, userId } = req.user!;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      // Check if pipeline has deals
      const dealCount = await Deal.countDocuments({ pipelineId: id });
      if (dealCount > 0) {
        throw new ConflictError('Cannot delete pipeline with existing deals');
      }

      // Check if it's the default pipeline
      if (pipeline.isDefault) {
        throw new ConflictError('Cannot delete the default pipeline');
      }

      // Soft delete
      pipeline.isDeleted = true;
      pipeline.deletedAt = new Date();
      pipeline.deletedBy = new Types.ObjectId(userId);
      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Pipeline deleted successfully',
      };

      logger.info(`Pipeline deleted: ${pipeline.name} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add stage to pipeline
   */
  static async addStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId, userId } = req.user!;
      const stageData = req.body;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      if (pipeline.stages.length >= PIPELINE_SETTINGS.MAX_STAGES) {
        throw new ValidationError(`Pipeline cannot have more than ${PIPELINE_SETTINGS.MAX_STAGES} stages`);
      }

      // Set order for new stage
      const maxOrder = Math.max(...pipeline.stages.map(s => s.order), -1);
      const newStage: IPipelineStage = {
        ...stageData,
        order: maxOrder + 1,
        isActive: true,
      };

      pipeline.stages.push(newStage);
      pipeline.updatedBy = new Types.ObjectId(userId);
      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Stage added successfully',
        data: { pipeline },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update stage in pipeline
   */
  static async updateStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, stageId } = req.params;
      const { organizationId, userId } = req.user!;
      const stageData = req.body;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      const stage = pipeline.stages.find(s => s._id?.toString() === stageId);
      if (!stage) {
        throw new NotFoundError('Stage');
      }

      // Update stage
      Object.assign(stage, stageData);
      pipeline.updatedBy = new Types.ObjectId(userId);
      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Stage updated successfully',
        data: { pipeline },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove stage from pipeline
   */
  static async removeStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, stageId } = req.params;
      const { organizationId, userId } = req.user!;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      if (pipeline.stages.length <= PIPELINE_SETTINGS.MIN_STAGES) {
        throw new ValidationError(`Pipeline must have at least ${PIPELINE_SETTINGS.MIN_STAGES} stages`);
      }

      // Check if stage has deals
      const dealCount = await Deal.countDocuments({ pipelineId: id, stageId });
      if (dealCount > 0) {
        throw new ConflictError('Cannot remove stage with existing deals');
      }

      // Remove stage
      pipeline.stages = pipeline.stages.filter(s => s._id?.toString() !== stageId);
      pipeline.updatedBy = new Types.ObjectId(userId);
      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Stage removed successfully',
        data: { pipeline },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder stages in pipeline
   */
  static async reorderStages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId, userId } = req.user!;
      const { stageOrders } = req.body; // Array of { stageId, order }

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      // Update stage orders
      stageOrders.forEach((item: { stageId: string; order: number }) => {
        const stage = pipeline.stages.find(s => s._id?.toString() === item.stageId);
        if (stage) {
          stage.order = item.order;
        }
      });

      pipeline.updatedBy = new Types.ObjectId(userId);
      await pipeline.save();

      const response: ApiResponse = {
        success: true,
        message: 'Stages reordered successfully',
        data: { pipeline },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pipeline analytics
   */
  static async getPipelineAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const pipeline = await Pipeline.findOne({ _id: id, organizationId });
      if (!pipeline) {
        throw new NotFoundError('Pipeline');
      }

      // Get deals analytics
      const analytics = await Deal.aggregate([
        { $match: { pipelineId: pipeline._id, organizationId } },
        {
          $group: {
            _id: '$stageId',
            dealCount: { $sum: 1 },
            totalValue: { $sum: '$value' },
            avgValue: { $avg: '$value' },
            avgDaysInStage: { $avg: '$daysInCurrentStage' },
          }
        }
      ]);

      // Calculate conversion rates
      const conversionRates = pipeline.stages.map((stage, index) => {
        const stageAnalytics = analytics.find(a => a._id === stage._id?.toString());
        const nextStage = pipeline.stages[index + 1];
        const nextStageAnalytics = nextStage ? 
          analytics.find(a => a._id === nextStage._id?.toString()) : null;

        const conversionRate = nextStageAnalytics && stageAnalytics ?
          (nextStageAnalytics.dealCount / stageAnalytics.dealCount) * 100 : 0;

        return {
          stageId: stage._id,
          stageName: stage.name,
          dealCount: stageAnalytics?.dealCount || 0,
          totalValue: stageAnalytics?.totalValue || 0,
          avgValue: stageAnalytics?.avgValue || 0,
          avgDaysInStage: stageAnalytics?.avgDaysInStage || 0,
          conversionRate,
        };
      });

      const response: ApiResponse = {
        success: true,
        data: {
          pipelineId: pipeline._id,
          pipelineName: pipeline.name,
          analytics: conversionRates,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
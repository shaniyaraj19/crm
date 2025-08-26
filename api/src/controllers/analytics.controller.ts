import { Request, Response, NextFunction } from 'express';
import { Deal } from '../models/Deal';
import { Contact } from '../models/Contact';

import { Activity } from '../models/Activity';
import { HTTP_STATUS } from '../constants';
import { ApiResponse } from '../types/common';


export class AnalyticsController {
  /**
   * Get dashboard KPIs
   */
  static async getDashboardKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      const { dateRange = '30' } = req.query as any; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Get total revenue (won deals)
      const revenueStats = await Deal.aggregate([
        {
          $match: {
            organizationId,
            status: 'won',
            actualCloseDate: { $gte: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$value' },
            dealsCount: { $sum: 1 }
          }
        }
      ]);

      // Get active deals
      const activeDeals = await Deal.countDocuments({
        organizationId,
        status: 'open',
        isDeleted: { $ne: true }
      });

      // Get total pipeline value
      const pipelineValue = await Deal.aggregate([
        {
          $match: {
            organizationId,
            status: 'open',
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$value' }
          }
        }
      ]);

      // Get conversion rate
      const totalLeads = await Contact.countDocuments({
        organizationId,
        type: 'lead',
        createdAt: { $gte: startDate },
        isDeleted: { $ne: true }
      });

      const convertedLeads = await Contact.countDocuments({
        organizationId,
        type: 'customer',
        createdAt: { $gte: startDate },
        isDeleted: { $ne: true }
      });

      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Get new contacts
      const newContacts = await Contact.countDocuments({
        organizationId,
        createdAt: { $gte: startDate },
        isDeleted: { $ne: true }
      });

      // Calculate previous period for comparison
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - parseInt(dateRange));

      const prevRevenueStats = await Deal.aggregate([
        {
          $match: {
            organizationId,
            status: 'won',
            actualCloseDate: { $gte: prevStartDate, $lt: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$value' }
          }
        }
      ]);

      const currentRevenue = revenueStats[0]?.totalRevenue || 0;
      const prevRevenue = prevRevenueStats[0]?.totalRevenue || 0;
      const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      const kpis = {
        totalRevenue: {
          value: currentRevenue,
          change: revenueChange,
          changeType: revenueChange >= 0 ? 'positive' : 'negative'
        },
        activeDeals: {
          value: activeDeals,
          change: 0, // Could calculate if needed
          changeType: 'neutral'
        },
        pipelineValue: {
          value: pipelineValue[0]?.totalValue || 0,
          change: 0,
          changeType: 'neutral'
        },
        conversionRate: {
          value: conversionRate,
          change: 0,
          changeType: 'neutral'
        },
        newContacts: {
          value: newContacts,
          change: 0,
          changeType: 'neutral'
        }
      };

      const response: ApiResponse = {
        success: true,
        data: { kpis }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales performance data
   */
  static async getSalesPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      const { period = '12' } = req.query as any; // months

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(period));

      const salesData = await Deal.aggregate([
        {
          $match: {
            organizationId,
            status: 'won',
            actualCloseDate: { $gte: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$actualCloseDate' },
              month: { $month: '$actualCloseDate' }
            },
            revenue: { $sum: '$value' },
            deals: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: { salesData }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pipeline funnel data
   */
  static async getPipelineFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;

      const pipelineData = await Deal.aggregate([
        {
          $match: {
            organizationId,
            status: 'open',
            isDeleted: { $ne: true }
          }
        },
        {
          $lookup: {
            from: 'pipelines',
            localField: 'pipelineId',
            foreignField: '_id',
            as: 'pipeline'
          }
        },
        {
          $unwind: '$pipeline'
        },
        {
          $unwind: '$pipeline.stages'
        },
        {
          $match: {
            $expr: { $eq: ['$stageId', '$pipeline.stages._id'] }
          }
        },
        {
          $group: {
            _id: {
              stageId: '$stageId',
              stageName: '$pipeline.stages.name',
              stageOrder: '$pipeline.stages.order'
            },
            count: { $sum: 1 },
            value: { $sum: '$value' }
          }
        },
        {
          $sort: { '_id.stageOrder': 1 }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: { pipelineData }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team performance
   */
  static async getTeamPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      const { period = '30' } = req.query as any; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const teamPerformance = await Deal.aggregate([
        {
          $match: {
            organizationId,
            actualCloseDate: { $gte: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignedUser'
          }
        },
        {
          $unwind: { path: '$assignedUser', preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: '$assignedTo',
            userName: { $first: { $concat: ['$assignedUser.firstName', ' ', '$assignedUser.lastName'] } },
            totalDeals: { $sum: 1 },
            wonDeals: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$value', 0] } },
            avgDealSize: { $avg: { $cond: [{ $eq: ['$status', 'won'] }, '$value', null] } }
          }
        },
        {
          $addFields: {
            winRate: { $multiply: [{ $divide: ['$wonDeals', '$totalDeals'] }, 100] }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: { teamPerformance }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lead source analysis
   */
  static async getLeadSourceAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;

      const leadSources = await Contact.aggregate([
        {
          $match: {
            organizationId,
            leadSource: { $exists: true, $ne: null },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: '$leadSource',
            count: { $sum: 1 },
            customers: { $sum: { $cond: [{ $eq: ['$type', 'customer'] }, 1, 0] } }
          }
        },
        {
          $addFields: {
            conversionRate: { $multiply: [{ $divide: ['$customers', '$count'] }, 100] }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: { leadSources }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get activity summary
   */
  static async getActivitySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      const { period = '7' } = req.query as any; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const activitySummary = await Activity.aggregate([
        {
          $match: {
            organizationId,
            createdAt: { $gte: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        },
        {
          $addFields: {
            completionRate: { $multiply: [{ $divide: ['$completed', '$count'] }, 100] }
          }
        }
      ]);

      const response: ApiResponse = {
        success: true,
        data: { activitySummary }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue forecasting
   */
  static async getRevenueForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;

      // Get open deals with their probabilities
      const openDeals = await Deal.find({
        organizationId,
        status: 'open',
        isDeleted: { $ne: true }
      }).select('value probability expectedCloseDate');

      // Group by expected close month
      const forecastData: { [key: string]: number } = {};
      
      openDeals.forEach(deal => {
        if (deal.expectedCloseDate) {
          const monthKey = `${deal.expectedCloseDate.getFullYear()}-${deal.expectedCloseDate.getMonth() + 1}`;
          const forecastValue = (deal.value * deal.probability) / 100;
          forecastData[monthKey] = (forecastData[monthKey] || 0) + forecastValue;
        }
      });

      // Convert to array format
      const forecast = Object.entries(forecastData).map(([month, value]) => ({
        month,
        forecastRevenue: value
      }));

      const response: ApiResponse = {
        success: true,
        data: { forecast }
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
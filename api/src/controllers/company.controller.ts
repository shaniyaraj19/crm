import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Company } from '../models/Company';
import { Contact } from '../models/Contact';
import { Deal } from '../models/Deal';
import { NotFoundError, ValidationError, ConflictError } from '../errors';
import { HTTP_STATUS, PAGINATION } from '../constants';
import { ApiResponse } from '../types/common';
import { logger } from '../utils/logger';

export class CompanyController {
  /**
   * Get all companies with filtering and pagination
   */
  static async getCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.user!;
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        sort = 'createdAt',
        order = 'desc',
        search,
        industry,
        status,
        lifecycle,
        employeeCountMin,
        employeeCountMax,
        revenueMin,
        revenueMax,
        tags,
        startDate,
        endDate,
      } = req.query;

      // Build query
      const query: any = { organizationId };

      // Apply filters
      if (industry) query.industry = new RegExp(industry as string, 'i');
      if (status) query.status = status;
      if (lifecycle) query.lifecycle = lifecycle;

      // Employee count range
      if (employeeCountMin || employeeCountMax) {
        query.employeeCount = {};
        if (employeeCountMin) query.employeeCount.$gte = Number(employeeCountMin);
        if (employeeCountMax) query.employeeCount.$lte = Number(employeeCountMax);
      }

      // Revenue range
      if (revenueMin || revenueMax) {
        query.annualRevenue = {};
        if (revenueMin) query.annualRevenue.$gte = Number(revenueMin);
        if (revenueMax) query.annualRevenue.$lte = Number(revenueMax);
      }

      // Date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
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
      const [companies, total] = await Promise.all([
        Company.find(query)
          .populate('parentCompanyId', 'name industry')
          .populate('createdBy', 'firstName lastName email')
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Company.countDocuments(query),
      ]);

      const response: ApiResponse = {
        success: true,
        data: { companies },
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

  /**
   * Get company by ID
   */
  static async getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const company = await Company.findOne({ _id: id, organizationId })
        .populate('parentCompanyId', 'name industry website')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!company) {
        throw new NotFoundError('Company');
      }

      // Get related data
      const [contacts, deals, subsidiaries] = await Promise.all([
        Contact.find({ companyId: company._id, organizationId })
          .select('firstName lastName email jobTitle')
          .limit(10),
        Deal.find({ companyId: company._id, organizationId })
          .populate('pipelineId', 'name')
          .populate('assignedTo', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(10),
        Company.find({ parentCompanyId: company._id, organizationId })
          .select('name industry status')
      ]);

      const response: ApiResponse = {
        success: true,
        data: { 
          company,
          relatedContacts: contacts,
          relatedDeals: deals,
          subsidiaries,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new company
   */
  static async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId, userId } = req.user!;
      const companyData = req.body;

      // Check if company name already exists
      const existingCompany = await Company.findOne({
        name: companyData.name,
        organizationId,
      });
      if (existingCompany) {
        throw new ConflictError('Company with this name already exists');
      }

      // Validate parent company if provided
      if (companyData.parentCompanyId) {
        const parentCompany = await Company.findOne({
          _id: companyData.parentCompanyId,
          organizationId,
        });
        if (!parentCompany) {
          throw new NotFoundError('Parent company');
        }
      }

      const company = new Company({
        ...companyData,
        organizationId,
        createdBy: userId,
      });

      await company.save();

      // Populate for response
      await company.populate([
        { path: 'parentCompanyId', select: 'name industry' },
        { path: 'createdBy', select: 'firstName lastName email' },
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Company created successfully',
        data: { company },
      };

      logger.info(`Company created: ${company.name} by user ${userId}`);
      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update company
   */
  static async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId, userId } = req.user!;
      const updateData = req.body;

      const company = await Company.findOne({ _id: id, organizationId });
      if (!company) {
        throw new NotFoundError('Company');
      }

      // Check name uniqueness if name is being updated
      if (updateData.name && updateData.name !== company.name) {
        const existingCompany = await Company.findOne({
          name: updateData.name,
          organizationId,
          _id: { $ne: id },
        });
        if (existingCompany) {
          throw new ConflictError('Company with this name already exists');
        }
      }

      // Validate new parent company if being changed
      if (updateData.parentCompanyId && updateData.parentCompanyId !== company.parentCompanyId?.toString()) {
        // Prevent circular hierarchy
        if (updateData.parentCompanyId === id) {
          throw new ValidationError('Company cannot be its own parent');
        }

        const parentCompany = await Company.findOne({
          _id: updateData.parentCompanyId,
          organizationId,
        });
        if (!parentCompany) {
          throw new NotFoundError('Parent company');
        }

        // Check if the new parent is a subsidiary of this company
        const checkHierarchy = async (companyId: string, targetId: string): Promise<boolean> => {
          const comp = await Company.findById(companyId);
          if (!comp || !comp.parentCompanyId) return false;
          if (comp.parentCompanyId.toString() === targetId) return true;
          return checkHierarchy(comp.parentCompanyId.toString(), targetId);
        };

        const wouldCreateCycle = await checkHierarchy(updateData.parentCompanyId, id);
        if (wouldCreateCycle) {
          throw new ValidationError('Cannot create circular parent-child relationship');
        }
      }

      // Update company
      Object.assign(company, updateData);
      company.updatedBy = new Types.ObjectId(userId);

      await company.save();

      // Populate for response
      await company.populate([
        { path: 'parentCompanyId', select: 'name industry' },
        { path: 'updatedBy', select: 'firstName lastName email' },
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Company updated successfully',
        data: { company },
      };

      logger.info(`Company updated: ${company.name} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete company
   */
  static async deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId, userId } = req.user!;

      const company = await Company.findOne({ _id: id, organizationId });
      if (!company) {
        throw new NotFoundError('Company');
      }

      // // Check if company has contacts or deals
      // const [contactCount, dealCount, subsidiaryCount] = await Promise.all([
      //   Contact.countDocuments({ companyId: id }),
      //   Deal.countDocuments({ companyId: id }),
      //   Company.countDocuments({ parentCompanyId: id }),
      // ]);

      // if (contactCount > 0 || dealCount > 0 || subsidiaryCount > 0) {
      //   throw new ConflictError('Cannot delete company with associated contacts, deals, or subsidiaries');
      // }

      // Soft delete
      company.isDeleted = true;
      company.deletedAt = new Date();
      company.deletedBy = new Types.ObjectId(userId);
      await company.save();

      const response: ApiResponse = {
        success: true,
        message: 'Company deleted successfully',
      };

      logger.info(`Company deleted: ${company.name} by user ${userId}`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get company analytics
   */
  static async getCompanyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.user!;
      const { period = '30d' } = req.query;

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

      // Get analytics
      const analytics = await Company.aggregate([
        { $match: { organizationId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalCompanies: { $sum: 1 },
            activeCompanies: {
              $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
            },
            customerCompanies: {
              $sum: { $cond: [{ $eq: ['$lifecycle', 'Customer'] }, 1, 0] }
            },
            prospectCompanies: {
              $sum: { $cond: [{ $eq: ['$lifecycle', 'Prospect'] }, 1, 0] }
            },
            avgEmployeeCount: { $avg: '$employeeCount' },
            totalRevenue: { $sum: '$annualRevenue' },
            avgRevenue: { $avg: '$annualRevenue' },
          }
        }
      ]);

      const result = analytics[0] || {
        totalCompanies: 0,
        activeCompanies: 0,
        customerCompanies: 0,
        prospectCompanies: 0,
        avgEmployeeCount: 0,
        totalRevenue: 0,
        avgRevenue: 0,
      };

      // Get top industries
      const industries = await Company.aggregate([
        { $match: { organizationId, industry: { $ne: null } } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Get company size distribution
      const sizeDistribution = await Company.aggregate([
        { $match: { organizationId, employeeCount: { $ne: null } } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: ['$employeeCount', 10] }, then: 'Startup' },
                  { case: { $lte: ['$employeeCount', 50] }, then: 'Small' },
                  { case: { $lte: ['$employeeCount', 200] }, then: 'Medium' },
                  { case: { $lte: ['$employeeCount', 1000] }, then: 'Large' },
                ],
                default: 'Enterprise'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          period,
          analytics: {
            ...result,
            avgEmployeeCount: Math.round(result.avgEmployeeCount || 0),
            avgRevenue: Math.round(result.avgRevenue || 0),
          },
          industries,
          sizeDistribution,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get company hierarchy
   */
  static async getCompanyHierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const company = await Company.findOne({ _id: id, organizationId });
      if (!company) {
        throw new NotFoundError('Company');
      }

      const hierarchy = await company.getHierarchy();

      const response: ApiResponse = {
        success: true,
        data: { hierarchy },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk import companies
   */
  static async bulkImportCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId, userId } = req.user!;
      const { companies } = req.body;

      if (!Array.isArray(companies) || companies.length === 0) {
        throw new ValidationError('Companies array is required');
      }

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as any[],
      };

      for (let i = 0; i < companies.length; i++) {
        try {
          const companyData = companies[i];
          
          // Check if company already exists
          const existingCompany = await Company.findOne({
            name: companyData.name,
            organizationId,
          });
          if (existingCompany) {
            results.skipped++;
            continue;
          }

          const company = new Company({
            ...companyData,
            organizationId,
            createdBy: userId,
          });

          await company.save();
          results.imported++;
        } catch (error) {
          results.errors.push({
            index: i,
            company: companies[i],
            error: (error as Error).message,
          });
        }
      }

      const response: ApiResponse = {
        success: true,
        message: `Import completed: ${results.imported} imported, ${results.skipped} skipped`,
        data: results,
      };

      logger.info(`Bulk company import by user ${userId}: ${results.imported} imported, ${results.skipped} skipped`);
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search companies
   */
  static async searchCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = req.user!;
      const { q } = req.query;

      if (!q) {
        const response: ApiResponse = {
          success: true,
          data: [],
        };
        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      const companies = await Company.find({
        organizationId,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { industry: { $regex: q, $options: 'i' } },
        ],
      }).limit(20);

      const response: ApiResponse = {
        success: true,
        data: companies,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get company statistics
   */
  static async getCompanyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = req.user!;

      const stats = await Company.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalRevenue: { $sum: '$annualRevenue' },
            avgEmployeeCount: { $avg: '$employeeCount' },
          },
        },
      ]);

      const response: ApiResponse = {
        success: true,
        data: stats[0] || { total: 0, totalRevenue: 0, avgEmployeeCount: 0 },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single company
   */
  static async getCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const company = await Company.findOne({ _id: id, organizationId });
      if (!company) {
        throw new NotFoundError('Company');
      }

      const response: ApiResponse = {
        success: true,
        data: company,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get company contacts
   */
  static async getCompanyContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      // First verify company exists
      const company = await Company.findOne({ _id: id, organizationId });
      if (!company) {
        throw new NotFoundError('Company');
      }

      // Find contacts for this company
      const contacts = await Contact.find({ companyId: id, organizationId });

      const response: ApiResponse = {
        success: true,
        data: contacts,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get company deals
   */
  static async getCompanyDeals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      // First verify company exists
      const company = await Company.findOne({ _id: id, organizationId });
      if (!company) {
        throw new NotFoundError('Company');
      }

      // Find deals for this company
      const deals = await Deal.find({ companyId: id, organizationId });

      const response: ApiResponse = {
        success: true,
        data: deals,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
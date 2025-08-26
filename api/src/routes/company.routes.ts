import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { validate, validateQuery } from '../middleware/validation';
import { authenticate, authorize, authorizeOrganization } from '../middleware/auth';
import { Permission } from '../types/common';
import { z } from 'zod';

const router = Router();

// Apply authentication and organization check to all routes
router.use(authenticate);
router.use(authorizeOrganization);

// Validation schemas
const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required').max(200),
    description: z.string().max(2000).optional(),
    industry: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    fax: z.string().optional(),
    employeeCount: z.number().min(1).optional(),
    annualRevenue: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
    companyType: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    billingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    linkedinUrl: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    facebookUrl: z.string().url().optional(),
    leadSource: z.string().optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.string().optional(),
    parentCompanyId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    tags: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    customFields: z.record(z.any()).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    notes: z.string().max(5000).optional()
  })
});

const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    industry: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    fax: z.string().optional(),
    employeeCount: z.number().min(1).optional(),
    annualRevenue: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
    companyType: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    billingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    linkedinUrl: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    facebookUrl: z.string().url().optional(),
    leadSource: z.string().optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.string().optional(),
    parentCompanyId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    tags: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    customFields: z.record(z.any()).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    notes: z.string().max(5000).optional()
  })
});

const companyQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  search: z.string().optional(),
  industry: z.string().optional(),
  assignedTo: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
  })
});

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management
 */

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of companies
 */
router.get(
  '/',
  authorize(Permission.COMPANY_READ),
  validateQuery(companyQuerySchema),
  CompanyController.getCompanies
);

/**
 * @swagger
 * /api/v1/companies/search:
 *   get:
 *     summary: Search companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  '/search',
  authorize(Permission.COMPANY_READ),
  CompanyController.searchCompanies
);

/**
 * @swagger
 * /api/v1/companies/stats:
 *   get:
 *     summary: Get company statistics
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company statistics
 */
router.get(
  '/stats',
  authorize(Permission.COMPANY_READ),
  CompanyController.getCompanyStats
);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 */
router.get(
  '/:id',
  authorize(Permission.COMPANY_READ),
  validate(idParamSchema),
  CompanyController.getCompany
);

/**
 * @swagger
 * /api/v1/companies/{id}/contacts:
 *   get:
 *     summary: Get company contacts
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company contacts
 */
router.get(
  '/:id/contacts',
  authorize(Permission.COMPANY_READ),
  validate(idParamSchema),
  CompanyController.getCompanyContacts
);

/**
 * @swagger
 * /api/v1/companies/{id}/deals:
 *   get:
 *     summary: Get company deals
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deals
 */
router.get(
  '/:id/deals',
  authorize(Permission.COMPANY_READ),
  validate(idParamSchema),
  CompanyController.getCompanyDeals
);

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Create new company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created successfully
 */
router.post(
  '/',
  authorize(Permission.COMPANY_CREATE),
  validate(createCompanySchema),
  CompanyController.createCompany
);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   put:
 *     summary: Update company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company updated successfully
 */
router.put(
  '/:id',
  authorize(Permission.COMPANY_UPDATE),
  validate(idParamSchema),
  validate(updateCompanySchema),
  CompanyController.updateCompany
);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   delete:
 *     summary: Delete company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted successfully
 */
router.delete(
  '/:id',
  authorize(Permission.COMPANY_DELETE),
  validate(idParamSchema),
  CompanyController.deleteCompany
);

export default router;
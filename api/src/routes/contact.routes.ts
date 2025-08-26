import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { validate, validateQuery } from '../middleware/validation';
import { authenticate, authorize, authorizeOrganization } from '../middleware/auth';
import { Permission } from '../types/common';
import { z } from 'zod';

const router = Router();

// Apply authentication and organization check to all routes
router.use(authenticate);
router.use(authorizeOrganization);

// Validation schemas
const createContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    type: z.enum(['lead', 'prospect', 'customer', 'partner']).default('lead'),
    companyId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadSource: z.string().optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    website: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    preferences: z.object({
      emailOptIn: z.boolean().optional(),
      smsOptIn: z.boolean().optional(),
      callOptIn: z.boolean().optional(),
      preferredContactMethod: z.string().optional(),
      timezone: z.string().optional()
    }).optional(),
    tags: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    customFields: z.record(z.any()).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    notes: z.string().max(5000).optional()
  })
});

const updateContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    type: z.enum(['lead', 'prospect', 'customer', 'partner']).optional(),
    companyId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadSource: z.string().optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    website: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    preferences: z.object({
      emailOptIn: z.boolean().optional(),
      smsOptIn: z.boolean().optional(),
      callOptIn: z.boolean().optional(),
      preferredContactMethod: z.string().optional(),
      timezone: z.string().optional()
    }).optional(),
    tags: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    customFields: z.record(z.any()).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    notes: z.string().max(5000).optional()
  })
});

const bulkActionSchema = z.object({
  body: z.object({
    action: z.enum(['delete', 'assign', 'updateStatus', 'addTags']),
    contactIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
    data: z.object({
      assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
      status: z.string().optional(),
      tags: z.array(z.string()).optional()
    }).optional()
  })
});

const contactQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  search: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  company: z.string().optional(),
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
 *   name: Contacts
 *   description: Contact management
 */

/**
 * @swagger
 * /api/v1/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
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
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contacts
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(Permission.CONTACT_READ),
  validateQuery(contactQuerySchema),
  ContactController.getContacts
);

/**
 * @swagger
 * /api/v1/contacts/search:
 *   get:
 *     summary: Search contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  '/search',
  authorize(Permission.CONTACT_READ),
  ContactController.searchContacts
);

/**
 * @swagger
 * /api/v1/contacts/stats:
 *   get:
 *     summary: Get contact statistics
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact statistics
 */
router.get(
  '/stats',
  authorize(Permission.CONTACT_READ),
  ContactController.getContactStats
);

/**
 * @swagger
 * /api/v1/contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
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
 *         description: Contact details
 *       404:
 *         description: Contact not found
 */
router.get(
  '/:id',
  authorize(Permission.CONTACT_READ),
  validate(idParamSchema),
  ContactController.getContact
);

/**
 * @swagger
 * /api/v1/contacts:
 *   post:
 *     summary: Create new contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               companyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authorize(Permission.CONTACT_CREATE),
  validate(createContactSchema),
  ContactController.createContact
);

/**
 * @swagger
 * /api/v1/contacts/{id}:
 *   put:
 *     summary: Update contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       404:
 *         description: Contact not found
 */
router.put(
  '/:id',
  authorize(Permission.CONTACT_UPDATE),
  validate(idParamSchema),
  validate(updateContactSchema),
  ContactController.updateContact
);

/**
 * @swagger
 * /api/v1/contacts/{id}:
 *   delete:
 *     summary: Delete contact
 *     tags: [Contacts]
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
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 */
router.delete(
  '/:id',
  authorize(Permission.CONTACT_DELETE),
  validate(idParamSchema),
  ContactController.deleteContact
);

/**
 * @swagger
 * /api/v1/contacts/bulk-actions:
 *   post:
 *     summary: Perform bulk actions on contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - contactIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete, assign, updateStatus, addTags]
 *               contactIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bulk action completed
 */
router.post(
  '/bulk-actions',
  authorize(Permission.CONTACT_UPDATE),
  validate(bulkActionSchema),
  ContactController.bulkActions
);

export default router;
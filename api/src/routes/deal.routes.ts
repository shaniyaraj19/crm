import { Router } from 'express';
import { DealController } from '../controllers/deal.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { Permission } from '../types/common';
import {
  createDealSchema,
  updateDealSchema,
  moveDealToStageSchema,
  addNoteSchema,
  dealQuerySchema,
  dealAnalyticsQuerySchema,
  dealIdParamSchema,
  dealPipelineIdParamSchema,
} from '../schemas/deal.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/deals:
 *   get:
 *     tags: [Deals]
 *     summary: Get all deals with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: pipelineId
 *         schema:
 *           type: string
 *         description: Filter by pipeline ID
 *       - in: query
 *         name: stageId
 *         schema:
 *           type: string
 *         description: Filter by stage ID
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, won, lost, pending]
 *         description: Filter by deal status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by deal priority
 *     responses:
 *       200:
 *         description: Deals retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  validateQuery(dealQuerySchema),
  authorize(Permission.DEAL_READ),
  DealController.getDeals
);

/**
 * @swagger
 * /api/v1/deals/{id}:
 *   get:
 *     tags: [Deals]
 *     summary: Get deal by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deal not found
 */
router.get(
  '/:id',
  validateParams(dealIdParamSchema),
  authorize(Permission.DEAL_READ),
  DealController.getDealById
);

/**
 * @swagger
 * /api/v1/deals:
 *   post:
 *     tags: [Deals]
 *     summary: Create new deal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - pipelineId
 *               - stageId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               value:
 *                 type: number
 *               currency:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               expectedCloseDate:
 *                 type: string
 *                 format: date-time
 *               pipelineId:
 *                 type: string
 *               stageId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               contactId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               source:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Deal created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  validate(createDealSchema),
  authorize(Permission.DEAL_CREATE),
  DealController.createDeal
);

/**
 * @swagger
 * /api/v1/deals/{id}:
 *   put:
 *     tags: [Deals]
 *     summary: Update deal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               value:
 *                 type: number
 *               priority:
 *                 type: string
 *               expectedCloseDate:
 *                 type: string
 *                 format: date-time
 *               stageId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               stageChangeReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deal updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.put(
  '/:id',
  validateParams(dealIdParamSchema),
  validate(updateDealSchema),
  authorize(Permission.DEAL_UPDATE),
  DealController.updateDeal
);

/**
 * @swagger
 * /api/v1/deals/{id}:
 *   delete:
 *     tags: [Deals]
 *     summary: Delete deal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.delete(
  '/:id',
  validateParams(dealIdParamSchema),
  authorize(Permission.DEAL_DELETE),
  DealController.deleteDeal
);

/**
 * @swagger
 * /api/v1/deals/{id}/move:
 *   put:
 *     tags: [Deals]
 *     summary: Move deal to different stage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stageId
 *             properties:
 *               stageId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deal moved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.put(
  '/:id/move',
  validateParams(dealIdParamSchema),
  validate(moveDealToStageSchema),
  authorize(Permission.DEAL_UPDATE),
  DealController.moveDealToStage
);

/**
 * @swagger
 * /api/v1/deals/{id}/notes:
 *   post:
 *     tags: [Deals]
 *     summary: Add note to deal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Note added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.post(
  '/:id/notes',
  validateParams(dealIdParamSchema),
  validate(addNoteSchema),
  authorize(Permission.DEAL_UPDATE),
  DealController.addNote
);

/**
 * @swagger
 * /api/v1/deals/analytics:
 *   get:
 *     tags: [Deals]
 *     summary: Get deal analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Analytics period
 *       - in: query
 *         name: pipelineId
 *         schema:
 *           type: string
 *         description: Filter by pipeline ID
 *     responses:
 *       200:
 *         description: Deal analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/analytics',
  validateQuery(dealAnalyticsQuerySchema),
  authorize(Permission.REPORT_READ),
  DealController.getDealAnalytics
);

/**
 * @swagger
 * /api/v1/deals/pipeline/{pipelineId}/kanban:
 *   get:
 *     tags: [Deals]
 *     summary: Get deals by pipeline stage (Kanban view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pipelineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     responses:
 *       200:
 *         description: Deals by stage retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pipeline not found
 */
router.get(
  '/pipeline/:pipelineId/kanban',
  validateParams(dealPipelineIdParamSchema),
  authorize(Permission.DEAL_READ),
  DealController.getDealsByStage
);

export default router;
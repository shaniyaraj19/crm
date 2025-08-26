import { Router } from 'express';
import { PipelineController } from '../controllers/pipeline.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { Permission } from '../types/common';
import {
  createPipelineSchema,
  updatePipelineSchema,
  addStageSchema,
  updateStageSchema,
  reorderStagesSchema,
  pipelineQuerySchema,
  pipelineIdParamSchema,
  stageIdParamSchema,
} from '../schemas/pipeline.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/pipelines:
 *   get:
 *     tags: [Pipelines]
 *     summary: Get all pipelines
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive pipelines
 *     responses:
 *       200:
 *         description: Pipelines retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  validateQuery(pipelineQuerySchema),
  authorize(Permission.PIPELINE_READ),
  PipelineController.getPipelines
);

/**
 * @swagger
 * /api/v1/pipelines/{id}:
 *   get:
 *     tags: [Pipelines]
 *     summary: Get pipeline by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     responses:
 *       200:
 *         description: Pipeline retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pipeline not found
 */
router.get(
  '/:id',
  validateParams(pipelineIdParamSchema),
  authorize(Permission.PIPELINE_READ),
  PipelineController.getPipelineById
);

/**
 * @swagger
 * /api/v1/pipelines:
 *   post:
 *     tags: [Pipelines]
 *     summary: Create new pipeline
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
 *               - stages
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *               stages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     probability:
 *                       type: number
 *                     color:
 *                       type: string
 *     responses:
 *       201:
 *         description: Pipeline created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  validate(createPipelineSchema),
  authorize(Permission.PIPELINE_CREATE),
  PipelineController.createPipeline
);

/**
 * @swagger
 * /api/v1/pipelines/{id}:
 *   put:
 *     tags: [Pipelines]
 *     summary: Update pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               stages:
 *                 type: array
 *     responses:
 *       200:
 *         description: Pipeline updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pipeline not found
 */
router.put(
  '/:id',
  validateParams(pipelineIdParamSchema),
  validate(updatePipelineSchema),
  authorize(Permission.PIPELINE_UPDATE),
  PipelineController.updatePipeline
);

/**
 * @swagger
 * /api/v1/pipelines/{id}:
 *   delete:
 *     tags: [Pipelines]
 *     summary: Delete pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     responses:
 *       200:
 *         description: Pipeline deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pipeline not found
 *       409:
 *         description: Cannot delete pipeline with existing deals
 */
router.delete(
  '/:id',
  validateParams(pipelineIdParamSchema),
  authorize(Permission.PIPELINE_DELETE),
  PipelineController.deletePipeline
);

/**
 * @swagger
 * /api/v1/pipelines/{id}/stages:
 *   post:
 *     tags: [Pipelines]
 *     summary: Add stage to pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - probability
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               probability:
 *                 type: number
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stage added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pipeline not found
 */
router.post(
  '/:id/stages',
  validateParams(pipelineIdParamSchema),
  validate(addStageSchema),
  authorize(Permission.PIPELINE_UPDATE),
  PipelineController.addStage
);

/**
 * @swagger
 * /api/v1/pipelines/{id}/stages/{stageId}:
 *   put:
 *     tags: [Pipelines]
 *     summary: Update stage in pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               probability:
 *                 type: number
 *               color:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Stage updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pipeline or stage not found
 */
router.put(
  '/:id/stages/:stageId',
  validateParams(stageIdParamSchema),
  validate(updateStageSchema),
  authorize(Permission.PIPELINE_UPDATE),
  PipelineController.updateStage
);

/**
 * @swagger
 * /api/v1/pipelines/{id}/stages/{stageId}:
 *   delete:
 *     tags: [Pipelines]
 *     summary: Remove stage from pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Stage removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pipeline or stage not found
 *       409:
 *         description: Cannot remove stage with existing deals
 */
router.delete(
  '/:id/stages/:stageId',
  validateParams(stageIdParamSchema),
  authorize(Permission.PIPELINE_UPDATE),
  PipelineController.removeStage
);

/**
 * @swagger
 * /api/v1/pipelines/{id}/stages/reorder:
 *   put:
 *     tags: [Pipelines]
 *     summary: Reorder stages in pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stageOrders
 *             properties:
 *               stageOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stageId:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Stages reordered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pipeline not found
 */
router.put(
  '/:id/stages/reorder',
  validateParams(pipelineIdParamSchema),
  validate(reorderStagesSchema),
  authorize(Permission.PIPELINE_UPDATE),
  PipelineController.reorderStages
);

/**
 * @swagger
 * /api/v1/pipelines/{id}/analytics:
 *   get:
 *     tags: [Pipelines]
 *     summary: Get pipeline analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pipeline ID
 *     responses:
 *       200:
 *         description: Pipeline analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pipeline not found
 */
router.get(
  '/:id/analytics',
  validateParams(pipelineIdParamSchema),
  authorize(Permission.REPORT_READ),
  PipelineController.getPipelineAnalytics
);

export default router;
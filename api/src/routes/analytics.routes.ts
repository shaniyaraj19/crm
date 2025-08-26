import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize, authorizeOrganization } from '../middleware/auth';
import { Permission } from '../types/common';

const router = Router();

// Apply authentication and organization check to all routes
router.use(authenticate);
router.use(authorizeOrganization);

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /api/v1/analytics/kpis:
 *   get:
 *     summary: Get dashboard KPIs
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Number of days for date range
 *     responses:
 *       200:
 *         description: Dashboard KPIs
 */
router.get(
  '/kpis',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getDashboardKPIs
);

/**
 * @swagger
 * /api/v1/analytics/sales-performance:
 *   get:
 *     summary: Get sales performance data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "12"
 *         description: Number of months for period
 *     responses:
 *       200:
 *         description: Sales performance data
 */
router.get(
  '/sales-performance',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getSalesPerformance
);

/**
 * @swagger
 * /api/v1/analytics/pipeline-funnel:
 *   get:
 *     summary: Get pipeline funnel data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pipeline funnel data
 */
router.get(
  '/pipeline-funnel',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getPipelineFunnel
);

/**
 * @swagger
 * /api/v1/analytics/team-performance:
 *   get:
 *     summary: Get team performance data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Number of days for period
 *     responses:
 *       200:
 *         description: Team performance data
 */
router.get(
  '/team-performance',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getTeamPerformance
);

/**
 * @swagger
 * /api/v1/analytics/lead-sources:
 *   get:
 *     summary: Get lead source analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead source analysis
 */
router.get(
  '/lead-sources',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getLeadSourceAnalysis
);

/**
 * @swagger
 * /api/v1/analytics/activity-summary:
 *   get:
 *     summary: Get activity summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "7"
 *         description: Number of days for period
 *     responses:
 *       200:
 *         description: Activity summary
 */
router.get(
  '/activity-summary',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getActivitySummary
);

/**
 * @swagger
 * /api/v1/analytics/revenue-forecast:
 *   get:
 *     summary: Get revenue forecasting data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue forecast data
 */
router.get(
  '/revenue-forecast',
  authorize(Permission.REPORT_READ),
  AnalyticsController.getRevenueForecast
);

export default router;
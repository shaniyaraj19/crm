import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload a new file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               description:
 *                 type: string
 *                 description: File description
 *               isPublic:
 *                 type: boolean
 *                 description: Whether file is public
 *               companyId:
 *                 type: string
 *                 description: Company ID to associate with file
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/upload',
  authenticate,
  uploadSingle,
  FileController.uploadFile
);

/**
 * @swagger
 * /api/v1/files/upload-multiple:
 *   post:
 *     tags: [Files]
 *     summary: Upload multiple files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload
 *               description:
 *                 type: string
 *                 description: File description
 *               isPublic:
 *                 type: boolean
 *                 description: Whether files are public
 *               companyId:
 *                 type: string
 *                 description: Company ID to associate with files
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/upload-multiple',
  authenticate,
  uploadMultiple,
  FileController.uploadMultipleFiles
);

/**
 * @swagger
 * /api/v1/files/company/{companyId}:
 *   get:
 *     tags: [Files]
 *     summary: Get files by company ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/company/:companyId',
  authenticate,
  FileController.getCompanyFiles
);

/**
 * @swagger
 * /api/v1/files/{fileId}/download:
 *   get:
 *     tags: [Files]
 *     summary: Download a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:fileId/download',
  authenticate,
  FileController.downloadFile
);

/**
 * @swagger
 * /api/v1/files/{fileId}/preview:
 *   get:
 *     tags: [Files]
 *     summary: Preview a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File preview served successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:fileId/preview',
  authenticate,
  FileController.previewFile
);

/**
 * @swagger
 * /api/v1/files/{fileId}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:fileId',
  authenticate,
  FileController.deleteFile
);

export default router;

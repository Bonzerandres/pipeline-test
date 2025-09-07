import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest, validateId } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { ProfileController } from '../controllers/ProfileController';

const router = Router();
const profileController = new ProfileController();

/**
 * @swagger
 * /api/profiles/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, profileController.getMyProfile);

/**
 * @swagger
 * /api/profiles/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  '/me',
  authMiddleware,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('profileImage').optional().isURL(),
  ],
  validateRequest,
  profileController.updateMyProfile
);

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:id', validateId, profileController.getProfileById);

export default router;


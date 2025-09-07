import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { VerificationController } from '../controllers/VerificationController';

const router = Router();
const verificationController = new VerificationController();

/**
 * @swagger
 * /api/verification/verify-email:
 *   post:
 *     summary: Verify email with token
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Token is required'),
  ],
  validateRequest,
  verificationController.verifyEmail
);

/**
 * @swagger
 * /api/verification/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       404:
 *         description: User not found
 */
router.post(
  '/resend-verification',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  verificationController.resendVerification
);

export default router;


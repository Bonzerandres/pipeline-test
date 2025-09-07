import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { CustomError } from '../middleware/errorHandler';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';
import { setKey, deleteKey } from '../config/redis';

export class VerificationController {
  private userService: UserService;
  private emailService: EmailService;

  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      // Get user ID from Redis
      const userId = await this.userService.getVerificationToken(token);
      if (!userId) {
        throw new CustomError('Invalid or expired verification token', 400);
      }

      // Update user verification status
      await this.userService.updateUser(userId, {
        isVerified: true,
      });

      // Remove verification token
      await deleteKey(`verification:${token}`);

      // Get user details for welcome email
      const user = await this.userService.findById(userId);
      if (user) {
        // Send welcome email
        await this.emailService.sendWelcomeEmail(user.email, user.firstName);
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.isVerified) {
        throw new CustomError('Email is already verified', 400);
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await setKey(`verification:${verificationToken}`, user.id, 24 * 60 * 60); // 24 hours

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken);

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}


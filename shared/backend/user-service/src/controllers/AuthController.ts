import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';
import { setKey, deleteKey } from '../config/redis';
import { logger } from '../utils/logger';

export class AuthController {
  private userService: UserService;
  private emailService: EmailService;

  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new CustomError('User already exists with this email', 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await this.userService.createUser({
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        isVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await setKey(`verification:${verificationToken}`, user.id, 24 * 60 * 60); // 24 hours

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Store refresh token in Redis
      await setKey(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new CustomError('Account is deactivated', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Store refresh token in Redis
      await setKey(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;

      // Check if refresh token exists in Redis
      const storedToken = await this.userService.getRefreshToken(decoded.id);
      if (!storedToken || storedToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Get user
      const user = await this.userService.findById(decoded.id);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

      // Update refresh token in Redis
      await setKey(`refresh:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const userId = req.user?.id;

      if (token) {
        // Blacklist the access token
        await setKey(`blacklist:${token}`, 'true', 60 * 60); // 1 hour
      }

      if (userId) {
        // Remove refresh token
        await deleteKey(`refresh:${userId}`);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      // Store reset token hash in database
      await this.userService.updateUser(user.id, {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;

      // Find user with reset token
      const user = await this.userService.findByResetToken(token);
      if (!user) {
        throw new CustomError('Invalid or expired reset token', 400);
      }

      // Check if token is expired
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        throw new CustomError('Reset token has expired', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user password and clear reset token
      await this.userService.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  };

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

  private generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}


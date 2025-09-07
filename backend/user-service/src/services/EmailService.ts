import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: `"Laundry App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email - Laundry App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Welcome to Laundry App!</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for registering with Laundry App. To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with Laundry App, you can safely ignore this email.</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>&copy; 2024 Laundry App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: `"Laundry App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Password - Laundry App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
              <h1>Password Reset Request</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your Laundry App account. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p>This password reset link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>&copy; 2024 Laundry App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Laundry App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Laundry App!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Welcome to Laundry App!</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello ${firstName}!</h2>
              <p>Welcome to Laundry App! Your account has been successfully verified and you're now ready to start using our laundry delivery service.</p>
              <h3>What you can do now:</h3>
              <ul>
                <li>Request laundry pickup from your home</li>
                <li>Choose from our network of trusted laundromats and independent washers</li>
                <li>Track your order in real-time</li>
                <li>Get your clean clothes delivered back to you</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                   style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Get Started
                </a>
              </div>
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              <p>Thank you for choosing Laundry App!</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>&copy; 2024 Laundry App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendAccountDeactivatedEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Laundry App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Account Deactivated - Laundry App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
              <h1>Account Deactivated</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello ${firstName},</h2>
              <p>Your Laundry App account has been deactivated due to a violation of our terms of service.</p>
              <p>If you believe this was done in error, please contact our support team to appeal this decision.</p>
              <p>You can reach us at: support@laundryapp.com</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>&copy; 2024 Laundry App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Account deactivation email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending account deactivation email:', error);
      throw error;
    }
  }

  async sendAccountReactivatedEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Laundry App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Account Reactivated - Laundry App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Account Reactivated</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello ${firstName},</h2>
              <p>Great news! Your Laundry App account has been reactivated and you can now use our services again.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                   style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Access Your Account
                </a>
              </div>
              <p>Thank you for your patience and understanding.</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>&copy; 2024 Laundry App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Account reactivation email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending account reactivation email:', error);
      throw error;
    }
  }
}


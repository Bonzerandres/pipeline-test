import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/UserService';

export class ProfileController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const updateData = req.body;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const updatedUser = await this.userService.updateUser(userId, {
        ...updateData,
        updatedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Only return public profile information
      const publicProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      res.status(200).json({
        success: true,
        data: { user: publicProfile },
      });
    } catch (error) {
      next(error);
    }
  };
}


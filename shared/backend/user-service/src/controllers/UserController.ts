import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';
import { UserRole } from '../../../shared/types';

export class UserController {
  private userService: UserService;
  private emailService: EmailService;

  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, sortOrder } = req.pagination!;
      const { role, search } = req.query;

      let result;

      if (search) {
        result = await this.userService.searchUsers(
          search as string,
          page,
          limit
        );
      } else {
        result = await this.userService.getUsers(
          page,
          limit,
          role as UserRole
        );
      }

      res.status(200).json({
        success: true,
        data: {
          users: result.users,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

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

  public updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user is updating their own profile or is admin
      if (req.user?.id !== id && req.user?.role !== 'admin') {
        throw new CustomError('You can only update your own profile', 403);
      }

      const user = await this.userService.findById(id);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const updatedUser = await this.userService.updateUser(id, {
        ...updateData,
        updatedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userService.findById(id);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      await this.userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userService.findById(id);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.isActive) {
        throw new CustomError('User is already active', 400);
      }

      const updatedUser = await this.userService.updateUser(id, {
        isActive: true,
        updatedAt: new Date(),
      });

      // Send reactivation email
      await this.emailService.sendAccountReactivatedEmail(
        user.email,
        user.firstName
      );

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  };

  public deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userService.findById(id);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (!user.isActive) {
        throw new CustomError('User is already deactivated', 400);
      }

      const updatedUser = await this.userService.updateUser(id, {
        isActive: false,
        updatedAt: new Date(),
      });

      // Send deactivation email
      await this.emailService.sendAccountDeactivatedEmail(
        user.email,
        user.firstName
      );

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  };

  public searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q } = req.query;
      const { page, limit } = req.pagination!;

      const result = await this.userService.searchUsers(
        q as string,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: {
          users: result.users,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}


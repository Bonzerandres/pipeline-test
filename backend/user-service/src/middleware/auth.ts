import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';
import { getKey } from '../config/redis';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new CustomError('Access denied. No token provided.', 401);
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await getKey(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new CustomError('Token has been revoked.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired.', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new CustomError('Access denied. User not authenticated.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new CustomError('Access denied. Insufficient permissions.', 403));
      return;
    }

    next();
  };
};

export const requireCustomer = requireRole(['customer']);
export const requireDriver = requireRole(['driver']);
export const requireProvider = requireRole(['laundromat', 'independent_washer', 'dry_cleaner']);
export const requireAdmin = requireRole(['admin']);

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      next();
      return;
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await getKey(`blacklist:${token}`);
    if (isBlacklisted) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};


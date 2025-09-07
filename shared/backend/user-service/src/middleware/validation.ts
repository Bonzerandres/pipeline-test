import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CustomError } from './errorHandler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    const error = new CustomError(errorMessages.join(', '), 400);
    next(error);
    return;
  }
  
  next();
};

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as string || 'desc';

  // Validate pagination parameters
  if (page < 1) {
    next(new CustomError('Page must be greater than 0', 400));
    return;
  }

  if (limit < 1 || limit > 100) {
    next(new CustomError('Limit must be between 1 and 100', 400));
    return;
  }

  if (!['asc', 'desc'].includes(sortOrder)) {
    next(new CustomError('Sort order must be either "asc" or "desc"', 400));
    return;
  }

  // Add validated pagination to request
  req.pagination = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  next();
};

export const validateId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    next(new CustomError('Invalid ID format', 400));
    return;
  }
  
  next();
};

export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    next(new CustomError('Invalid email format', 400));
    return;
  }
  
  next();
};

export const validatePhone = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { phone } = req.body;
  
  if (!phone || !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
    next(new CustomError('Invalid phone number format', 400));
    return;
  }
  
  next();
};

export const validateCoordinates = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { latitude, longitude } = req.body;
  
  if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    next(new CustomError('Invalid latitude value', 400));
    return;
  }
  
  if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    next(new CustomError('Invalid longitude value', 400));
    return;
  }
  
  next();
};

// Extend Request interface to include pagination
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: string;
      };
    }
  }
}


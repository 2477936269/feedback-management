import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// 404错误处理中间件
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`路径 ${req.originalUrl} 不存在`, 404);
  next(error);
}; 
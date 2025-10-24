import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = '服务器内部错误';
  let isOperational = true;

  // 处理自定义错误
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // 处理Prisma错误
  else if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = '数据已存在，请检查输入';
        break;
      case 'P2025':
        statusCode = 404;
        message = '记录不存在';
        break;
      case 'P2003':
        statusCode = 400;
        message = '外键约束失败';
        break;
      default:
        statusCode = 400;
        message = '数据库操作失败';
    }
  }
  // 处理JWT错误
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的令牌';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期';
  }
  // 处理验证错误
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  }
  // 处理文件上传错误
  else if (error.name === 'MulterError') {
    statusCode = 400;
    message = '文件上传失败';
  }
  // 处理其他已知错误
  else if (error.message) {
    message = error.message;
  }

  // 记录错误日志
  if (isOperational) {
    logger.warn(`操作错误: ${message}`, {
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } else {
    logger.error(`系统错误: ${error.message}`, {
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      stack: error.stack,
    });
  }

  // 开发环境返回详细错误信息
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  
  const errorResponse = {
    success: false,
    message,
    ...(isDevelopment && { stack: error.stack }),
    ...(isDevelopment && { details: error.message }),
  };

  res.status(statusCode).json(errorResponse);
};

// 异步错误包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 常用错误
export const Errors = {
  BadRequest: (message: string = '请求参数错误') => new AppError(message, 400),
  Unauthorized: (message: string = '未授权访问') => new AppError(message, 401),
  Forbidden: (message: string = '禁止访问') => new AppError(message, 403),
  NotFound: (message: string = '资源不存在') => new AppError(message, 404),
  Conflict: (message: string = '数据冲突') => new AppError(message, 409),
  TooManyRequests: (message: string = '请求过于频繁') => new AppError(message, 429),
  InternalServerError: (message: string = '服务器内部错误') => new AppError(message, 500),
  ServiceUnavailable: (message: string = '服务不可用') => new AppError(message, 503),
}; 
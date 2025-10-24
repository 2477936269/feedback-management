import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any;
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: '访问令牌无效'
    });
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any;
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email
      };
    } catch (error) {
      // 令牌无效，但不阻止请求继续
    }
  }

  next();
}; 
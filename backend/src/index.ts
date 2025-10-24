import 'express-async-errors'; // 处理异步错误
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';

// 导入配置
import { config } from './config/config';
import { logger } from './utils/logger';

// 导入中间件
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { optionalAuth } from './middleware/authMiddleware';

// 导入路由
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import categoryRoutes from './routes/categoryRoutes';
import externalFeedbackRoutes from './routes/externalFeedbackRoutes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试',
});
app.use('/api/', limiter);

// 压缩响应
app.use(compression());

// 日志中间件
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 基础API路由
app.get('/api', (_req, res) => {
  res.json({
    message: 'MSFeedback API 服务运行正常',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      feedback: '/api/feedback',
      categories: '/api/categories',
      externalFeedback: '/api/external/feedback'
    }
  });
});

// 健康检查
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API路由
app.use('/api/users', userRoutes);
app.use('/api/feedback', optionalAuth, feedbackRoutes); // 反馈API使用可选认证
app.use('/api/categories', categoryRoutes);
app.use('/api/external/feedback', externalFeedbackRoutes); // 外部反馈API

// 404处理
app.use(notFoundHandler);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.port || 50008;

app.listen(PORT, () => {
  logger.info(`🚀 服务器启动成功，端口: ${PORT}`);
  logger.info(`📊 环境: ${config.env}`);
  logger.info(`🔗 API地址: http://localhost:${PORT}/api`);
  logger.info(`🏥 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);
}); 
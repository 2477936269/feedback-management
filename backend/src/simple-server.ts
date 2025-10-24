import express from 'express';
import cors from 'cors';

// 创建Express应用
const app = express();

// CORS配置
app.use(cors({
  origin: ['http://localhost:30008', 'http://localhost:50008'],
  credentials: true,
}));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 基础API路由
app.get('/api', (req, res) => {
  res.json({
    message: 'MSFeedback API 服务运行正常',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `路径 ${req.originalUrl} 不存在`,
  });
});

// 启动服务器
const PORT = process.env.PORT || 50008;

app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功，端口: ${PORT}`);
  console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
}); 
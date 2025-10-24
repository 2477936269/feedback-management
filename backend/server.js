const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const categoryService = require('./src/services/categoryService');

// 创建Express应用
const app = express();

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',    // React开发服务器默认端口
    'http://localhost:30008',   // 自定义前端端口
    'http://localhost:50008',   // 后端端口
    'http://127.0.0.1:3000',    // 本地IP地址
    'http://127.0.0.1:30008',
    'http://127.0.0.1:50008'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 预检请求处理
app.options('*', (req, res) => {
  console.log('🔄 处理预检请求:', req.method, req.url);
  res.status(200).end();
});

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('   Origin:', req.headers.origin);
  console.log('   User-Agent:', req.headers['user-agent']);
  next();
});

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 模拟用户数据
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$6th7DRFEETABRsKq8V4Alu7I9kx27sz5NoYctSkuT5ienT4g4rHf.', // admin123
    role: 'ADMIN'
  }
];

// 基础API路由
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'MSFeedback API 服务运行正常',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }
  });
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
    
    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 分类管理API
// 获取分类列表
app.get('/api/categories', async (req, res) => {
  try {
    const result = await categoryService.getCategories(req.query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

// 创建分类
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, color, isActive, sortOrder, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    const newCategory = await categoryService.createCategory({
      name,
      description,
      color,
      isActive,
      sortOrder,
      parentId
    });

    res.status(201).json({
      success: true,
      data: newCategory,
      message: '分类创建成功'
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建分类失败'
    });
  }
});

// 获取分类树
app.get('/api/categories/tree', async (req, res) => {
  try {
    const categoryTree = await categoryService.getCategoryTree();
    
    res.json({
      success: true,
      data: categoryTree
    });
  } catch (error) {
    console.error('获取分类树错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类树失败'
    });
  }
});

// 获取单个分类
app.get('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await categoryService.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
});

// 更新分类
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, isActive, sortOrder, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    const updatedCategory = await categoryService.updateCategory(id, {
      name,
      description,
      color,
      isActive,
      sortOrder,
      parentId
    });

    res.json({
      success: true,
      data: updatedCategory,
      message: '分类更新成功'
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新分类失败'
    });
  }
});

// 删除分类
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await categoryService.deleteCategory(id);
    
    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '删除分类失败'
    });
  }
});



// 仪表盘统计接口
app.get('/api/statistics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalFeedback: 0,
      pendingFeedback: 0,
      processingFeedback: 0,
      resolvedFeedback: 0,
      todayNewFeedback: 0,
      totalUsers: 1,
      categoryStats: [],
      recentFeedback: []
    }
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

app.listen(PORT, async () => {
  console.log(`🚀 服务器启动成功，端口: ${PORT}`);
  console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  
  // 初始化默认分类数据
  try {
    await categoryService.initializeDefaultCategories();
  } catch (error) {
    console.error('初始化默认分类失败:', error);
  }
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
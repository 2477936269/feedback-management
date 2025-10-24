import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// 外部系统API密钥验证中间件
const validateApiKey = async (req: any, res: any, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: '缺少API密钥',
        code: 'MISSING_API_KEY'
      });
    }

    // 查找API密钥
    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        key: crypto.createHash('sha256').update(apiKey).digest('hex'),
        status: true
      },
      include: {
        externalSystem: true
      }
    });

    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        message: '无效的API密钥',
        code: 'INVALID_API_KEY'
      });
    }

    if (!keyRecord.externalSystem.status) {
      return res.status(403).json({
        success: false,
        message: '外部系统已被禁用',
        code: 'SYSTEM_DISABLED'
      });
    }

    // 检查权限
    if (!keyRecord.externalSystem.permissions.includes('feedback:submit')) {
      return res.status(403).json({
        success: false,
        message: '没有提交反馈的权限',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // 将外部系统信息添加到请求对象
    req.externalSystem = keyRecord.externalSystem;
    req.apiKeyId = keyRecord.id;

    next();
  } catch (error) {
    console.error('API密钥验证错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
};

// 外部反馈创建验证模式
const createExternalFeedbackSchema = z.object({
  // 基本信息
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000),
  type: z.string().min(1).max(50).optional().default('外部反馈'),
  
  // 媒体类型（支持多个，用逗号分隔）
  mediaType: z.string().optional().default('TEXT'),
  
  // 优先级
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  
  // 联系方式
  contact: z.string().min(1).max(100).optional(),
  
  // 附件信息
  attachments: z.array(z.object({
    fileName: z.string().min(1).max(255),
    fileSize: z.number().int().positive(),
    fileType: z.string().min(1).max(100),
    fileUrl: z.string().url().optional(),
    fileContent: z.string().optional() // base64编码的文件内容
  })).optional().default([]),
  
  // 外部系统相关信息
  externalId: z.string().optional(), // 外部系统的反馈ID
  externalData: z.record(z.any()).optional(), // 外部系统的额外数据
  
  // 时间信息
  createdAt: z.string().datetime().optional(), // ISO格式时间字符串
});

// 生成反馈编号
const generateFeedbackNo = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  while (true) {
    result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 检查是否已存在
    const existing = await prisma.feedback.findUnique({
      where: { feedbackNo: result }
    });
    
    if (!existing) {
      break;
    }
  }
  
  return result;
};

// 根据文件类型检测媒体类型
const detectMediaType = (fileName: string, fileType: string): string => {
  const fileName_lower = fileName.toLowerCase();
  const fileType_lower = fileType.toLowerCase();
  
  // 图片类型检测
  if (fileType_lower.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName_lower)) {
    return 'IMAGE';
  }
  
  // 视频类型检测
  if (fileType_lower.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(fileName_lower)) {
    return 'VIDEO';
  }
  
  // 音频类型检测
  if (fileType_lower.startsWith('audio/') || /\.(mp3|wav|aac|m4a|ogg|flac)$/i.test(fileName_lower)) {
    return 'VOICE';
  }
  
  // 链接类型检测
  if (/^https?:\/\//.test(fileName) || fileType_lower === 'text/uri-list') {
    return 'LINK';
  }
  
  // 默认为文本类型
  return 'TEXT';
};

// 创建外部反馈
router.post('/submit', validateApiKey, async (req, res) => {
  try {
    const feedbackData = createExternalFeedbackSchema.parse(req.body);
    const externalSystem = req.externalSystem;
    
    // 生成反馈编号
    const feedbackNo = await generateFeedbackNo();
    
    // 检测媒体类型
    let detectedMediaTypes: string[] = ['TEXT'];
    if (feedbackData.attachments && feedbackData.attachments.length > 0) {
      const types = feedbackData.attachments.map(attachment => 
        detectMediaType(attachment.fileName, attachment.fileType)
      );
      detectedMediaTypes = [...new Set(types)]; // 去重
    }
    
    // 创建反馈记录
    const feedback = await prisma.feedback.create({
      data: {
        feedbackNo,
        type: feedbackData.type || '外部反馈',
        content: feedbackData.content,
        status: 'PENDING',
        externalSystemId: externalSystem.id,
        createdAt: feedbackData.createdAt ? new Date(feedbackData.createdAt) : undefined,
      }
    });

    // 创建媒体文件记录
    if (feedbackData.attachments && feedbackData.attachments.length > 0) {
      const mediaFiles = feedbackData.attachments.map(attachment => ({
        feedbackId: feedback.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl || '', // 如果没有URL，存储为空字符串
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
      }));

      await prisma.mediaFile.createMany({
        data: mediaFiles
      });
    }

    // 记录API调用日志
    await prisma.apiCallLog.create({
      data: {
        externalSystemId: externalSystem.id,
        apiPath: '/api/external/feedback/submit',
        method: 'POST',
        statusCode: 201,
        requestId: crypto.randomUUID(),
        responseTime: Date.now() - req.startTime
      }
    });

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '反馈提交成功',
      data: {
        id: feedback.id,
        feedbackNo: feedback.feedbackNo,
        status: feedback.status,
        mediaTypes: detectedMediaTypes.join(','),
        createdAt: feedback.createdAt,
        externalId: feedbackData.externalId
      }
    });

  } catch (error) {
    // 记录错误日志
    if (req.externalSystem) {
      await prisma.apiCallLog.create({
        data: {
          externalSystemId: req.externalSystem.id,
          apiPath: '/api/external/feedback/submit',
          method: 'POST',
          statusCode: 400,
          requestId: crypto.randomUUID(),
          responseTime: Date.now() - req.startTime
        }
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        code: 'VALIDATION_ERROR',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    console.error('创建外部反馈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 查询反馈状态
router.get('/status/:feedbackNo', validateApiKey, async (req, res) => {
  try {
    const { feedbackNo } = req.params;
    
    const feedback = await prisma.feedback.findUnique({
      where: { feedbackNo },
      include: {
        mediaFiles: true,
        operationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在',
        code: 'FEEDBACK_NOT_FOUND'
      });
    }

    // 检查权限
    if (!req.externalSystem.permissions.includes('feedback:query')) {
      return res.status(403).json({
        success: false,
        message: '没有查询反馈的权限',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // 记录API调用日志
    await prisma.apiCallLog.create({
      data: {
        externalSystemId: req.externalSystem.id,
        apiPath: `/api/external/feedback/status/${feedbackNo}`,
        method: 'GET',
        statusCode: 200,
        requestId: crypto.randomUUID(),
        responseTime: Date.now() - req.startTime
      }
    });

    res.json({
      success: true,
      data: {
        id: feedback.id,
        feedbackNo: feedback.feedbackNo,
        status: feedback.status,
        reply: feedback.reply,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        attachments: feedback.mediaFiles.map(file => ({
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          fileUrl: file.fileUrl
        })),
        operationLogs: feedback.operationLogs.map(log => ({
          action: log.action,
          content: log.content,
          operator: log.operator,
          createdAt: log.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('查询反馈状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 批量查询反馈状态
router.post('/batch-status', validateApiKey, async (req, res) => {
  try {
    const { feedbackNos } = req.body;
    
    if (!Array.isArray(feedbackNos) || feedbackNos.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的反馈编号数组',
        code: 'INVALID_INPUT'
      });
    }

    if (feedbackNos.length > 100) {
      return res.status(400).json({
        success: false,
        message: '批量查询最多支持100个反馈编号',
        code: 'BATCH_SIZE_EXCEEDED'
      });
    }

    // 检查权限
    if (!req.externalSystem.permissions.includes('feedback:query')) {
      return res.status(403).json({
        success: false,
        message: '没有查询反馈的权限',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: {
        feedbackNo: {
          in: feedbackNos
        }
      },
      include: {
        mediaFiles: true
      }
    });

    // 记录API调用日志
    await prisma.apiCallLog.create({
      data: {
        externalSystemId: req.externalSystem.id,
        apiPath: '/api/external/feedback/batch-status',
        method: 'POST',
        statusCode: 200,
        requestId: crypto.randomUUID(),
        responseTime: Date.now() - req.startTime
      }
    });

    res.json({
      success: true,
      data: feedbacks.map(feedback => ({
        id: feedback.id,
        feedbackNo: feedback.feedbackNo,
        status: feedback.status,
        reply: feedback.reply,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        attachments: feedback.mediaFiles.map(file => ({
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          fileUrl: file.fileUrl
        }))
      }))
    });

  } catch (error) {
    console.error('批量查询反馈状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 添加请求时间记录中间件
router.use((req: any, res, next) => {
  req.startTime = Date.now();
  next();
});

export default router;

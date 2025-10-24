import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// 反馈创建验证模式
const createFeedbackSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'VOICE', 'LINK']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  categoryId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

// 反馈更新验证模式
const updateFeedbackSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'VOICE', 'LINK']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'RESOLVED', 'CLOSED']).optional(),
  categoryId: z.string().optional(),
});

// 创建反馈
router.post('/', async (req, res) => {
  try {
    const feedbackData = createFeedbackSchema.parse(req.body);
    const userId = (req as any).user?.userId; // 从JWT中获取用户ID

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        ...feedbackData,
        userId,
        status: 'PENDING'
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        attachments: true
      }
    });

    res.status(201).json({
      success: true,
      message: '反馈创建成功',
      data: feedback
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors
      });
    }
    
    console.error('创建反馈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取反馈列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      status,
      priority,
      type,
      categoryId,
      createdFrom,
      createdTo
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword as string, mode: 'insensitive' } },
        { content: { contains: keyword as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom as string);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo as string);
      }
    }

    // 查询反馈
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          attachments: true,
          processing: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        items: feedbacks,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取反馈列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个反馈
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        attachments: true,
        processing: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('获取反馈详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新反馈
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateFeedbackSchema.parse(req.body);

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        attachments: true
      }
    });

    res.json({
      success: true,
      message: '反馈更新成功',
      data: feedback
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors
      });
    }
    
    console.error('更新反馈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除反馈
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.feedback.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '反馈删除成功'
    });
  } catch (error) {
    console.error('删除反馈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 添加处理记录
router.post('/:id/processing', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const processing = await prisma.processing.create({
      data: {
        feedbackId: id,
        userId,
        action,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: '处理记录添加成功',
      data: processing
    });
  } catch (error) {
    console.error('添加处理记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router; 
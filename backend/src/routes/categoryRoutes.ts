import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// 分类创建验证模式
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  parentId: z.string().optional(),
});

// 分类更新验证模式
const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  parentId: z.string().optional(),
});

// 创建分类
router.post('/', async (req, res) => {
  try {
    const categoryData = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        isActive: categoryData.isActive,
        sortOrder: categoryData.sortOrder,
        parentId: categoryData.parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: category
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors
      });
    }
    
    console.error('创建分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取分类列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      isActive,
      parentId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};

    if (name) {
      where.name = { contains: name as string, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (parentId !== undefined) {
      if (parentId === 'null') {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    // 查询分类
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              children: true,
              feedbacks: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.category.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        items: categories,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取分类树形结构
router.get('/tree', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // 只返回顶级分类
    const rootCategories = categories.filter(cat => !cat.parentId);

    res.json({
      success: true,
      data: rootCategories
    });
  } catch (error) {
    console.error('获取分类树错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个分类
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            children: true,
            feedbacks: true
          }
        }
      }
    });

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
    console.error('获取分类详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateCategorySchema.parse(req.body);

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        color: updateData.color,
        isActive: updateData.isActive,
        sortOrder: updateData.sortOrder,
        parentId: updateData.parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: '分类更新成功',
      data: category
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors
      });
    }
    
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有子分类
    const childrenCount = await prisma.category.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下有子分类，无法删除'
      });
    }

    // 检查是否有关联的反馈
    const feedbackCount = await prisma.feedback.count({
      where: { categoryId: id }
    });

    if (feedbackCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下有反馈数据，无法删除'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router; 
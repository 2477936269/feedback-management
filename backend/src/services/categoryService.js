const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CategoryService {
  // 获取分类列表
  async getCategories(params = {}) {
    const { page = 1, limit = 10, name, isActive } = params;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    try {
      // 获取总数
      const total = await prisma.category.count({ where });

      // 获取分页数据
      const items = await prisma.category.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              children: true,
              feedbacks: true
            }
          },
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return {
        items,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total
        }
      };
    } catch (error) {
      console.error('获取分类列表错误:', error);
      throw error;
    }
  }

  // 获取单个分类
  async getCategoryById(id) {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              children: true,
              feedbacks: true
            }
          },
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              description: true,
              color: true,
              isActive: true,
              sortOrder: true
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      return category;
    } catch (error) {
      console.error('获取分类错误:', error);
      throw error;
    }
  }

  // 创建分类
  async createCategory(data) {
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          description: data.description || '',
          color: data.color || '#1890ff',
          isActive: data.isActive !== false,
          sortOrder: data.sortOrder || 0,
          parentId: data.parentId || null
        },
        include: {
          _count: {
            select: {
              children: true,
              feedbacks: true
            }
          },
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return category;
    } catch (error) {
      console.error('创建分类错误:', error);
      throw error;
    }
  }

  // 更新分类
  async updateCategory(id, data) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          color: data.color,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          parentId: data.parentId
        },
        include: {
          _count: {
            select: {
              children: true,
              feedbacks: true
            }
          },
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return category;
    } catch (error) {
      console.error('更新分类错误:', error);
      throw error;
    }
  }

  // 删除分类
  async deleteCategory(id) {
    try {
      // 首先检查分类是否存在
      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        // 如果分类不存在，直接返回成功，避免重复删除的错误
        console.log(`分类 ${id} 不存在，可能已经被删除`);
        return true;
      }

      // 检查是否有子分类
      const childrenCount = await prisma.category.count({
        where: { parentId: id }
      });

      if (childrenCount > 0) {
        throw new Error('无法删除有子分类的分类，请先删除子分类');
      }

      // 检查是否有关联的反馈
      const feedbackCount = await prisma.feedback.count({
        where: { categoryId: id }
      });

      if (feedbackCount > 0) {
        throw new Error('无法删除有关联反馈的分类，请先处理相关反馈');
      }

      await prisma.category.delete({
        where: { id }
      });

      console.log(`分类 ${id} 删除成功`);
      return true;
    } catch (error) {
      console.error('删除分类错误:', error);
      throw error;
    }
  }

  // 获取分类树
  async getCategoryTree() {
    try {
      const categories = await prisma.category.findMany({
        where: { parentId: null }, // 只获取顶级分类
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      return categories;
    } catch (error) {
      console.error('获取分类树错误:', error);
      throw error;
    }
  }

  // 初始化默认分类数据
  async initializeDefaultCategories() {
    try {
      const existingCategories = await prisma.category.count();
      
      if (existingCategories === 0) {
        const defaultCategories = [
          {
            name: '功能建议',
            description: '用户对产品功能的建议和想法',
            color: '#1890ff',
            sortOrder: 1
          },
          {
            name: '问题反馈',
            description: '用户遇到的技术问题和错误',
            color: '#ff4d4f',
            sortOrder: 2
          },
          {
            name: '界面优化',
            description: '用户界面和用户体验的建议',
            color: '#52c41a',
            sortOrder: 3
          }
        ];

        for (const category of defaultCategories) {
          await prisma.category.create({
            data: category
          });
        }

        console.log('✅ 默认分类数据初始化完成');
      }
    } catch (error) {
      console.error('初始化默认分类错误:', error);
    }
  }
}

module.exports = new CategoryService(); 
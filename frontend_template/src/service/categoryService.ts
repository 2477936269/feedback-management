import apiService from './apiService';

// 分类数据接口
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: Category[];
  _count?: {
    children: number;
    feedbacks: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 分类列表响应接口
export interface CategoryListResponse {
  success: boolean;
  data: {
    items: Category[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      pages: number;
    };
  };
}

// 分类树响应接口
export interface CategoryTreeResponse {
  success: boolean;
  data: Category[];
}

// 单个分类响应接口
export interface CategoryResponse {
  success: boolean;
  data: Category;
}

// 分类服务类
class CategoryService {
  private baseUrl = '/api/categories';

  // 获取分类列表
  async getCategories(params: {
    page?: number;
    limit?: number;
    name?: string;
    isActive?: boolean;
    parentId?: string;
  } = {}): Promise<CategoryListResponse> {
    try {
      const response = await apiService.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }

  // 获取分类树
  async getCategoryTree(): Promise<CategoryTreeResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/tree`);
      return response.data;
    } catch (error) {
      console.error('获取分类树失败:', error);
      throw error;
    }
  }

  // 获取单个分类
  async getCategoryById(id: string): Promise<CategoryResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取分类详情失败:', error);
      throw error;
    }
  }

  // 创建分类
  async createCategory(data: {
    name: string;
    description?: string;
    color?: string;
    isActive?: boolean;
    sortOrder?: number;
    parentId?: string;
  }): Promise<CategoryResponse> {
    try {
      const response = await apiService.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  // 更新分类
  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
    sortOrder?: number;
    parentId?: string;
  }): Promise<CategoryResponse> {
    try {
      const response = await apiService.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  }

  // 删除分类
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }

  // 获取活跃的分类列表（用于下拉选择）
  async getActiveCategories(): Promise<Category[]> {
    try {
      const response = await this.getCategories({ isActive: true, limit: 100 });
      return response.data.items;
    } catch (error) {
      console.error('获取活跃分类失败:', error);
      // 返回默认分类作为后备
      return [
        { id: '1', name: '功能异常', description: '功能异常相关反馈', color: '#ff4d4f', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
        { id: '2', name: '体验建议', description: '用户体验建议', color: '#1890ff', isActive: true, sortOrder: 2, createdAt: '', updatedAt: '' },
        { id: '3', name: '新功能需求', description: '新功能需求', color: '#52c41a', isActive: true, sortOrder: 3, createdAt: '', updatedAt: '' },
        { id: '4', name: '其他', description: '其他类型反馈', color: '#fa8c16', isActive: true, sortOrder: 4, createdAt: '', updatedAt: '' },
      ];
    }
  }

  // 将分类列表转换为选项格式
  categoriesToOptions(categories: Category[]): Array<{ label: string; value: string; color?: string }> {
    return categories.map(category => ({
      label: category.name,
      value: category.name,
      color: category.color
    }));
  }
}

export const categoryService = new CategoryService();

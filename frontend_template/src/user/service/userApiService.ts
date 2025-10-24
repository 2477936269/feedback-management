import ApiService from "../../service/apiService";

export interface UserData {
  id: string;
  username: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  phone: string;
  password: string;
  status: "active" | "inactive";
}

export interface UpdateUserRequest {
  username?: string;
  phone?: string;
  password?: string;
  status?: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 用户管理API服务
 */
export class UserApiService {
  private static readonly BASE_URL = "/users";

  /**
   * 获取用户列表
   */
  static async getUsers(params?: any): Promise<ApiResponse<UserData[]>> {
    try {
      console.log('API服务获取用户列表，参数:', params);
      
      // 构建查询字符串
      let url = this.BASE_URL;
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        url += `?${queryParams.toString()}`;
      }
      
      console.log('API服务请求URL:', url);
      const response = await ApiService.get(url);
      return response as ApiResponse<UserData[]>;
    } catch (error) {
      console.error("获取用户列表失败:", error);
      return {
        success: false,
        error: "获取用户列表失败",
      };
    }
  }

  /**
   * 创建用户
   */
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse<UserData>> {
    try {
      const response = await ApiService.post(this.BASE_URL, userData);
      return response as ApiResponse<UserData>;
    } catch (error) {
      console.error("创建用户失败:", error);
      return {
        success: false,
        error: "创建用户失败",
      };
    }
  }

  /**
   * 更新用户
   */
  static async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<UserData>> {
    try {
      const response = await ApiService.put(`${this.BASE_URL}/${userId}`, userData);
      return response as ApiResponse<UserData>;
    } catch (error) {
      console.error("更新用户失败:", error);
      return {
        success: false,
        error: "更新用户失败",
      };
    }
  }

  /**
   * 删除用户
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      console.log('API服务删除用户:', userId);
      const response = await ApiService.delete(`${this.BASE_URL}/${userId}`);
      console.log('API服务删除用户响应:', response);
      return response as ApiResponse<void>;
    } catch (error) {
      console.error("删除用户失败:", error);
      return {
        success: false,
        error: "删除用户失败",
      };
    }
  }

  /**
   * 获取用户详情
   */
  static async getUserById(userId: string): Promise<ApiResponse<UserData>> {
    try {
      const response = await ApiService.get(`${this.BASE_URL}/${userId}`);
      return response as ApiResponse<UserData>;
    } catch (error) {
      console.error("获取用户详情失败:", error);
      return {
        success: false,
        error: "获取用户详情失败",
      };
    }
  }
}

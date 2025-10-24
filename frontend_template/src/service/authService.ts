import { MockService } from './mockService';

// 定义返回类型接口
export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  token?: string;
}

// 定义登录数据接口
export interface LoginData {
  username?: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 用户登录 - 使用Mock数据
 * @param loginData 登录数据
 * @returns 认证结果
 */
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  console.log('===== Mock登录API开始调用 =====');
  console.log('登录请求数据:', JSON.stringify(loginData, null, 2));

  try {
    // 使用Mock服务登录
    const response = await MockService.login({
      username: loginData.username,
      email: loginData.email,
      phone: loginData.phoneNumber,
      password: loginData.password
    });

    if (!response.success) {
      console.error('Mock登录失败:', response.message);
      return {
        success: false,
        message: response.message
      };
    }

    // 存储token
    const token = response.data.token;
    if (token) {
      console.log('获取到Mock token:', token.substring(0, 10) + '...');
      localStorage.setItem('token', token);
      console.log('localStorage token设置完成');

      sessionStorage.setItem('token', token); // 备份存储
      console.log('sessionStorage token设置完成');

      return {
        success: true,
        data: response.data,
        token: token
      };
    } else {
      console.error('Mock登录响应中没有token字段');
      return {
        success: false,
        message: '登录响应格式错误：未获取到token'
      };
    }
  } catch (error: any) {
    console.error('Mock登录请求出错:', error);

    return {
      success: false,
      message: error.message || '登录失败'
    };
  }
};

/**
 * 注销登录
 * @returns 注销结果
 */
export const logout = async (): Promise<AuthResponse> => {
  try {
    console.log('===== Mock注销API开始调用 =====');

    // 调用Mock服务注销
    const response = await MockService.logout();

    // 清除存储的token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    console.log('Token清除完成');

    return {
      success: true,
      message: response.message
    };
  } catch (error: any) {
    console.error('Mock注销失败:', error);
    return {
      success: false,
      message: error.message || '注销失败'
    };
  }
};

/**
 * 检查用户是否已认证
 * @returns 用户是否已认证
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

/**
 * 刷新用户token - Mock实现
 * @returns 刷新结果
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    console.log('===== Mock刷新Token API开始调用 =====');

    // 获取当前token
    const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!currentToken) {
      return { success: false, message: '没有可用的token' };
    }

    // Mock刷新token
    const newToken = 'mock-refreshed-token-' + Date.now();

    // 存储新token
    localStorage.setItem('token', newToken);
    sessionStorage.setItem('token', newToken);

    console.log('Mock Token刷新完成:', newToken.substring(0, 10) + '...');

    return {
      success: true,
      data: { token: newToken },
      token: newToken
    };
  } catch (error: any) {
    console.error('Mock刷新token失败:', error);
    return {
      success: false,
      message: error.message || '刷新token失败'
    };
  }
};

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    console.log('===== Mock获取用户信息API开始调用 =====');

    const response = await MockService.getCurrentUser();

    if (!response.success) {
      return {
        success: false,
        message: response.message
      };
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Mock获取用户信息失败:', error);
    return {
      success: false,
      message: error.message || '获取用户信息失败'
    };
  }
};
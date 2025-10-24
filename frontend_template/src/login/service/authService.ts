import ApiService, { ApiResponse } from '../../service/apiService';
import axios from 'axios';

// 登录响应数据类型
interface LoginResponseData {
  token: string;
  user?: any;
}

// 定义返回类型接口
export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  token?: string;
}

// 定义登录数据接口
export interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 用户登录
 * @param loginData 登录数据
 * @returns 认证结果
 */
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  console.log('===== 登录API开始调用 =====');
  console.log('登录请求数据:', JSON.stringify(loginData, null, 2));

  try {
    // 调用真实登录接口
    const response = await ApiService.post<LoginResponseData>('/auth/login', {
      username: loginData.username,
      password: loginData.password
    });

    console.log('登录API响应:', response);

    if (!response.success) {
      console.error('登录失败:', response.message);
      return {
        success: false,
        message: response.message
      };
    }

    // 存储token
    const token = response.data?.token;
    if (token) {
      console.log('获取到token:', token.substring(0, 10) + '...');

      if (loginData.rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('localStorage token和用户信息设置完成');
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('sessionStorage token和用户信息设置完成');
      }

      return {
        success: true,
        data: response.data,
        token: token
      };
    } else {
      console.error('登录响应中没有token字段');
      return {
        success: false,
        message: '登录响应格式错误：未获取到token'
      };
    }
  } catch (error: any) {
    console.error('登录请求出错:', error);

    // 如果后端服务不可用，使用模拟登录
    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      console.log('后端服务不可用，使用模拟登录');
      return mockLogin(loginData);
    }

    return {
      success: false,
      message: error.message || '登录失败'
    };
  }
};

/**
 * 模拟登录（当后端服务不可用时使用）
 */
const mockLogin = (loginData: LoginData): AuthResponse => {
  // 简单的用户名密码验证
  if (loginData.username === 'admin' && loginData.password === 'admin123') {
    const mockToken = 'mock_token_' + Date.now();
    const mockUser = { id: 1, username: 'admin', phone: '13800138000', status: 'active' };

    if (loginData.rememberMe) {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('模拟登录：localStorage token和用户信息设置完成');
    } else {
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      console.log('模拟登录：sessionStorage token和用户信息设置完成');
    }

    return {
      success: true,
      data: { token: mockToken, user: mockUser },
      token: mockToken
    };
  }

  return {
    success: false,
    message: '用户名或密码错误'
  };
};

/**
 * 注销登录
 * @returns 注销结果
 */
export const logout = async (): Promise<AuthResponse> => {
  try {
    console.log('===== 注销API开始调用 =====');

    // 调用真实注销接口
    const response = await ApiService.post('/api/auth/logout');

    // 清除存储的token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    console.log('Token清除完成');

    return {
      success: true,
      message: '注销成功'
    };
  } catch (error: any) {
    console.error('注销请求出错:', error);

    // 即使后端调用失败，也要清除本地token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    return {
      success: true,
      message: '注销成功（本地清理完成）'
    };
  }
};

/**
 * 检查用户是否已登录
 * @returns 登录状态
 */
export const checkAuth = (): boolean => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');

  return !!(localToken || sessionToken);
};

/**
 * 获取当前token
 * @returns 当前token或null
 */
export const getCurrentToken = (): string | null => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');

  console.log('Token获取详情:', {
    hasLocalToken: !!localToken,
    hasSessionToken: !!sessionToken,
    localTokenPreview: localToken ? localToken.substring(0, 10) + '...' : 'null',
    sessionTokenPreview: sessionToken ? sessionToken.substring(0, 10) + '...' : 'null'
  });

  return localToken || sessionToken;
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
    return null;
  }
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  const hasToken = !!getCurrentToken();
  console.log('登录状态检查:', { hasToken });
  return hasToken;
};

/**
 * 检查当前登录状态详情
 */
export const checkLoginStatus = () => {
  const token = getCurrentToken();
  const user = getCurrentUser();

  console.log('当前登录状态详情:', {
    hasToken: !!token,
    hasUser: !!user,
    tokenPreview: token ? token.substring(0, 10) + '...' : 'null',
    userInfo: user
  });

  // 在浏览器控制台中暴露调试函数
  if (typeof window !== 'undefined') {
    (window as any).debugAuth = {
      checkLoginStatus,
      getCurrentToken,
      getCurrentUser,
      clearTokens: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        console.log('所有Token已清除');
      }
    };
    console.log('🔧 调试函数已暴露到 window.debugAuth');
  }

  return { hasToken: !!token, hasUser: !!user, token, user };
};

/**
 * 用户登出
 */
export const logoutUser = () => {
  try {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // 跳转到登录页
    window.location.href = '/login';
  } catch (error) {
    console.error('登出失败:', error);
  }
};

/**
 * 修改密码
 */
export const changePassword = async (passwordData: {
  oldPassword: string;
  newPassword: string;
}): Promise<AuthResponse> => {
  try {
    console.log('开始修改密码...', { hasOldPassword: !!passwordData.oldPassword, hasNewPassword: !!passwordData.newPassword });

    // 检查当前登录状态
    const loginStatus = checkLoginStatus();
    console.log('登录状态检查结果:', loginStatus);

    if (!loginStatus.hasToken) {
      console.log('用户未登录，无法修改密码');
      return {
        success: false,
        message: '用户未登录，请先登录'
      };
    }

    if (!loginStatus.hasUser) {
      console.log('用户信息缺失，无法修改密码');
      return {
        success: false,
        message: '用户信息缺失，请重新登录'
      };
    }

    const token = loginStatus.token;
    console.log('获取到的Token:', token ? token.substring(0, 10) + '...' : '无Token');
    console.log('Token长度:', token ? token.length : 0);
    console.log('Token类型:', typeof token);

    if (!token) {
      console.log('用户未登录，无法修改密码');
      return {
        success: false,
        message: '用户未登录'
      };
    }

    // 验证Token格式
    if (typeof token !== 'string' || token.trim().length === 0) {
      console.log('Token格式无效');
      return {
        success: false,
        message: 'Token格式无效，请重新登录'
      };
    }

    // 验证Token是否以"Bearer "开头（如果需要的话）
    const authHeader = `Bearer ${token}`;
    console.log('Authorization Header:', authHeader.substring(0, 20) + '...');
    console.log('完整Token:', token);
    console.log('Token是否包含空格:', token.includes(' '));
    console.log('Token是否为空字符串:', token === '');
    console.log('Token是否只包含空白字符:', token.trim() === '');

    console.log('发送修改密码请求到后端...');
    console.log('请求数据:', {
      url: 'http://localhost:50032/api/auth/change-password',
      data: passwordData,
      headers: { Authorization: authHeader.substring(0, 20) + '...' }
    });

    // 使用正确的API路径
    const response = await axios.post('http://localhost:50032/api/auth/change-password', passwordData, {
      headers: {
        'Authorization': authHeader
      }
    });

    console.log('后端响应:', response.data);

    if (response.data.success) {
      console.log('密码修改成功');
      return {
        success: true,
        message: '密码修改成功'
      };
    } else {
      console.log('密码修改失败:', response.data.message);
      return {
        success: false,
        message: response.data.message || '密码修改失败'
      };
    }
  } catch (error: any) {
    console.error('修改密码失败:', error);

    // 如果后端服务不可用，使用模拟修改密码
    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      console.log('后端服务不可用，使用模拟修改密码');
      return mockChangePassword(passwordData);
    }

    return {
      success: false,
      message: error.message || '密码修改失败'
    };
  }
};

/**
 * 模拟修改密码（当后端服务不可用时使用）
 */
const mockChangePassword = (passwordData: {
  oldPassword: string;
  newPassword: string;
}): AuthResponse => {
  // 简单的密码验证（实际项目中应该验证旧密码）
  if (passwordData.oldPassword === 'admin123' && passwordData.newPassword.length >= 6) {
    return {
      success: true,
      message: '密码修改成功（模拟）'
    };
  } else {
    return {
      success: false,
      message: '当前密码错误或新密码不符合要求'
    };
  }
};

/**
 * 网络配置
 * 集中管理所有网络请求相关的配置、拦截器和工具
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// ===== 环境配置 =====

// 确定当前环境
const env = process.env.NODE_ENV || 'development';

// 基础配置接口
interface ApiConfig {
  BASE_URL: string;
  API_PREFIX: string;
  TIMEOUT: number;
  RETRY_COUNT: number;
  RETRY_DELAY: number;
}

// 不同环境的配置
const configs: Record<string, ApiConfig> = {
  development: {
    BASE_URL: 'http://localhost:50008', // 启用后端请求，连接真实数据库
    API_PREFIX: '/api',
    TIMEOUT: parseInt(process.env.REACT_APP_TIMEOUT || '15000'),
    RETRY_COUNT: 1, // 启用重试
    RETRY_DELAY: 1000
  },
  test: {
    BASE_URL: 'http://test-api.example.com',
    API_PREFIX: '/api',
    TIMEOUT: 15000,
    RETRY_COUNT: 1,
    RETRY_DELAY: 1000
  },
  production: {
    BASE_URL: process.env.REACT_APP_API_URL || '',
    API_PREFIX: process.env.REACT_APP_API_PREFIX || '/api',
    TIMEOUT: 20000,
    RETRY_COUNT: 0, // 生产环境不自动重试
    RETRY_DELAY: 0
  }
};

// 当前环境的配置
export const API_CONFIG = configs[env];

// 其他网络相关的通用配置
export const NET_CONFIG = {
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_CURRENT_PAGE: 1
  },

  // 缓存配置
  CACHE: {
    ENABLED: true,
    TTL: 60000, // 缓存有效期，毫秒
    STORAGE_KEY_PREFIX: 'api_cache_'
  },

  // 调试选项
  DEBUG: {
    ENABLED: process.env.REACT_APP_DEBUG === 'true',
    LOG_REQUESTS: true,
    LOG_RESPONSES: true
  }
};

// ===== Axios实例配置 =====

// 请求计数器与加载状态
let requestCount = 0;
const loadingDelay = 300;
let loadingTimer: NodeJS.Timeout | null = null;

// 创建axios实例
export const createApiClient = (): AxiosInstance => {
  // 合并baseURL和前缀
  const baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;

  const instance = axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 增加请求计数
      requestCount++;

      // 处理全局loading
      if (requestCount === 1 && !loadingTimer) {
        loadingTimer = setTimeout(() => {
          // 这里可以触发全局loading状态
          // 例如使用Redux: dispatch(setLoading(true))
        }, loadingDelay);
      }

      // 添加认证信息
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 调试日志
      if (NET_CONFIG.DEBUG.ENABLED && NET_CONFIG.DEBUG.LOG_REQUESTS) {
        console.log(`🌐 请求: ${config.method?.toUpperCase()} ${config.url}`, config);
      }

      return config;
    },
    (error) => {
      handleRequestComplete();
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      handleRequestComplete();

      // 调试日志
      if (NET_CONFIG.DEBUG.ENABLED && NET_CONFIG.DEBUG.LOG_RESPONSES) {
        console.log(`✅ 响应: ${response.config.url}`, response);
      }

      return response;
    },
    async (error: AxiosError) => {
      handleRequestComplete();

      // 调试日志
      if (NET_CONFIG.DEBUG.ENABLED) {
        console.error(`❌ 错误: ${error.config?.url}`, error);
      }

      // 处理重试逻辑
      const config = error.config as AxiosRequestConfig & { _retryCount?: number };

      if (config) {
        config._retryCount = config._retryCount || 0;

        // 如果可以重试且未超出重试次数
        if (shouldRetry(error) && config._retryCount < API_CONFIG.RETRY_COUNT) {
          config._retryCount += 1;

          // 延迟重试
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));

          return instance(config);
        }
      }

      // 统一错误处理
      handleApiError(error);

      return Promise.reject(error);
    }
  );

  return instance;
};

// 判断是否应该重试请求
function shouldRetry(error: AxiosError): boolean {
  // 网络错误应该重试
  if (error.message && error.message.includes('Network Error')) {
    return true;
  }

  // 服务器错误(5xx)应该重试
  if (error.response && error.response.status >= 500 && error.response.status < 600) {
    return true;
  }

  // 请求超时应该重试
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  return false;
}

// 处理请求完成
function handleRequestComplete() {
  requestCount--;

  if (requestCount <= 0) {
    requestCount = 0;
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
    }
    // 关闭全局loading
    // 例如使用Redux: dispatch(setLoading(false))
  }
}

// 处理API错误
function handleApiError(error: AxiosError) {
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data as any;

    switch (status) {
      case 401:
        message.error('用户未登录或登录已过期，请重新登录');
        localStorage.removeItem('token');
        // 重定向到登录页
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => window.location.href = '/login', 1500);
        }
        break;

      case 403:
        message.error('您没有权限执行此操作');
        break;

      case 404:
        message.error('请求的资源不存在');
        break;

      case 422:
        // 表单验证错误
        if (errorData && errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          message.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          message.error('提交的数据无效');
        }
        break;

      case 429:
        message.error('请求过于频繁，请稍后再试');
        break;

      case 500:
        message.error('服务器内部错误，请稍后再试');
        break;

      default:
        message.error(
          errorData?.message ||
          `请求失败(${status})：${error.response.statusText || '未知错误'}`
        );
    }
  } else if (error.request) {
    // 请求发出但没有收到响应
    message.error('无法连接到服务器，请检查网络连接');
  } else {
    // 请求配置出错
    message.error(`请求配置错误: ${error.message}`);
  }
}

// ===== API实例与工具函数 =====

// 创建默认API实例
export const apiClient = createApiClient();

// API初始化函数
export function setupNetConfig() {
  if (NET_CONFIG.DEBUG.ENABLED) {
    console.log('网络配置初始化:', {
      环境: env,
      API配置: API_CONFIG,
      网络配置: NET_CONFIG
    });
  }

  // 可以在此添加其他初始化逻辑
}

export const api = createApiClient();

export default {
  setup: setupNetConfig,
  apiClient: api,
  apiConfig: API_CONFIG,
  config: NET_CONFIG,  // 改为 config 而不是 netConfig
  createApiClient,
  baseUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`
} as const;
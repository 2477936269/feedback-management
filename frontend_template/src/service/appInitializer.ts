import { dateConfig } from '../config';
import { message } from 'antd';

/**
 * 应用初始化结果接口
 */
export interface InitResult {
  success: boolean;
  error?: string;
}

/**
 * 应用初始化函数
 * 处理全局配置、API设置以及其他环境初始化
 */
export async function initializeApp(): Promise<InitResult> {
  try {
    console.log('🔧 开始初始化应用（Mock模式）...');

    // 初始化日期配置
    dateConfig.setup();

    // 设置其他全局环境
    setupGlobalEnvironment();

    // 初始化Mock数据
    console.log('📦 Mock数据服务已准备就绪');

    console.log('✅ 应用初始化完成（Mock模式）');
    return { success: true };
  } catch (error) {
    console.error('❌ 应用初始化失败:', error);
    let errorMessage = '应用初始化失败';

    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 设置全局拦截器 - Mock模式下简化版本
 * 处理全局环境设置，不需要axios拦截器
 */
function setupGlobalInterceptors(): void {
  console.log('🔧 Mock模式：跳过axios拦截器设置');
  // Mock模式下不需要设置axios拦截器
  // 所有请求都通过Mock服务处理
}

/**
 * 设置其他全局环境
 */
function setupGlobalEnvironment(): void {
  // 设置全局错误处理
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('全局错误:', { message, source, lineno, colno, error });
    // 可以将错误发送到监控系统
    return false; // 允许默认的错误处理
  };

  // 其他全局设置...
  console.log('🌐 全局环境设置完成');
}

/**
 * 加载初始数据
 */
async function loadInitialData(): Promise<void> {
  try {
    // 这里可以加载应用初始需要的数据
    // 例如: 用户信息、权限、系统配置等

    // const userInfo = await axios.get('/user/info');
    // const permissions = await axios.get('/user/permissions');
    // const sysConfig = await axios.get('/system/config');

    // 可以将这些数据存储到全局状态中

  } catch (error) {
    console.error('加载初始数据失败:', error);
    throw error; // 重新抛出错误让上层处理
  }
}
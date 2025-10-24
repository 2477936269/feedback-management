import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 日志类型定义
interface LogEvent {
  type: 'click' | 'submit' | 'navigation' | 'api' | 'error';
  component?: string;
  action?: string;
  data?: any;
  timestamp: number;
  path: string;
}

// 日志上下文
const LogContext = createContext<{
  logEvent: (event: Omit<LogEvent, 'timestamp' | 'path'>) => void;
}>(null!);

export const LogProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const location = useLocation();
  
  // 全局事件捕获
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-log-click') || target.closest('[data-log-click]')) {
        const logElement = target.hasAttribute('data-log-click') 
          ? target 
          : target.closest('[data-log-click]');
        const action = logElement?.getAttribute('data-log-action') || 'click';
        const component = logElement?.getAttribute('data-log-component') || logElement?.tagName;
        
        logEvent({
          type: 'click',
          component: component?.toString(),
          action
        });
      }
    };
    
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, []);

  // 页面导航日志
  useEffect(() => {
    logEvent({
      type: 'navigation',
      action: 'pageview',
      data: { path: location.pathname }
    });
  }, [location]);

  // 日志记录主函数
  const logEvent = (event: Omit<LogEvent, 'timestamp' | 'path'>) => {
    const fullEvent: LogEvent = {
      ...event,
      timestamp: Date.now(),
      path: location.pathname
    };
    
    // 本地存储或发送到服务器
    console.log('操作日志:', fullEvent);
    
    // TODO: 发送到后端API或保存到本地存储
    // apiService.logUserAction(fullEvent);
  };

  return (
    <LogContext.Provider value={{ logEvent }}>
      {children}
    </LogContext.Provider>
  );
};

// 自定义Hook方便使用
export const useLogger = () => {
  return useContext(LogContext);
};
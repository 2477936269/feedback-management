/**
 * 权限上下文 - 简化版本
 * 提供全局认证状态管理，登录用户拥有全部权限
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

// 上下文类型定义
interface AuthContextType {
  isAuthenticated: boolean;
  permissionLoaded: boolean;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  hasAllPermissions: (permissionCodes: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

// 创建上下文
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  permissionLoaded: false,
  hasPermission: () => true, // 简化版本：登录用户拥有全部权限
  hasRole: () => true, // 简化版本：登录用户拥有全部权限
  hasAnyPermission: () => true, // 简化版本：登录用户拥有全部权限
  hasAllPermissions: () => true, // 简化版本：登录用户拥有全部权限
  refreshPermissions: async () => {}
});

// 上下文提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissionLoaded, setPermissionLoaded] = useState(false);

  // 检查用户是否已登录
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
  };

  // 简化版本：加载认证状态
  const loadAuthStatus = async () => {
    try {
      // 简化版本：只需要检查token是否存在
      setPermissionLoaded(true);
    } catch (error) {
      console.error('加载认证状态失败:', error);
      setPermissionLoaded(true);
    }
  };

  // 首次渲染时加载认证状态
  useEffect(() => {
    loadAuthStatus();
  }, []);

  // 简化版本：登录用户拥有全部权限
  const hasPermission = (permissionCode: string): boolean => {
    return isAuthenticated();
  };

  // 简化版本：登录用户拥有全部权限
  const hasRole = (roleCode: string): boolean => {
    return isAuthenticated();
  };

  // 简化版本：登录用户拥有全部权限
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return isAuthenticated();
  };

  // 简化版本：登录用户拥有全部权限
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return isAuthenticated();
  };

  // 提供上下文值
  const contextValue: AuthContextType = {
    isAuthenticated: isAuthenticated(),
    permissionLoaded,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: loadAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义Hook以便于使用权限上下文
export const useAuth = () => useContext(AuthContext);
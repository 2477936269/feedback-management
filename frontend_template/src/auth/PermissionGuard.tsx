/**
 * 权限守卫组件
 * 简化版本：登录用户拥有全部权限
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGuardProps {
  permission?: string | string[];  // 需要的权限代码（已简化，不再使用）
  role?: string | string[];        // 需要的角色代码（已简化，不再使用）
  anyPermission?: boolean;         // 已简化，不再使用
  anyRole?: boolean;               // 已简化，不再使用
  children: React.ReactNode;       // 子组件
  fallback?: React.ReactNode;      // 无权限时显示的内容
}

/**
 * 权限守卫组件 - 简化版本
 * 只要用户已登录就拥有全部权限
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  const { isAuthenticated } = useAuth();

  // 只要用户已登录就显示内容
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
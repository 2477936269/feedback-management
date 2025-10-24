/**
 * 权限Hook
 * 提供权限检查功能和权限状态
 */
import { useState, useEffect, useCallback } from 'react';
import { getPermissions, Permission } from '../service/permissionService';
import { getRoles } from '../service/roleService';

// 权限类型定义
export type PermissionType = string;
export type RoleType = string;

// 用户权限状态
interface PermissionState {
  permissions: PermissionType[];
  roles: RoleType[];
  loaded: boolean;
}

// 内部权限缓存
let permissionCache: PermissionState = {
  permissions: [],
  roles: [],
  loaded: false
};

// 加载权限的观察者，用于通知权限更新
const observers: Function[] = [];

/**
 * 加载当前用户权限
 */
export const loadPermissions = async (forceRefresh = false): Promise<PermissionState> => {
  // 如果已加载且不强制刷新，返回缓存
  if (permissionCache.loaded && !forceRefresh) {
    return permissionCache;
  }

  try {
    // 获取用户的权限和角色
    const [permissionsRes, rolesRes] = await Promise.all([
      getPermissions(),
      getRoles()
    ]);

    // 处理权限数据格式
    const permissionsData = permissionsRes.data?.data || permissionsRes.data || [];
    const permissions = Array.isArray(permissionsData) ? permissionsData.map((p: Permission) => p.code) : [];

    // 处理角色数据格式
    const rolesData = rolesRes.data?.data || rolesRes.data || [];
    const roles = Array.isArray(rolesData) ? rolesData.map((r: any) => r.name || r.code) : [];

    // 更新权限缓存
    permissionCache = {
      permissions,
      roles,
      loaded: true
    };

    // 通知所有观察者
    observers.forEach(callback => callback(permissionCache));

    return permissionCache;
  } catch (error) {
    console.error('加载权限失败:', error);
    return { permissions: [], roles: [], loaded: false };
  }
};

/**
 * 权限Hook - 返回权限检查函数和权限状态
 */
export const usePermission = () => {
  const [state, setState] = useState<PermissionState>(permissionCache);

  useEffect(() => {
    // 初始加载
    if (!permissionCache.loaded) {
      loadPermissions();
    }

    // 订阅权限变更
    const unsubscribe = subscribePermissions(setState);
    return unsubscribe;
  }, []);

  const checkPermission = useCallback((code: PermissionType) => {
    return state.permissions.includes(code);
  }, [state.permissions]);

  const checkRole = useCallback((code: RoleType) => {
    return state.roles.includes(code);
  }, [state.roles]);

  return {
    hasPermission: checkPermission,
    hasRole: checkRole,
    hasAnyPermission: useCallback((codes: PermissionType[]) =>
      codes.some(code => state.permissions.includes(code)), [state.permissions]),
    hasAllPermissions: useCallback((codes: PermissionType[]) =>
      codes.every(code => state.permissions.includes(code)), [state.permissions]),
    permissions: state.permissions,
    roles: state.roles,
    isLoaded: state.loaded,
    refresh: () => loadPermissions(true)
  };
};

/**
 * 添加权限更新观察者
 */
export const subscribePermissions = (callback: Function): () => void => {
  observers.push(callback);
  return () => {
    const index = observers.indexOf(callback);
    if (index !== -1) {
      observers.splice(index, 1);
    }
  };
};

/**
 * 清除权限缓存(用于登出)
 */
export const clearPermissions = () => {
  permissionCache = { permissions: [], roles: [], loaded: false };
  observers.forEach(callback => callback(permissionCache));
};
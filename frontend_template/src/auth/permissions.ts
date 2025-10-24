/**
 * 权限常量定义文件
 * 集中管理所有权限标识符
 */

// 权限常量定义
export const Permissions = {
  // 用户模块权限
  USER: {
    VIEW: 'user:view',
    CREATE: 'user:create',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    EXPORT: 'user:export',
    IMPORT: 'user:import',
    RESET_PASSWORD: 'user:reset-password'
  },
  
  // 角色模块权限
  ROLE: {
    VIEW: 'role:view',
    CREATE: 'role:create',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
    ASSIGN: 'role:assign'
  },
  
  // 组织模块权限
  ORG: {
    VIEW: 'org:view',
    CREATE: 'org:create',
    UPDATE: 'org:update',
    DELETE: 'org:delete',
    MANAGE_MEMBER: 'org:manage-member'
  },

  // 权限管理模块
  PERMISSION: {
    VIEW: 'permission:view',
    ASSIGN: 'permission:assign',
    MANAGE: 'permission:manage'
  },

  // 系统管理
  SYSTEM: {
    MANAGE_PERMISSIONS: 'system:manage-permissions',
    MANAGE_SETTINGS: 'system:manage-settings',
    VIEW_LOGS: 'system:view-logs'
  }
};

// 预定义角色
export const Roles = {
  ADMIN: 'admin',             // 系统管理员
  ORG_ADMIN: 'org_admin',     // 组织管理员
  DEPT_ADMIN: 'dept_admin',   // 部门管理员
  USER: 'user'                // 普通用户
};

// 权限类型
export enum PermissionType {
  READ = 'READ',      // 读取权限
  WRITE = 'WRITE',    // 写入权限
  EXECUTE = 'EXECUTE' // 执行权限
}
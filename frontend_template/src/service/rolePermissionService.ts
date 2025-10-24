import { MockService } from './mockService';

/**
 * 获取角色权限关系 - Mock实现
 * @param roleId 角色ID
 */
export const getRolePermissions = async (roleId: string) => {
  console.log('===== Mock获取角色权限关系API开始调用 =====');
  console.log('角色ID:', roleId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    // Mock返回权限数据
    const mockPermissions = [
      { id: 1, name: 'user:read', displayName: '查看用户', checked: true },
      { id: 2, name: 'user:create', displayName: '创建用户', checked: false },
      { id: 3, name: 'user:update', displayName: '更新用户', checked: true },
      { id: 4, name: 'user:delete', displayName: '删除用户', checked: false }
    ];

    return {
      data: {
        success: true,
        data: mockPermissions
      }
    };
  } catch (error: any) {
    console.error('Mock获取角色权限关系失败:', error);
    throw error;
  }
};

/**
 * 为角色分配权限 - Mock实现
 * @param roleId 角色ID
 * @param permissionIds 权限ID列表
 */
export const assignPermissionsToRole = async (roleId: string, permissionIds: string[]) => {
  console.log('===== Mock为角色分配权限API开始调用 =====');
  console.log('角色ID:', roleId, '权限IDs:', permissionIds);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟

    return {
      data: {
        success: true,
        message: `成功为角色分配${permissionIds.length}个权限`
      }
    };
  } catch (error: any) {
    console.error('Mock为角色分配权限失败:', error);
    throw error;
  }
};

/**
 * 移除角色权限 - Mock实现
 * @param roleId 角色ID
 * @param permissionIds 权限ID列表
 */
export const removePermissionsFromRole = async (roleId: string, permissionIds: string[]) => {
  console.log('===== Mock移除角色权限API开始调用 =====');
  console.log('角色ID:', roleId, '权限IDs:', permissionIds);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟

    return {
      data: {
        success: true,
        message: `成功移除角色的${permissionIds.length}个权限`
      }
    };
  } catch (error: any) {
    console.error('Mock移除角色权限失败:', error);
    throw error;
  }
};

/**
 * 获取用户权限 - Mock实现
 * @param userId 用户ID
 */
export const getUserPermissions = async (userId: string) => {
  console.log('===== Mock获取用户权限API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    // Mock返回用户权限数据
    const mockUserPermissions = [
      'user:read',
      'user:create',
      'user:update',
      'role:read'
    ];

    return {
      data: {
        success: true,
        data: mockUserPermissions
      }
    };
  } catch (error: any) {
    console.error('Mock获取用户权限失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否有特定权限 - Mock实现
 * @param userId 用户ID
 * @param permission 权限名称
 */
export const checkUserPermission = async (userId: string, permission: string) => {
  console.log('===== Mock检查用户权限API开始调用 =====');
  console.log('用户ID:', userId, '权限:', permission);

  try {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟延迟

    // Mock实现：管理员有所有权限，其他用户有基础权限
    const hasPermission = userId === '1' || permission.includes('read');

    return {
      data: {
        success: true,
        data: { hasPermission }
      }
    };
  } catch (error: any) {
    console.error('Mock检查用户权限失败:', error);
    throw error;
  }
};

/**
 * 从角色移除权限 - Mock实现（单个权限）
 * @param roleId 角色ID
 * @param permissionId 权限ID
 */
export const removePermissionFromRole = async (roleId: string, permissionId: string) => {
  console.log('===== Mock从角色移除单个权限API开始调用 =====');
  console.log('角色ID:', roleId, '权限ID:', permissionId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '成功移除角色权限'
      }
    };
  } catch (error: any) {
    console.error('Mock从角色移除单个权限失败:', error);
    throw error;
  }
};
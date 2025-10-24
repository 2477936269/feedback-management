import { MockService } from './mockService';

// 定义权限接口
export interface Permission {
  id: number;
  name: string;
  displayName: string;
  description: string;
  module: string;
  action: string;
  code: string;
  resource?: string;
  type?: string;
  createdAt?: string;
}

// 定义权限查询参数接口
export interface PermissionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  module?: string;
  action?: string;
  nameContains?: string;
  system?: string;
  type?: string;
  resource?: string;
}

// 定义枚举选项接口
export interface EnumOption {
  key?: string;
  label: string;
  value: string;
}

/**
 * 获取权限列表 - 使用Mock数据
 */
export const getPermissions = async (params?: any) => {
  console.log('===== Mock获取权限列表API开始调用 =====');
  console.log('查询参数:', params);

  try {
    const response = await MockService.getPermissions();

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data, // 直接返回权限数组
        items: response.data, // 兼容items格式
        total: response.data.length // 添加总数
      }
    };
  } catch (error: any) {
    console.error('Mock获取权限列表失败:', error);
    throw error;
  }
};

/**
 * 创建权限 - Mock实现
 * @param data 权限数据
 */
export const createPermission = async (data: any) => {
  console.log('===== Mock创建权限API开始调用 =====');
  console.log('创建权限数据:', data);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        data: { id: Date.now(), ...data },
        message: '权限创建成功'
      }
    };
  } catch (error: any) {
    console.error('Mock创建权限失败:', error);
    throw error;
  }
};

/**
 * 更新权限 - Mock实现
 * @param id 权限ID
 * @param data 更新数据
 */
export const updatePermission = async (id: string, data: any) => {
  console.log('===== Mock更新权限API开始调用 =====');
  console.log('权限ID:', id, '更新数据:', data);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        data: { id: parseInt(id), ...data },
        message: '权限更新成功'
      }
    };
  } catch (error: any) {
    console.error('Mock更新权限失败:', error);
    throw error;
  }
};

/**
 * 删除权限 - Mock实现
 * @param id 权限ID
 */
export const deletePermission = async (id: string) => {
  console.log('===== Mock删除权限API开始调用 =====');
  console.log('权限ID:', id);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '权限删除成功'
      }
    };
  } catch (error: any) {
    console.error('Mock删除权限失败:', error);
    throw error;
  }
};

/**
 * 获取权限枚举 - Mock实现
 */
export const getPermissionEnums = async () => {
  console.log('===== Mock获取权限枚举API开始调用 =====');

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟延迟

    const enums = {
      modules: [
        { label: '反馈管理', value: 'user' },
        { label: '角色管理', value: 'role' },
        { label: '权限管理', value: 'permission' },
        { label: '系统管理', value: 'system' }
      ],
      systems: [
        { label: '核心系统', value: 'CORE' },
        { label: '客户关系管理', value: 'CRM' },
        { label: '订单管理系统', value: 'OMS' },
        { label: '反馈管理系统', value: 'USER' }
      ],
      resources: [
        { label: '用户', value: 'user' },
        { label: '角色', value: 'role' },
        { label: '权限', value: 'permission' },
        { label: '组织', value: 'organization' },
        { label: '部门', value: 'department' }
      ],
      actions: [
        { label: '查看', value: 'read' },
        { label: '创建', value: 'create' },
        { label: '更新', value: 'update' },
        { label: '删除', value: 'delete' }
      ]
    };

    return {
      data: {
        success: true,
        data: enums
      }
    };
  } catch (error: any) {
    console.error('Mock获取权限枚举失败:', error);
    throw error;
  }
};

/**
 * 根据权限类型获取选项 - Mock实现
 */
export const getOptionsByPermissionType = async (type: string) => {
  console.log('===== Mock根据权限类型获取选项API开始调用 =====');
  console.log('权限类型:', type);

  try {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟延迟

    // 返回资源和操作选项
    const resources: EnumOption[] = [
      { label: '用户', value: 'user' },
      { label: '角色', value: 'role' },
      { label: '权限', value: 'permission' },
      { label: '组织', value: 'organization' },
      { label: '部门', value: 'department' }
    ];

    const actions: EnumOption[] = [
      { label: '查看', value: 'read' },
      { label: '创建', value: 'create' },
      { label: '更新', value: 'update' },
      { label: '删除', value: 'delete' },
      { label: '导出', value: 'export' },
      { label: '导入', value: 'import' }
    ];

    return {
      data: {
        success: true,
        data: {
          resources,
          actions
        }
      }
    };
  } catch (error: any) {
    console.error('Mock根据权限类型获取选项失败:', error);
    throw error;
  }
};

/**
 * 获取当前用户权限 - Mock实现
 */
export const getCurrentUserPermissions = async () => {
  console.log('===== Mock获取当前用户权限API开始调用 =====');

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟延迟

    // Mock返回管理员权限
    const mockUserPermissions: Permission[] = [
      { id: 1, name: 'user:create', displayName: '创建用户', description: '允许创建新用户', module: 'user', action: 'create', code: 'user:create' },
      { id: 2, name: 'user:read', displayName: '查看用户', description: '允许查看用户信息', module: 'user', action: 'read', code: 'user:read' },
      { id: 3, name: 'user:update', displayName: '更新用户', description: '允许更新用户信息', module: 'user', action: 'update', code: 'user:update' },
      { id: 4, name: 'user:delete', displayName: '删除用户', description: '允许删除用户', module: 'user', action: 'delete', code: 'user:delete' },
      { id: 5, name: 'role:create', displayName: '创建角色', description: '允许创建新角色', module: 'role', action: 'create', code: 'role:create' },
      { id: 6, name: 'role:read', displayName: '查看角色', description: '允许查看角色信息', module: 'role', action: 'read', code: 'role:read' },
      { id: 7, name: 'role:update', displayName: '更新角色', description: '允许更新角色信息', module: 'role', action: 'update', code: 'role:update' },
      { id: 8, name: 'role:delete', displayName: '删除角色', description: '允许删除角色', module: 'role', action: 'delete', code: 'role:delete' }
    ];

    return {
      data: {
        success: true,
        data: mockUserPermissions
      }
    };
  } catch (error: any) {
    console.error('Mock获取当前用户权限失败:', error);
    throw error;
  }
};
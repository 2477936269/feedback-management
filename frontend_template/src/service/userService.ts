import { MockService } from './mockService';

/**
 * 获取用户列表 - 使用Mock数据
 * @param params 查询参数
 */
export const getUsers = async (params?: any) => {
  console.log('===== Mock获取用户列表API开始调用 =====');
  console.log('查询参数:', params);

  // 处理搜索参数，将前端参数映射为Mock服务所需格式
  const queryParams: any = {
    page: params?.current || 1,
    pageSize: params?.pageSize || 10
  };

  // 处理搜索关键词
  if (params?.search) queryParams.search = params.search;
  if (params?.username) queryParams.search = params.username;
  if (params?.email) queryParams.search = params.email;
  if (params?.phoneNumber) queryParams.search = params.phoneNumber;

  // 处理状态
  if (params?.status) {
    queryParams.status = params.status;
  }

  console.log('发送给Mock API的最终参数:', queryParams);

  try {
    const response = await MockService.getUsers(queryParams);

    if (!response.success) {
      throw new Error(response.message);
    }

    // 转换为前端期望的格式
    return {
      data: {
        success: true,
        data: {
          data: response.data.items, // 兼容旧的data.data格式
          items: response.data.items,
          total: response.data.total,
          current: response.data.page,
          pageSize: response.data.pageSize
        }
      }
    };
  } catch (error: any) {
    console.error('Mock获取用户列表失败:', error);
    throw error;
  }
};

/**
 * 更新用户 - 使用Mock数据
 * @param id 用户ID
 * @param data 更新数据
 */
export const updateUser = async (id: string, data: any) => {
  console.log('===== Mock更新用户API开始调用 =====');
  console.log('用户ID:', id, '更新数据:', data);

  try {
    const response = await MockService.updateUser(parseInt(id), data);

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data
      }
    };
  } catch (error: any) {
    console.error('Mock更新用户失败:', error);
    throw error;
  }
};

/**
 * 创建用户 - 使用Mock数据
 * @param data 用户数据
 */
export const createUser = async (data: any) => {
  console.log('===== Mock创建用户API开始调用 =====');
  console.log('创建用户数据:', data);

  try {
    const response = await MockService.createUser(data);

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data
      }
    };
  } catch (error: any) {
    console.error('Mock创建用户失败:', error);
    throw error;
  }
};

/**
 * 获取单个用户详情 - 使用Mock数据
 * @param id 用户ID
 */
export const getUserById = async (id: string) => {
  console.log('===== Mock获取用户详情API开始调用 =====');
  console.log('用户ID:', id);

  try {
    const response = await MockService.getUserById(parseInt(id));

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data
      }
    };
  } catch (error: any) {
    console.error('Mock获取用户详情失败:', error);
    throw error;
  }
};

/**
 * 删除用户 - 使用Mock数据
 * @param id 用户ID
 */
export const deleteUser = async (id: string) => {
  console.log('===== Mock删除用户API开始调用 =====');
  console.log('用户ID:', id);

  try {
    const response = await MockService.deleteUser(parseInt(id));

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        message: response.message
      }
    };
  } catch (error: any) {
    console.error('Mock删除用户失败:', error);
    throw error;
  }
};

/**
 * 为用户分配角色 - Mock实现
 * @param userId 用户ID
 * @param roleIds 角色ID数组
 */
export const assignRolesToUser = async (userId: string, roleIds: string[]) => {
  console.log('===== Mock分配用户角色API开始调用 =====');
  console.log('用户ID:', userId, '角色IDs:', roleIds);

  // Mock实现：模拟分配角色成功
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '角色分配成功'
      }
    };
  } catch (error: any) {
    console.error('Mock分配用户角色失败:', error);
    throw error;
  }
};

/**
 * 重置用户密码 - Mock实现
 * @param userId 用户ID
 * @param newPassword 新密码
 */
export const resetUserPassword = async (userId: string, newPassword: string) => {
  console.log('===== Mock重置用户密码API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '密码重置成功'
      }
    };
  } catch (error: any) {
    console.error('Mock重置用户密码失败:', error);
    throw error;
  }
};

/**
 * 启用用户 - Mock实现
 * @param userId 用户ID
 */
export const enableUser = async (userId: string) => {
  console.log('===== Mock启用用户API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    const response = await MockService.updateUser(parseInt(userId), { status: 'active' });

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        message: '用户启用成功'
      }
    };
  } catch (error: any) {
    console.error('Mock启用用户失败:', error);
    throw error;
  }
};

/**
 * 禁用用户 - Mock实现
 * @param userId 用户ID
 */
export const disableUser = async (userId: string) => {
  console.log('===== Mock禁用用户API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    const response = await MockService.updateUser(parseInt(userId), { status: 'inactive' });

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        message: '用户禁用成功'
      }
    };
  } catch (error: any) {
    console.error('Mock禁用用户失败:', error);
    throw error;
  }
};

/**
 * 锁定用户 - Mock实现
 * @param userId 用户ID
 */
export const lockUser = async (userId: string) => {
  console.log('===== Mock锁定用户API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '用户锁定成功'
      }
    };
  } catch (error: any) {
    console.error('Mock锁定用户失败:', error);
    throw error;
  }
};

/**
 * 解锁用户 - Mock实现
 * @param userId 用户ID
 */
export const unlockUser = async (userId: string) => {
  console.log('===== Mock解锁用户API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '用户解锁成功'
      }
    };
  } catch (error: any) {
    console.error('Mock解锁用户失败:', error);
    throw error;
  }
};

/**
 * 获取用户的角色列表 - Mock实现
 * @param userId 用户ID
 */
export const getUserRoles = async (userId: string) => {
  console.log('===== Mock获取用户角色API开始调用 =====');
  console.log('用户ID:', userId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    // Mock返回一些角色数据
    const mockRoles = [
      { id: 1, name: 'user', displayName: '普通用户' }
    ];

    return {
      data: {
        success: true,
        data: mockRoles
      }
    };
  } catch (error: any) {
    console.error('Mock获取用户角色失败:', error);
    throw error;
  }
};

/**
 * 获取当前登录用户信息 - Mock实现
 */
export const getCurrentUser = async () => {
  console.log('===== Mock获取当前用户信息API开始调用 =====');

  try {
    const response = await MockService.getCurrentUser();

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data
      }
    };
  } catch (error: any) {
    console.error('Mock获取当前用户信息失败:', error);
    throw error;
  }
};

/**
 * 更新用户头像 - Mock实现
 * @param userId 用户ID
 * @param file 头像文件
 */
export const updateUserAvatar = async (userId: string, file: File) => {
  console.log('===== Mock更新用户头像API开始调用 =====');
  console.log('用户ID:', userId, '文件:', file.name);

  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟文件上传延迟

    // Mock返回头像URL
    const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

    return {
      data: {
        success: true,
        data: {
          avatar: mockAvatarUrl
        },
        message: '头像更新成功'
      }
    };
  } catch (error: any) {
    console.error('Mock更新用户头像失败:', error);
    throw error;
  }
};

/**
 * 批量用户操作 - Mock实现
 * @param action 操作类型
 * @param ids 用户ID列表
 */
export const bulkUserActions = async (action: string, ids: string[]) => {
  console.log('===== Mock批量用户操作API开始调用 =====');
  console.log('操作类型:', action, '用户IDs:', ids);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟批量操作延迟

    return {
      data: {
        success: true,
        message: `批量${action}操作成功，影响${ids.length}个用户`
      }
    };
  } catch (error: any) {
    console.error('Mock批量用户操作失败:', error);
    throw error;
  }
};
import { MockService } from './mockService';

/**
 * 获取用户组列表 - 使用Mock数据
 */
export const getUserGroups = async (params?: any) => {
  console.log('===== Mock获取用户组列表API开始调用 =====');
  console.log('查询参数:', params);

  try {
    const response = await MockService.getUserGroups({
      page: params?.current || params?.page || 1,
      pageSize: params?.pageSize || 10
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: {
          data: response.data.items, // 兼容旧格式
          items: response.data.items,
          total: response.data.total,
          current: response.data.page,
          pageSize: response.data.pageSize
        }
      }
    };
  } catch (error: any) {
    console.error('Mock获取用户组列表失败:', error);
    throw error;
  }
};

/**
 * 获取用户组详情 - 使用Mock数据
 * @param id 用户组ID
 */
export const getUserGroupById = async (id: string) => {
  console.log('===== Mock获取用户组详情API开始调用 =====');
  console.log('用户组ID:', id);

  try {
    const response = await MockService.getUserGroupById(parseInt(id));

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
    console.error('Mock获取用户组详情失败:', error);
    throw error;
  }
};

/**
 * 创建用户组 - 使用Mock数据
 * @param data 用户组数据
 */
export const createUserGroup = async (data: any) => {
  console.log('===== Mock创建用户组API开始调用 =====');
  console.log('创建用户组数据:', data);

  try {
    const response = await MockService.createUserGroup(data);

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
    console.error('Mock创建用户组失败:', error);
    throw error;
  }
};

/**
 * 更新用户组 - 使用Mock数据
 * @param id 用户组ID
 * @param data 更新数据
 */
export const updateUserGroup = async (id: string, data: any) => {
  console.log('===== Mock更新用户组API开始调用 =====');
  console.log('用户组ID:', id, '更新数据:', data);

  try {
    const response = await MockService.updateUserGroup(parseInt(id), data);

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
    console.error('Mock更新用户组失败:', error);
    throw error;
  }
};

/**
 * 删除用户组 - 使用Mock数据
 * @param id 用户组ID
 */
export const deleteUserGroup = async (id: string) => {
  console.log('===== Mock删除用户组API开始调用 =====');
  console.log('用户组ID:', id);

  try {
    const response = await MockService.deleteUserGroup(parseInt(id));

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
    console.error('Mock删除用户组失败:', error);
    throw error;
  }
};

/**
 * 获取用户组成员 - Mock实现
 * @param groupId 用户组ID
 */
export const getUserGroupMembers = async (groupId: string, params?: any) => {
  console.log('===== Mock获取用户组成员API开始调用 =====');
  console.log('用户组ID:', groupId, '查询参数:', params);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    // Mock返回一些成员数据
    const mockMembers = [
      { id: 1, username: 'user001', name: '张三', email: 'user001@example.com' },
      { id: 2, username: 'user002', name: '李四', email: 'user002@example.com' }
    ];

    return {
      data: {
        success: true,
        data: {
          items: mockMembers,
          total: mockMembers.length,
          current: 1,
          pageSize: 10
        }
      }
    };
  } catch (error: any) {
    console.error('Mock获取用户组成员失败:', error);
    throw error;
  }
};

/**
 * 添加用户到用户组 - Mock实现
 * @param groupId 用户组ID
 * @param userIds 用户ID列表
 */
export const addUsersToGroup = async (groupId: string, userIds: string[]) => {
  console.log('===== Mock添加用户到用户组API开始调用 =====');
  console.log('用户组ID:', groupId, '用户IDs:', userIds);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟

    return {
      data: {
        success: true,
        message: `成功添加${userIds.length}个用户到用户组`
      }
    };
  } catch (error: any) {
    console.error('Mock添加用户到用户组失败:', error);
    throw error;
  }
};

/**
 * 从用户组移除用户 - Mock实现
 * @param groupId 用户组ID
 * @param userIds 用户ID列表
 */
export const removeUsersFromGroup = async (groupId: string, userIds: string[]) => {
  console.log('===== Mock从用户组移除用户API开始调用 =====');
  console.log('用户组ID:', groupId, '用户IDs:', userIds);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟

    return {
      data: {
        success: true,
        message: `成功从用户组移除${userIds.length}个用户`
      }
    };
  } catch (error: any) {
    console.error('Mock从用户组移除用户失败:', error);
    throw error;
  }
};

/**
 * 添加用户组成员 - Mock实现
 * @param groupId 用户组ID
 * @param params 参数对象，可以是用户ID列表或包含userIds的对象
 */
export const addUserGroupMembers = async (groupId: string, params: string[] | { userIds: string[]; [key: string]: any }) => {
  console.log('===== Mock添加用户组成员API开始调用 =====');
  console.log('用户组ID:', groupId, '参数:', params);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟

    // 处理不同的参数格式
    let userIds: string[] = [];
    if (Array.isArray(params)) {
      userIds = params;
    } else if (params && typeof params === 'object' && 'userIds' in params) {
      userIds = params.userIds;
    }

    return {
      data: {
        success: true,
        message: `成功添加${userIds.length}个用户到用户组`
      }
    };
  } catch (error: any) {
    console.error('Mock添加用户组成员失败:', error);
    throw error;
  }
};

/**
 * 移除用户组成员 - Mock实现
 * @param groupId 用户组ID
 * @param userId 用户ID
 */
export const removeUserGroupMember = async (groupId: string, userId: string) => {
  console.log('===== Mock移除用户组成员API开始调用 =====');
  console.log('用户组ID:', groupId, '用户ID:', userId);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '成功移除用户组成员'
      }
    };
  } catch (error: any) {
    console.error('Mock移除用户组成员失败:', error);
    throw error;
  }
};

/**
 * 更新用户组成员状态 - Mock实现
 * @param groupId 用户组ID
 * @param userId 用户ID
 * @param status 状态
 */
export const updateUserGroupMemberStatus = async (groupId: string, userId: string, status: string) => {
  console.log('===== Mock更新用户组成员状态API开始调用 =====');
  console.log('用户组ID:', groupId, '用户ID:', userId, '状态:', status);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟

    return {
      data: {
        success: true,
        message: '成功更新用户组成员状态'
      }
    };
  } catch (error: any) {
    console.error('Mock更新用户组成员状态失败:', error);
    throw error;
  }
};
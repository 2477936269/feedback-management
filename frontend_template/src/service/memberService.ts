import { MockService } from './mockService';

/**
 * 获取组织成员列表 - Mock实现
 */
export const getMembers = async (params?: any) => {
  console.log('===== Mock获取组织成员列表API开始调用 =====');
  console.log('查询参数:', params);

  try {
    // 复用用户数据作为成员数据
    const response = await MockService.getUsers({
      page: params?.current || params?.page || 1,
      pageSize: params?.pageSize || 10,
      search: params?.search
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: {
          items: response.data.items,
          total: response.data.total,
          current: response.data.page,
          pageSize: response.data.pageSize
        }
      }
    };
  } catch (error: any) {
    console.error('Mock获取组织成员列表失败:', error);
    throw error;
  }
};

/**
 * 获取成员详情 - Mock实现
 * @param id 成员ID
 */
export const getMemberById = async (id: string) => {
  console.log('===== Mock获取成员详情API开始调用 =====');
  console.log('成员ID:', id);

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
    console.error('Mock获取成员详情失败:', error);
    throw error;
  }
};

/**
 * 添加成员 - Mock实现
 * @param data 成员数据
 */
export const addMember = async (data: any) => {
  console.log('===== Mock添加成员API开始调用 =====');
  console.log('添加成员数据:', data);

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
    console.error('Mock添加成员失败:', error);
    throw error;
  }
};

/**
 * 更新成员信息 - Mock实现
 * @param id 成员ID
 * @param data 更新数据
 */
export const updateMember = async (id: string, data: any) => {
  console.log('===== Mock更新成员信息API开始调用 =====');
  console.log('成员ID:', id, '更新数据:', data);

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
    console.error('Mock更新成员信息失败:', error);
    throw error;
  }
};

/**
 * 移除成员 - Mock实现
 * @param id 成员ID
 */
export const removeMember = async (id: string) => {
  console.log('===== Mock移除成员API开始调用 =====');
  console.log('成员ID:', id);

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
    console.error('Mock移除成员失败:', error);
    throw error;
  }
};

/**
 * 批量成员操作 - Mock实现
 * @param action 操作类型
 * @param ids 成员ID列表
 */
export const bulkMemberActions = async (action: string, ids: string[]) => {
  console.log('===== Mock批量成员操作API开始调用 =====');
  console.log('操作类型:', action, '成员IDs:', ids);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟批量操作延迟

    return {
      data: {
        success: true,
        message: `批量${action}操作成功，影响${ids.length}个成员`
      }
    };
  } catch (error: any) {
    console.error('Mock批量成员操作失败:', error);
    throw error;
  }
};
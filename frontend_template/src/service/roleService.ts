import { MockService } from './mockService';

/**
 * 获取角色列表 - 使用Mock数据
 */
export const getRoles = async (params?: any) => {
  try {
    console.log('===== Mock获取角色列表API开始调用 =====');
    console.log('查询参数:', params);

    // 克隆参数对象，避免修改原始对象
    const queryParams = { ...params };

    // 检查是否为角色分配页面调用
    const isFromAssignmentPage = queryParams._source === 'assignment';
    if (isFromAssignmentPage) {
      delete queryParams._source; // 删除内部标记参数

      // 角色分配页面默认只显示激活角色
      if (queryParams.status === undefined && queryParams.isActive === undefined) {
        queryParams.isActive = true;
        queryParams.status = 'active';
      }
    }

    // 如果是角色列表页面的状态为空字符串，表示"全部"，不添加状态过滤
    if (queryParams.status === '') {
      delete queryParams.status;
    }

    console.log('发送Mock角色查询参数:', queryParams);

    // 调用Mock服务
    const response = await MockService.getRoles({
      page: queryParams.current || queryParams.page || 1,
      pageSize: queryParams.pageSize || 10
    });

    if (!response.success) {
      console.warn('Mock角色API响应失败:', response.message);
      return { data: { data: [], total: 0 } };
    }

    // 处理并规范化响应数据，符合前端期望的格式
    const processedResponse = {
      data: {
        data: response.data.items, // 角色列表 - 兼容旧格式
        items: response.data.items, // 角色列表 - 新格式
        total: response.data.total, // 总数
        current: response.data.page, // 当前页
        pageSize: response.data.pageSize // 页面大小
      }
    };

    console.log('Mock角色响应处理完成:', processedResponse);
    return processedResponse;
  } catch (error) {
    console.error('Mock获取角色列表错误:', error);
    // 返回安全的默认值，而不是抛出异常
    return { data: { data: [], total: 0 } };
  }
};

/**
 * 创建角色 - 使用Mock数据
 * @param data 角色数据
 */
export const createRole = async (data: any) => {
  try {
    console.log('===== Mock创建角色API开始调用 =====');
    console.log('创建角色请求数据:', data);

    const response = await MockService.createRole(data);

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data
      }
    };
  } catch (error) {
    console.error('Mock创建角色失败:', error);
    throw error;
  }
};

/**
 * 获取当前登录用户的角色 - Mock实现
 * 从用户服务或授权服务获取当前用户的角色信息
 */
export const getCurrentUserRoles = async () => {
  console.log('===== Mock获取当前用户角色API开始调用 =====');

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟延迟

    // Mock返回管理员角色
    const mockUserRoles = [
      { id: '1', name: 'admin', displayName: '系统管理员' }
    ];

    return {
      data: {
        success: true,
        data: mockUserRoles
      }
    };
  } catch (error: any) {
    console.error('Mock获取当前用户角色失败:', error);
    throw error;
  }
};

/**
 * 获取角色详情 - 使用Mock数据
 * @param id 角色ID
 */
export const getRoleById = async (id: string) => {
  console.log('===== Mock获取角色详情API开始调用 =====');
  console.log('角色ID:', id);

  try {
    const response = await MockService.getRoleById(parseInt(id));

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
    console.error('Mock获取角色详情失败:', error);
    throw error;
  }
};

/**
 * 更新角色 - 使用Mock数据
 * @param id 角色ID
 * @param data 更新数据
 */
export const updateRole = async (id: string, data: any) => {
  try {
    console.log('===== Mock更新角色API开始调用 =====');
    console.log(`更新角色请求, ID: ${id}, 数据:`, data);

    const response = await MockService.updateRole(id, data);

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      data: {
        success: true,
        data: response.data
      }
    };
  } catch (error) {
    console.error('Mock更新角色失败:', error);
    throw error;
  }
};

/**
 * 删除角色 - 使用Mock数据
 * @param id 角色ID
 */
export const deleteRole = async (id: string) => {
  console.log('===== Mock删除角色API开始调用 =====');
  console.log('角色ID:', id);

  try {
    const response = await MockService.deleteRole(id);

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
    console.error('Mock删除角色失败:', error);
    throw error;
  }
};

/**
 * 角色批量操作 - Mock实现
 * @param action 操作类型
 * @param ids 角色ID列表
 */
export const bulkRoleActions = async (action: string, ids: string[]) => {
  console.log('===== Mock角色批量操作API开始调用 =====');
  console.log('操作类型:', action, '角色IDs:', ids);

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟批量操作延迟

    return {
      data: {
        success: true,
        message: `批量${action}操作成功，影响${ids.length}个角色`
      }
    };
  } catch (error: any) {
    console.error('Mock角色批量操作失败:', error);
    throw error;
  }
};

/**
 * 更新角色状态 - 使用Mock数据
 * @param roleId 角色ID
 * @param status 新状态 (active/inactive)
 */
export const updateRoleStatus = async (roleId: string, status: 'active' | 'inactive') => {
  try {
    console.log('===== Mock更新角色状态API开始调用 =====');
    console.log(`更新角色 ${roleId} 状态为 ${status === 'active' ? '激活' : '禁用'}`);

    // 使用Mock服务更新角色状态
    const response = await MockService.updateRole(roleId, {
      status: status
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return {
      success: true,
      data: response.data,
      message: `角色状态更新为${status === 'active' ? '激活' : '禁用'}`
    };
  } catch (error) {
    console.error(`Mock更新角色 ${roleId} 状态失败:`, error);
    throw error;
  }
};
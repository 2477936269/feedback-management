/**
 * 职位服务 - Mock实现
 * 提供职位相关的Mock数据和API接口
 */

// 模拟延迟
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟职位数据
const mockPositions = [
  {
    id: 1,
    name: '软件工程师',
    code: 'SE',
    description: '负责软件开发和维护',
    department: '技术部',
    level: 'P3',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '产品经理',
    code: 'PM',
    description: '负责产品规划和管理',
    department: '产品部',
    level: 'P4',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '运营专员',
    code: 'OP',
    description: '负责运营推广工作',
    department: '运营部',
    level: 'P2',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: '技术总监',
    code: 'CTO',
    description: '负责技术团队管理',
    department: '技术部',
    level: 'M2',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * 获取职位列表 - Mock实现
 */
export const getPositions = async (params?: any) => {
  console.log('===== Mock获取职位列表API开始调用 =====');
  console.log('查询参数:', params);

  try {
    await mockDelay();

    let filteredPositions = [...mockPositions];

    // 搜索过滤
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredPositions = filteredPositions.filter(position =>
        position.name.toLowerCase().includes(search) ||
        position.code.toLowerCase().includes(search) ||
        position.description.toLowerCase().includes(search)
      );
    }

    // 部门过滤
    if (params?.department) {
      filteredPositions = filteredPositions.filter(position =>
        position.department === params.department
      );
    }

    const page = params?.current || params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: {
        success: true,
        data: {
          items: filteredPositions.slice(start, end),
          total: filteredPositions.length,
          current: page,
          pageSize: pageSize
        }
      }
    };
  } catch (error: any) {
    console.error('Mock获取职位列表失败:', error);
    throw error;
  }
};

/**
 * 获取职位详情 - Mock实现
 * @param id 职位ID
 */
export const getPositionById = async (id: string) => {
  console.log('===== Mock获取职位详情API开始调用 =====');
  console.log('职位ID:', id);

  try {
    await mockDelay();

    const position = mockPositions.find(p => p.id === parseInt(id));
    if (!position) {
      throw new Error('职位不存在');
    }

    return {
      data: {
        success: true,
        data: position
      }
    };
  } catch (error: any) {
    console.error('Mock获取职位详情失败:', error);
    throw error;
  }
};

/**
 * 创建职位 - Mock实现
 * @param data 职位数据
 */
export const createPosition = async (data: any) => {
  console.log('===== Mock创建职位API开始调用 =====');
  console.log('创建职位数据:', data);

  try {
    await mockDelay();

    const newPosition = {
      id: Math.max(...mockPositions.map(p => p.id)) + 1,
      name: data.name || '',
      code: data.code || '',
      description: data.description || '',
      department: data.department || '',
      level: data.level || '',
      createdAt: new Date().toISOString(),
      ...data
    };

    mockPositions.push(newPosition);

    return {
      data: {
        success: true,
        data: newPosition,
        message: '职位创建成功'
      }
    };
  } catch (error: any) {
    console.error('Mock创建职位失败:', error);
    throw error;
  }
};

/**
 * 更新职位 - Mock实现
 * @param id 职位ID
 * @param data 更新数据
 */
export const updatePosition = async (id: string, data: any) => {
  console.log('===== Mock更新职位API开始调用 =====');
  console.log('职位ID:', id, '更新数据:', data);

  try {
    await mockDelay();

    const positionIndex = mockPositions.findIndex(p => p.id === parseInt(id));
    if (positionIndex === -1) {
      throw new Error('职位不存在');
    }

    mockPositions[positionIndex] = { ...mockPositions[positionIndex], ...data };

    return {
      data: {
        success: true,
        data: mockPositions[positionIndex],
        message: '职位更新成功'
      }
    };
  } catch (error: any) {
    console.error('Mock更新职位失败:', error);
    throw error;
  }
};

/**
 * 删除职位 - Mock实现
 * @param id 职位ID
 */
export const deletePosition = async (id: string) => {
  console.log('===== Mock删除职位API开始调用 =====');
  console.log('职位ID:', id);

  try {
    await mockDelay();

    const positionIndex = mockPositions.findIndex(p => p.id === parseInt(id));
    if (positionIndex === -1) {
      throw new Error('职位不存在');
    }

    mockPositions.splice(positionIndex, 1);

    return {
      data: {
        success: true,
        message: '职位删除成功'
      }
    };
  } catch (error: any) {
    console.error('Mock删除职位失败:', error);
    throw error;
  }
};

/**
 * 获取部门列表 - Mock实现
 */
export const getDepartments = async () => {
  console.log('===== Mock获取部门列表API开始调用 =====');

  try {
    await mockDelay(200);

    const departments = [...new Set(mockPositions.map(p => p.department))];

    return {
      data: {
        success: true,
        data: departments.map(dept => ({ name: dept, value: dept }))
      }
    };
  } catch (error: any) {
    console.error('Mock获取部门列表失败:', error);
    throw error;
  }
};

/**
 * 获取职级列表 - Mock实现
 */
export const getLevels = async () => {
  console.log('===== Mock获取职级列表API开始调用 =====');

  try {
    await mockDelay(200);

    const levels = ['P1', 'P2', 'P3', 'P4', 'P5', 'M1', 'M2', 'M3'];

    return {
      data: {
        success: true,
        data: levels.map(level => ({ name: level, value: level }))
      }
    };
  } catch (error: any) {
    console.error('Mock获取职级列表失败:', error);
    throw error;
  }
};
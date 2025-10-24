/**
 * Mock数据服务
 * 提供所有前端需要的模拟数据和API接口
 */

// 模拟延迟
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    name: '系统管理员',
    status: 'active',
    role: 'admin',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z',
    emailVerified: true,
    phoneVerified: true
  },
  {
    id: 2,
    username: 'user001',
    email: 'user001@example.com',
    phone: '13800138001',
    name: '张三',
    status: 'active',
    role: 'user',
    avatar: '',
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-15T09:15:00Z',
    emailVerified: true,
    phoneVerified: false
  },
  {
    id: 3,
    username: 'user002',
    email: 'user002@example.com',
    phone: '13800138002',
    name: '李四',
    status: 'inactive',
    role: 'user',
    avatar: '',
    createdAt: '2024-01-03T00:00:00Z',
    lastLoginAt: '2024-01-10T14:20:00Z',
    emailVerified: false,
    phoneVerified: true
  },
  {
    id: 4,
    username: 'manager001',
    email: 'manager001@example.com',
    phone: '13800138003',
    name: '王五',
    status: 'active',
    role: 'manager',
    avatar: '',
    createdAt: '2024-01-04T00:00:00Z',
    lastLoginAt: '2024-01-15T08:45:00Z',
    emailVerified: true,
    phoneVerified: true
  }
];

// 模拟角色数据
export const mockRoles = [
  {
    id: '1',
    name: 'admin',
    displayName: '系统管理员',
    description: '拥有系统所有权限',
    permissions: ['user:create', 'user:read', 'user:update', 'user:delete', 'role:create', 'role:read', 'role:update', 'role:delete'],
    userCount: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'manager',
    displayName: '管理员',
    description: '拥有用户管理权限',
    permissions: ['user:read', 'user:update', 'role:read'],
    userCount: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'user',
    displayName: '普通用户',
    description: '基础用户权限',
    permissions: ['user:read'],
    userCount: 2,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 模拟权限数据
export const mockPermissions = [
  {
    id: 1,
    name: 'user:create',
    displayName: '创建用户',
    description: '允许创建新用户',
    module: 'user',
    action: 'create',
    code: 'user:create'
  },
  {
    id: 2,
    name: 'user:read',
    displayName: '查看用户',
    description: '允许查看用户信息',
    module: 'user',
    action: 'read',
    code: 'user:read'
  },
  {
    id: 3,
    name: 'user:update',
    displayName: '更新用户',
    description: '允许更新用户信息',
    module: 'user',
    action: 'update',
    code: 'user:update'
  },
  {
    id: 4,
    name: 'user:delete',
    displayName: '删除用户',
    description: '允许删除用户',
    module: 'user',
    action: 'delete',
    code: 'user:delete'
  },
  {
    id: 5,
    name: 'role:create',
    displayName: '创建角色',
    description: '允许创建新角色',
    module: 'role',
    action: 'create',
    code: 'role:create'
  },
  {
    id: 6,
    name: 'role:read',
    displayName: '查看角色',
    description: '允许查看角色信息',
    module: 'role',
    action: 'read',
    code: 'role:read'
  },
  {
    id: 7,
    name: 'role:update',
    displayName: '更新角色',
    description: '允许更新角色信息',
    module: 'role',
    action: 'update',
    code: 'role:update'
  },
  {
    id: 8,
    name: 'role:delete',
    displayName: '删除角色',
    description: '允许删除角色',
    module: 'role',
    action: 'delete',
    code: 'role:delete'
  }
];

// 模拟用户组数据
export const mockUserGroups = [
  {
    id: 1,
    name: '技术部',
    description: '技术开发团队',
    memberCount: 5,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '产品部',
    description: '产品设计团队',
    memberCount: 3,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '运营部',
    description: '运营推广团队',
    memberCount: 4,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock API响应格式
interface MockResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  message: string;
  code: number;
}

// 创建成功响应
const createSuccessResponse = <T>(data: T, message: string = '操作成功'): MockResponse<T> => ({
  success: true,
  data,
  message,
  code: 200
});

// 创建分页响应
const createPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10,
  message: string = '获取成功'
): PaginatedResponse<T> => ({
  success: true,
  data: {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize
  },
  message,
  code: 200
});

// 创建错误响应
const createErrorResponse = (message: string, code: number = 400): MockResponse<null> => ({
  success: false,
  data: null,
  message,
  code
});

// Mock服务类
export class MockService {
  // 用户相关API
  static async getUsers(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
    await mockDelay();

    let filteredUsers = [...mockUsers];

    // 搜索过滤
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    // 状态过滤
    if (params?.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status);
    }

    return createPaginatedResponse(
      filteredUsers,
      params?.page || 1,
      params?.pageSize || 10,
      '获取用户列表成功'
    );
  }

  static async getUserById(id: number) {
    await mockDelay();
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return createErrorResponse('用户不存在', 404);
    }
    return createSuccessResponse(user, '获取用户信息成功');
  }

  static async createUser(userData: Partial<typeof mockUsers[0]>) {
    await mockDelay();
    const newUser = {
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      username: userData.username || '',
      email: userData.email || '',
      phone: userData.phone || '',
      name: userData.name || '',
      status: userData.status || 'active',
      role: userData.role || 'user',
      avatar: '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: false,
      phoneVerified: false,
      ...userData
    };
    mockUsers.push(newUser);
    return createSuccessResponse(newUser, '创建用户成功');
  }

  static async updateUser(id: number, userData: Partial<typeof mockUsers[0]>) {
    await mockDelay();
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return createErrorResponse('用户不存在', 404);
    }
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return createSuccessResponse(mockUsers[userIndex], '更新用户成功');
  }

  static async deleteUser(id: number) {
    await mockDelay();
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return createErrorResponse('用户不存在', 404);
    }
    mockUsers.splice(userIndex, 1);
    return createSuccessResponse(null, '删除用户成功');
  }

  // 角色相关API
  static async getRoles(params?: { page?: number; pageSize?: number }) {
    await mockDelay();
    return createPaginatedResponse(
      mockRoles,
      params?.page || 1,
      params?.pageSize || 10,
      '获取角色列表成功'
    );
  }

  static async getRoleById(id: string | number) {
    await mockDelay();
    const role = mockRoles.find(r => r.id === String(id));
    if (!role) {
      return createErrorResponse('角色不存在', 404);
    }
    return createSuccessResponse(role, '获取角色信息成功');
  }

  static async createRole(roleData: Partial<typeof mockRoles[0]>) {
    await mockDelay();
    const newRole = {
      id: String(Math.max(...mockRoles.map(r => parseInt(r.id))) + 1),
      name: roleData.name || '',
      displayName: roleData.displayName || '',
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      userCount: 0,
      createdAt: new Date().toISOString(),
      ...roleData
    };
    mockRoles.push(newRole);
    return createSuccessResponse(newRole, '创建角色成功');
  }

  static async updateRole(id: string, roleData: any) {
    await mockDelay();
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      return createErrorResponse('角色不存在', 404);
    }

    // 处理状态字段
    if (roleData.status) {
      // 将status转换为其他字段或直接使用
      roleData.isActive = roleData.status === 'active';
    }

    mockRoles[roleIndex] = { ...mockRoles[roleIndex], ...roleData };
    return createSuccessResponse(mockRoles[roleIndex], '更新角色成功');
  }

  static async deleteRole(id: string) {
    await mockDelay();
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      return createErrorResponse('角色不存在', 404);
    }
    mockRoles.splice(roleIndex, 1);
    return createSuccessResponse(null, '删除角色成功');
  }

  // 权限相关API
  static async getPermissions() {
    await mockDelay();
    return createSuccessResponse(mockPermissions, '获取权限列表成功');
  }

  // 用户组相关API
  static async getUserGroups(params?: { page?: number; pageSize?: number }) {
    await mockDelay();
    return createPaginatedResponse(
      mockUserGroups,
      params?.page || 1,
      params?.pageSize || 10,
      '获取用户组列表成功'
    );
  }

  static async getUserGroupById(id: number) {
    await mockDelay();
    const group = mockUserGroups.find(g => g.id === id);
    if (!group) {
      return createErrorResponse('用户组不存在', 404);
    }
    return createSuccessResponse(group, '获取用户组信息成功');
  }

  static async createUserGroup(groupData: Partial<typeof mockUserGroups[0]>) {
    await mockDelay();
    const newGroup = {
      id: Math.max(...mockUserGroups.map(g => g.id)) + 1,
      name: groupData.name || '',
      description: groupData.description || '',
      memberCount: 0,
      createdAt: new Date().toISOString(),
      ...groupData
    };
    mockUserGroups.push(newGroup);
    return createSuccessResponse(newGroup, '创建用户组成功');
  }

  static async updateUserGroup(id: number, groupData: Partial<typeof mockUserGroups[0]>) {
    await mockDelay();
    const groupIndex = mockUserGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return createErrorResponse('用户组不存在', 404);
    }
    mockUserGroups[groupIndex] = { ...mockUserGroups[groupIndex], ...groupData };
    return createSuccessResponse(mockUserGroups[groupIndex], '更新用户组成功');
  }

  static async deleteUserGroup(id: number) {
    await mockDelay();
    const groupIndex = mockUserGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return createErrorResponse('用户组不存在', 404);
    }
    mockUserGroups.splice(groupIndex, 1);
    return createSuccessResponse(null, '删除用户组成功');
  }

  // 认证相关API
  static async login(credentials: { username?: string; email?: string; phone?: string; password: string }) {
    await mockDelay();

    // 模拟登录验证（任何输入都能成功）
    const mockToken = 'mock-jwt-token-' + Date.now();
    const mockUser = mockUsers[0]; // 返回管理员用户信息

    return createSuccessResponse({
      token: mockToken,
      user: mockUser,
      expiresIn: 86400 // 24小时
    }, '登录成功');
  }

  static async getCurrentUser() {
    await mockDelay();
    return createSuccessResponse(mockUsers[0], '获取当前用户信息成功');
  }

  static async logout() {
    await mockDelay();
    return createSuccessResponse(null, '退出登录成功');
  }

  // 仪表盘数据
  static async getDashboardStats() {
    await mockDelay();

    const stats = {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      totalRoles: mockRoles.length,
      totalGroups: mockUserGroups.length,
      recentLogins: mockUsers
        .sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime())
        .slice(0, 5),
      userGrowthData: [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 12 },
        { date: '2024-01-03', count: 15 },
        { date: '2024-01-04', count: 18 },
        { date: '2024-01-05', count: 20 }
      ]
    };

    return createSuccessResponse(stats, '获取仪表盘数据成功');
  }
}

export default MockService;

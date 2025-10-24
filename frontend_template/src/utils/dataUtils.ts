/**
 * 数据访问工具函数
 * 用于统一处理API响应的数据结构
 */

/**
 * 安全地从API响应中提取数组数据
 * @param response API响应对象
 * @returns 提取的数组数据
 */
export const extractArrayData = (response: any): any[] => {
  if (!response) return [];
  
  // 直接是数组
  if (Array.isArray(response)) return response;
  
  // 检查 response.data
  const data = response.data;
  if (!data) return [];
  
  // 检查 data.data
  if (Array.isArray(data.data)) return data.data;
  
  // 检查 data.items
  if (Array.isArray(data.items)) return data.items;
  
  // 直接是数组
  if (Array.isArray(data)) return data;
  
  // 单个对象转数组
  if (typeof data === 'object' && data !== null) {
    // 检查是否有id或name属性，表明是单个对象
    if (data.id || data.name) return [data];
    
    // 尝试从对象中找到可能的数组
    const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
    if (possibleArrays.length > 0) return possibleArrays[0] as any[];
  }
  
  return [];
};

/**
 * 安全地从API响应中提取分页信息
 * @param response API响应对象
 * @param defaultTotal 默认总数
 * @returns 分页信息
 */
export const extractPaginationInfo = (response: any, defaultTotal: number = 0) => {
  if (!response || !response.data) return { total: defaultTotal };
  
  const data = response.data;
  
  // 检查 pagination.total
  if (data.pagination?.total !== undefined) {
    return { total: data.pagination.total };
  }
  
  // 检查 total
  if (data.total !== undefined) {
    return { total: data.total };
  }
  
  // 检查响应级别的 total
  if (response.total !== undefined) {
    return { total: response.total };
  }
  
  return { total: defaultTotal };
};

/**
 * 安全地访问对象属性
 * @param obj 对象
 * @param path 属性路径，如 'data.items'
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export const safeGet = (obj: any, path: string, defaultValue: any = undefined): any => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};

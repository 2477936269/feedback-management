import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getPermissionEnums, EnumOption } from '../service/permissionService';

export const usePermissionEnums = () => {
  const [systemOptions, setSystemOptions] = useState<EnumOption[]>([]);
  const [resourceOptions, setResourceOptions] = useState<EnumOption[]>([]);
  const [actionOptions, setActionOptions] = useState<EnumOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<EnumOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEnums = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPermissionEnums();
      
      if (response?.data?.data) {
        const { systems, resources, actions } = response.data.data;
        
        // 处理系统选项 - 使用空字符串而不是null
        const formattedSystems = [
          { key: "all", value: "", label: "全部" }, // 修改为空字符串
          ...(systems || [])
        ];
        setSystemOptions(formattedSystems);
        
        // 处理资源选项
        const formattedResources = [
          { key: "all", value: "", label: "全部" },
          ...(resources || [])
        ];
        setResourceOptions(formattedResources);
        
        // 处理操作选项
        const formattedActions = [
          { key: "all", value: "", label: "全部" },
          ...(actions || [])
        ];
        setActionOptions(formattedActions);
        
        // 设置类型选项 - 修复value类型问题
        setTypeOptions([
          { key: "all", value: "", label: "全部" }, // 修改为空字符串
          { key: "FUNCTION", value: "FUNCTION", label: "功能权限" }, // 值必须与后端一致
          { key: "DATA", value: "DATA", label: "数据权限" },
          { key: "UI", value: "UI", label: "UI权限" },
          { key: "API", value: "API", label: "API权限" },
          { key: "MENU", value: "MENU", label: "菜单权限" }
        ]);
      }
    } catch (error) {
      console.error('获取权限枚举值失败:', error);
      message.error('获取搜索条件选项失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnums();
  }, [fetchEnums]);

  return {
    systemOptions,
    resourceOptions,
    actionOptions,
    typeOptions,
    loading,
    refresh: fetchEnums
  };
};
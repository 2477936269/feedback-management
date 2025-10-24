import React, { useState, useEffect } from 'react';
import { message } from 'antd';

import GenericModalTransfer, { TransferItemData } from '../../components/generic/GenericModalTransfer';     // 导入通用穿梭框组件

import { getPermissions } from '../../service/permissionService';       // 导入获取权限列表的服务函数
import { assignPermissionsToRole } from '../../service/rolePermissionService';      // 导入为角色分配权限的服务函数

// 扩展自 TransferItemData 的权限项
interface PermissionTransferItem extends TransferItemData {
  code?: string;
  type?: string;
  permissionData?: any;
}

interface AssignmentModalProps {      // 定义组件的属性类型
  visible: boolean;     // 是否可见
  onCancel: () => void;  // 取消按钮点击事件  
  onSuccess: () => void;   // 成功按钮点击事件
  roleId?: string;    // 角色ID
  roleName?: string;    // 角色名称
  currentPermissions: PermissionTransferItem[];    // 当前已分配的权限列表
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({    // 定义组件
  visible,
  onCancel,
  onSuccess,
  roleId,
  roleName,
  currentPermissions,
}) => {
  const [targetPermissions, setTargetPermissions] = useState<PermissionTransferItem[]>([]);   // 目标权限列表
  const [allPermissions, setAllPermissions] = useState<PermissionTransferItem[]>([]);   // 所有权限列表
  const [loading, setLoading] = useState(false);      // 加载状态
  const [saveLoading, setSaveLoading] = useState(false);    // 保存状态

  // 初始化数据
  useEffect(() => {
    if (visible && roleId) {    // 如果可见且角色ID存在
      setTargetPermissions(currentPermissions);   // 设置目标权限列表为当前权限列表
      fetchAllPermissions(currentPermissions.map(p => p.id));    // 获取所有权限列表
    }
  }, [visible, roleId, currentPermissions]);    // 依赖项

  // 提取获取所有权限的逻辑为单独函数
  const fetchAllPermissions = async (existingPermissionIds: string[]) => {    // 获取所有权限列表
    try {
      setLoading(true);   // 设置加载状态为true
      const allPermissionsResponse = await getPermissions();    // 获取权限列表
      console.log("所有权限API响应:", allPermissionsResponse);    // 打印API响应

      // 处理所有权限
      const allPermissionData: PermissionTransferItem[] = [];   // 所有权限数据数组

      let allPermissionsArray: any[] = [];  // 所有权限数组

      // 确定从响应中获取数据的正确路径
      if (
        allPermissionsResponse?.data?.data &&     
        Array.isArray(allPermissionsResponse.data.data)     // 如果响应数据存在 并且是数组
      ) {
        allPermissionsArray = allPermissionsResponse.data.data;      // 设置所有权限数组为响应数据的data字段
      } else if (Array.isArray(allPermissionsResponse?.data)) {      // 如果响应数据存在 并且是数组
        allPermissionsArray = allPermissionsResponse.data;          // 设置所有权限数组为响应数据
      } else if (
        allPermissionsResponse?.data &&      // 如果响应数据存在
        typeof allPermissionsResponse.data === "object"     // 并且是对象
      ) {
        allPermissionsArray = [allPermissionsResponse.data];      // 设置所有权限数组为响应数据的数组形式
      } else if (Array.isArray(allPermissionsResponse)) {       // 如果响应数据是数组
        allPermissionsArray = allPermissionsResponse;       // 设置所有权限数组为响应数据 
      }

      // 过滤并处理权限数据
      allPermissionsArray
        .filter((permission: any) => {
          const permissionId = permission.id || permission._id;     // 获取权限ID
          return permissionId && !existingPermissionIds.includes(permissionId);     // 返回权限ID存在 并且 不在已存在的权限ID中的权限
        })
        .forEach((permission: any) => {
          const permissionId = permission.id || permission._id;
          if (permissionId) {
            allPermissionData.push({
              id: permissionId,
              key: permissionId,
              title: permission.name || `权限(${permissionId})`,
              description: permission.description || permission.code || "",
              code: permission.code || "",
              type: permission.type || "FUNCTION",
              permissionData: {
                ...permission,
                id: permissionId,
                name: permission.name || "未命名",
                code: permission.code || "",
                type: permission.type || "FUNCTION",
              },
            });
          }
        });

      console.log("处理后的可选权限数据:", allPermissionData);
      setAllPermissions(allPermissionData);
    } catch (error) {
      console.error("获取权限列表失败:", error);
      message.error("获取权限列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理权限变更
  const handlePermissionChange = (targetData: PermissionTransferItem[]) => {
    console.log('转移后的角色权限数据:', targetData);
    setTargetPermissions(targetData);
  };

  // 保存权限分配
  // 保存权限分配
  const handleSavePermissions = async (targetData: PermissionTransferItem[]) => {
    if (!roleId) {
      message.warning("请先选择角色");
      return;
    }
  
    try {
      setSaveLoading(true);
  
      // 提取权限ID
      const permissionIds = targetData.map((p) => p.id);
  
      // 获取当前用户ID
      let userId = null;
      try {
        // 尝试从localStorage获取
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData.id || userData.userId;
        }
        
        // 如果localStorage没有，尝试从sessionStorage获取
        if (!userId) {
          const sessionUserStr = sessionStorage.getItem('currentUser');
          if (sessionUserStr) {
            const userData = JSON.parse(sessionUserStr);
            userId = userData.id || userData.userId;
          }
        }
      } catch (e) {
        console.warn('获取用户ID失败:', e);
      }
  
      console.log(`为角色 ${roleId} 分配权限，用户ID: ${userId || '未知'}，权限数: ${permissionIds.length}`);
      
      // 为角色分配权限
      await assignPermissionsToRole(roleId, permissionIds);
  
      message.success(`已成功为角色 ${roleName || roleId} 分配权限`);
      onSuccess();
    } catch (error) {
      console.error("保存权限分配失败:", error);
      message.error("保存权限分配失败");
    } finally {
      setSaveLoading(false);
    }
  };

  
  return (
    <GenericModalTransfer
      visible={visible}
      title={roleName ? `分配权限: ${roleName}` : '分配权限'}
      onCancel={onCancel}
      width={900}
      okText="保存"
      cancelText="取消"
      sourceTitle="可用权限"
      targetTitle="已分配权限"
      sourceData={allPermissions}
      targetData={targetPermissions}
      loading={loading}
      saveLoading={saveLoading}
      onChange={handlePermissionChange}
      onSave={handleSavePermissions}
      disabled={!roleId}
      height={500}
      showSearch
    />
  );
};

export default AssignmentModal;
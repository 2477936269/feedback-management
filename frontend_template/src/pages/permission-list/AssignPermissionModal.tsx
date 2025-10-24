/**
 * 权限分配模态框
 * 用于为角色分配权限
 */
import React, { useState, useEffect } from "react";
import { Modal, Tree, message, Input, Spin } from "antd";
import { getPermissions, Permission } from "../../service/permissionService";
import {
  assignPermissionsToRole,
  getRolePermissions,
} from "../../service/rolePermissionService";

const { Search } = Input;

interface AssignPermissionModalProps {
  visible: boolean;
  roleId: string;
  roleName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignPermissionModal: React.FC<AssignPermissionModalProps> = ({
  visible,
  roleId,
  roleName,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<string[]>(
    []
  );
  const [searchText, setSearchText] = useState("");
  const [treeData, setTreeData] = useState<any[]>([]);

  // 加载权限数据
  useEffect(() => {
    if (visible && roleId) {
      setLoading(true);

      Promise.all([getPermissions(), getRolePermissions(roleId)])
        .then(([allPermsRes, rolePermsRes]) => {
          // 处理权限数据
          const allPermissions =
            allPermsRes.data?.data || allPermsRes.data || [];
          const rolePerms = rolePermsRes.data?.data || rolePermsRes.data || [];

          setPermissions(allPermissions);
          setRolePermissions(rolePerms);
          setAssignedPermissionIds(rolePerms.map((p: any) => p.id));

          // 生成树形结构
          generateTreeData(allPermissions);
        })
        .catch((err) => {
          console.error("加载权限数据失败", err);
          message.error("加载权限数据失败");
        })
        .finally(() => setLoading(false));
    }
  }, [visible, roleId]);

  // 根据权限数据生成树结构
  const generateTreeData = (permsList: any[]) => {
    // 根据模块分组权限
    const groupedPermissions = permsList.reduce((acc, perm) => {
      // 从权限代码中提取模块
      const module = perm.code.split(":")[0] || "其他";

      if (!acc[module]) {
        acc[module] = [];
      }

      acc[module].push(perm);
      return acc;
    }, {});

    // 转换为树结构
    const tree = (
      Object.entries(groupedPermissions) as [string, Permission[]][]
    ).map(([module, perms]) => ({
      title: module.toUpperCase(),
      key: `module-${module}`,
      selectable: false,
      children: perms.map((perm: Permission) => ({
        title: `${perm.name} (${perm.code})`,
        key: perm.id,
        isLeaf: true,
      })),
    }));

    setTreeData(tree);
  };

  // 提交分配
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await assignPermissionsToRole(roleId, assignedPermissionIds);
      message.success(`已成功为角色 ${roleName} 分配权限`);
      onSuccess();
    } catch (error) {
      console.error("分配权限失败", error);
      message.error("分配权限失败");
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (permissions.length > 0) {
      if (!searchText) {
        // 恢复原始树形结构
        generateTreeData(permissions);
        return;
      }

      // 过滤权限
      const filteredPerms = permissions.filter(
        (perm) =>
          perm.name.toLowerCase().includes(searchText.toLowerCase()) ||
          perm.code.toLowerCase().includes(searchText.toLowerCase())
      );

      // 重新生成树
      generateTreeData(filteredPerms);
    }
  }, [searchText, permissions]);

  return (
    <Modal
      title={`为角色 ${roleName} 分配权限`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      confirmLoading={loading}
    >
      <Search
        placeholder="搜索权限名称或代码"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
        allowClear
      />

      <Spin spinning={loading}>
        {treeData.length > 0 ? (
          <Tree
            checkable
            checkStrictly
            treeData={treeData}
            checkedKeys={assignedPermissionIds}
            onCheck={(checkedKeys: any) => {
              setAssignedPermissionIds(checkedKeys.checked);
            }}
            height={400}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            没有可用的权限数据
          </div>
        )}
      </Spin>

      <div style={{ marginTop: 16 }}>
        已选择 {assignedPermissionIds.length} 项权限，共 {permissions.length}{" "}
        项可用权限
      </div>
    </Modal>
  );
};

export default AssignPermissionModal;

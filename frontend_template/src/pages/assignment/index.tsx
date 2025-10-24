import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  message,
  Button,
  Typography,
  Space,
  Avatar,
  Tag,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import GenericPanelList, {
  ListItemData,
} from "../../components/generic/GenericPanelList";
import GenericPanelTable, {
  TableButtonConfig,
} from "../../components/generic/GenericPanelTable";
import AssignmentModal from "./AssignmentModal";
import { useSearchParams, useLocation } from "react-router-dom";
import { getRoles } from "../../service/roleService";
import { getPermissions } from "../../service/permissionService";
import {
  getRolePermissions,
  assignPermissionsToRole,
  removePermissionFromRole,
} from "../../service/rolePermissionService";
const { Title, Text } = Typography;

// 角色节点类型
interface RoleNode {
  id: string;
  name: string;
  key?: string;
  title?: string;
  code?: string;
  parentId?: string;
  [key: string]: any;
}

// 在文件顶部添加以下类型定义
interface PermissionTransferItem {
  id: string;
  key: string;
  title: string;
  description: string;
  code?: string;
  type?: string;
  permissionData?: any;
}

// 权限类型保持不变
interface Permission {
  id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  parentId?: string | null;
  _id?: string;
}

const RolePermissionManagement: React.FC = () => {
  // 获取URL参数
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const roleIdFromUrl = searchParams.get("roleId");

  const [rolePermissions, setRolePermissions] = useState<
    PermissionTransferItem[]
  >([]);
  const [allPermissions, setAllPermissions] = useState<
    PermissionTransferItem[]
  >([]);

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 状态定义 - 使用适合ListPanel的数据结构
  const [roleList, setRoleList] = useState<ListItemData[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleNode | null>(null);
  const [transferModalVisible, setTransferModalVisible] =
    useState<boolean>(false);

  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [permissionTableLoading, setPermissionTableLoading] =
    useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [componentHeight, setComponentHeight] = useState<number>(600);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // 在组件初始化时打印参数信息
  useEffect(() => {
    console.log("🔍 接收到的 URL 参数:", roleIdFromUrl);
  }, [roleIdFromUrl, location]);

  // 修改获取角色列表数据的函数
  const fetchRoleList = async () => {
    try {
      setListLoading(true);
      const response = await getRoles({ tree: false, _source: "assignment" });

      // 提取角色数据
      let roleData: any[] = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        roleData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        roleData = response.data;
      } else if (response?.data && typeof response.data === "object") {
        roleData = [response.data];
      } else if (Array.isArray(response)) {
        roleData = response;
      }

      console.log("原始角色数据:", roleData); // 添加日志查看数据格式

      // 将角色数据转换为ListItemData格式
      const listData: ListItemData[] = roleData.map((role) => {
        const id = role.id || role._id;

        // 尝试获取权限数量的不同可能性
        let permissionCount = 0;
        if (Array.isArray(role.permissions)) {
          permissionCount = role.permissions.length;
        } else if (role.permissionCount !== undefined) {
          permissionCount = role.permissionCount;
        } else if (typeof role.permissions === "number") {
          permissionCount = role.permissions;
        }

        return {
          id,
          leftContent: role.name || "未命名角色",
          // 如果没有权限，显示空字符串，否则显示权限数量
          rightContent: permissionCount > 0 ? permissionCount.toString() : "",
          roleData: {
            id,
            name: role.name || "未命名",
            code: role.code || "",
            parentId: role.parentId,
          },
        };
      });

      setRoleList(listData);

      // 如果URL中有角色ID，自动选择该角色
      if (roleIdFromUrl) {
        const targetRole = listData.find((item) => item.id === roleIdFromUrl);
        if (targetRole) {
          handleSelectRole(targetRole);
        }
      }
    } catch (error) {
      console.error("获取角色列表失败:", error);
      message.error("获取角色列表失败");
      setRoleList([]);
    } finally {
      setListLoading(false);
    }
  };
  // 修改获取角色权限的函数
  // 增强获取角色权限的函数，添加完整的数据处理逻辑
  // 修改获取角色权限的函数
  const fetchRolePermissionsAndAll = async (roleId: string) => {
    if (!roleId) {
      console.error("角色ID为空，无法获取权限");
      return;
    }

    try {
      setPermissionTableLoading(true);

      // 获取当前用户ID（如果需要）
      let userId = null;
      try {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData.id || userData.userId;
        }
      } catch (e) {
        console.warn("获取用户ID失败:", e);
      }

      const permissionsResponse = await getRolePermissions(roleId);
      console.log("角色权限API响应:", permissionsResponse);

      // 处理角色权限数据
      let permissions: any[] = [];
      // 添加这一行初始化 permissionData 数组
      const permissionData: PermissionTransferItem[] = [];

      // 确定从响应中获取数据的正确路径
      if (
        permissionsResponse?.data?.data &&
        Array.isArray(permissionsResponse.data.data)
      ) {
        permissions = permissionsResponse.data.data;
      } else if (Array.isArray(permissionsResponse?.data)) {
        permissions = permissionsResponse.data;
      } else if (
        permissionsResponse?.data &&
        typeof permissionsResponse.data === "object" &&
        "permissions" in permissionsResponse.data
      ) {
        // 安全地访问permissions，如果它存在于data对象中
        permissions = (permissionsResponse.data as any).permissions;
      } else if (Array.isArray(permissionsResponse)) {
        permissions = permissionsResponse;
      }

      console.log("提取的权限数组:", permissions);

      // 处理每个权限数据
      permissions.forEach((item: any) => {
        if (!item) return; // 跳过空项

        // 尝试不同的方式获取权限对象
        const permission = item.permission || item;

        if (permission) {
          const permissionId = permission.id || permission._id;
          if (permissionId) {
            permissionData.push({
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
        }
      });

      console.log("处理后的角色权限数据:", permissionData);
      // 更新这里：使用permissionData而不是permissions
      setRolePermissions(permissionData);

      // 更新角色列表中对应角色的权限数量
      if (roleList.length > 0) {
        try {
          const updatedRoleList = roleList.map((role) => {
            if (role.id === roleId) {
              return {
                ...role,
                rightContent:
                  permissionData.length > 0
                    ? permissionData.length.toString()
                    : "",
              };
            }
            return role;
          });
          setRoleList(updatedRoleList);
        } catch (err) {
          console.error("更新角色列表权限数量时出错:", err);
        }
      }
    } catch (error) {
      // ...错误处理代码保持不变...
    } finally {
      setPermissionTableLoading(false);
    }
  };

  // 优化打开转移模态框的函数
  // 优化打开转移模态框的函数
  const handleOpenTransferModal = () => {
    if (!selectedRole) {
      message.warning("请先选择角色");
      return;
    }
    setTransferModalVisible(true);
  };

  // 处理模态框关闭
  const handleCloseTransferModal = () => {
    setTransferModalVisible(false);
  };

  // 处理权限分配成功
  const handleAssignmentSuccess = () => {
    setTransferModalVisible(false);
    // 刷新角色权限
    if (selectedRole) {
      fetchRolePermissionsAndAll(selectedRole.id);
    }
  };

  // 提取获取所有权限的逻辑为单独函数
  const fetchAllPermissions = async (existingPermissionIds: string[]) => {
    try {
      setTransferLoading(true);
      const allPermissionsResponse = await getPermissions();
      console.log("所有权限API响应:", allPermissionsResponse);

      // 处理所有权限
      const allPermissionData: PermissionTransferItem[] = [];

      let allPermissionsArray: any[] = [];

      // 确定从响应中获取数据的正确路径
      if (
        allPermissionsResponse?.data?.data &&
        Array.isArray(allPermissionsResponse.data.data)
      ) {
        allPermissionsArray = allPermissionsResponse.data.data;
      } else if (Array.isArray(allPermissionsResponse?.data)) {
        allPermissionsArray = allPermissionsResponse.data;
      } else if (
        allPermissionsResponse?.data &&
        typeof allPermissionsResponse.data === "object"
      ) {
        allPermissionsArray = [allPermissionsResponse.data];
      } else if (Array.isArray(allPermissionsResponse)) {
        allPermissionsArray = allPermissionsResponse;
      }

      // 过滤并处理权限数据
      allPermissionsArray
        .filter((permission: Permission) => {
          const permissionId = permission.id || permission._id;
          return permissionId && !existingPermissionIds.includes(permissionId);
        })
        .forEach((permission: Permission) => {
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
      setTransferLoading(false);
    }
  };

  const handleSelectRole = (item: ListItemData) => {
    if (!item || !item.id) {
      console.error("选择的角色数据无效");
      return;
    }

    try {
      const roleData = item.roleData;
      if (!roleData || !roleData.id) {
        console.error("选择的角色数据不完整:", item);
        return;
      }

      console.log("选择角色:", roleData);

      setSelectedRole({
        id: item.id,
        name: roleData.name || "未命名",
        code: roleData.code || "",
        parentId: roleData.parentId,
      });

      // 获取角色权限
      fetchRolePermissionsAndAll(item.id);
    } catch (error) {
      console.error("选择角色时出错:", error);
      message.error("选择角色失败");
    }
  };

  // 移除角色权限 - 添加用户ID参数
  // 移除角色权限 - 使用DELETE方法
  const handleRemovePermission = async (permissionId: string) => {
    if (!selectedRole) {
      message.warning("请先选择角色");
      return;
    }

    try {
      // 获取当前用户ID
      let userId = null;
      try {
        // 尝试从localStorage获取
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData.id || userData.userId;
        }

        // 如果localStorage没有，尝试从sessionStorage获取
        if (!userId) {
          const sessionUserStr = sessionStorage.getItem("currentUser");
          if (sessionUserStr) {
            const userData = JSON.parse(sessionUserStr);
            userId = userData.id || userData.userId;
          }
        }
      } catch (e) {
        console.warn("获取用户ID失败:", e);
      }

      console.log(
        `移除权限 ${permissionId}，角色 ${selectedRole.id}，用户ID ${
          userId || "未知"
        }`
      );

      // 使用新的DELETE方法移除权限
      await removePermissionFromRole(selectedRole.id, permissionId);

      message.success("权限已从角色中移除");

      // 刷新角色权限列表
      fetchRolePermissionsAndAll(selectedRole.id);
    } catch (error) {
      console.error("移除角色权限失败:", error);
      message.error("移除角色权限失败");
    }
  };

  // 计算组件高度
  useEffect(() => {
    const timer = setTimeout(() => {
      const calculateAvailableHeight = () => {
        const totalHeight = window.innerHeight;
        const headerHeight = 64 + 24;
        const footerHeight = 48 + 24;
        const topElementsHeight = 48;
        const gapHeight = 16;

        const availableHeight =
          totalHeight -
          headerHeight -
          footerHeight -
          topElementsHeight -
          gapHeight;
        const safeHeight = Math.floor(availableHeight * 0.95);

        return safeHeight;
      };

      const newHeight = calculateAvailableHeight();
      setComponentHeight(newHeight);
    }, 300);

    const handleResize = () => {
      const newHeight = window.innerHeight - 200;
      setComponentHeight(newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 初始化
  useEffect(() => {
    fetchRoleList();
  }, []);

  // 权限表格列定义
  const permissionColumns = [
    {
      title: "权限信息",
      dataIndex: "permissionData",
      key: "permissionData",
      width: 250,
      render: (permissionData: any) => {
        if (!permissionData) return <Text type="secondary">无权限数据</Text>;

        return (
          <Space>
            <Avatar
              icon={<LockOutlined />}
              style={{ backgroundColor: "#1890ff" }}
              size="small"
            />
            <Space direction="vertical" size={0}>
              <Text strong>{permissionData.name || "未命名"}</Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {permissionData.code || "无代码"}
              </Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "权限类型",
      dataIndex: "permissionData",
      key: "type",
      width: 120,
      render: (permissionData: any) => {
        if (!permissionData) return <Tag>未知</Tag>;

        const type = permissionData.type || "FUNCTION";

        return (
          <Tag color={type === "MENU" ? "green" : "blue"}>
            {type === "MENU" ? "菜单" : "功能"}
          </Tag>
        );
      },
    },
    {
      title: "说明",
      dataIndex: "permissionData",
      key: "description",
      render: (permissionData: any) => {
        if (!permissionData) return <Text type="secondary">-</Text>;

        return <Text>{permissionData.description || "-"}</Text>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: PermissionTransferItem) => (
        <Popconfirm
          title="确定从该角色移除此权限吗?"
          onConfirm={() => handleRemovePermission(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 表格按钮配置
  const tableButtons: TableButtonConfig[] = [
    {
      key: "refresh",
      icon: <ReloadOutlined />,
      onClick: () =>
        selectedRole && fetchRolePermissionsAndAll(selectedRole.id),
      text: "刷新",
      disabled: !selectedRole,
    },
    {
      key: "add",
      type: "primary",
      ghost: true,
      icon: <PlusOutlined />,
      onClick: handleOpenTransferModal,
      text: "添加权限",
      disabled: !selectedRole,
    },
  ];

  // 自定义样式
  const customStyles = `
  .role-permission-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 152px); /* 减去头部和尾部的高度 */
  }
  
  .role-permission-row {
    flex: 1;
    height: 100%;
  }
  
  .role-permission-col {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .role-permission-col .ant-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .role-permission-col .ant-card .ant-card-body {
    flex: 1;
    overflow: hidden !important; /* 改为hidden，防止整体滚动 */
    padding: 12px 24px 12px 24px !important; /* 增加四周边距 */
    display: flex;
    flex-direction: column;
  }
  
  /* 确保表格的父容器也撑满高度 */
  .ant-table-wrapper {
    height: 100%;
  }
  
  /* 调整表格的滚动容器 */
  .ant-table-body {
    height: calc(100% - 112px) !important; /* 减去表头和分页高度 */
    max-height: none !important;
  }
`;

  // 仅在选择了角色时显示权限表格标题
  const tableTitle = selectedRole
    ? `"${selectedRole.name}" 角色权限列表 (${rolePermissions.length}项)`
    : "角色权限列表";

  return (
    <>
      <style>{customStyles}</style>
      <div className="role-permission-page">
        <Row gutter={[16, 16]} className="role-permission-row">
          <Col
            xs={24}
            sm={24}
            md={8}
            lg={6}
            xl={5}
            className="role-permission-col"
          >
            <GenericPanelList
              title="角色列表"
              listData={roleList}
              loading={listLoading}
              onSelect={handleSelectRole}
              onRefresh={fetchRoleList}
              selectedId={selectedRole?.id}
              height="100%"
              showSearch={true}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={16}
            lg={18}
            xl={19}
            className="role-permission-col"
          >
            <GenericPanelTable
              title={tableTitle}
              buttons={tableButtons}
              loading={permissionTableLoading}
              refreshData={
                selectedRole
                  ? () => fetchRolePermissionsAndAll(selectedRole.id)
                  : undefined
              }
              tableProps={{
                rowKey: "id",
                columns: permissionColumns,
                dataSource: rolePermissions.map((permission) => ({
                  ...permission,
                  key: permission.id,
                })),
                pagination: {
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                },
                locale: {
                  emptyText: selectedRole
                    ? '该角色暂无权限，点击"添加权限"按钮添加'
                    : "请先选择左侧的角色",
                },
                // 使用百分比代替固定高度
                scroll: { y: "calc(100vh - 304px)" },
              }}
              // 使用 cardProps 设置满高度
              cardProps={{
                style: { height: "100%" },
                styles: {
                  body: {
                    height: "calc(100% - 56px)",
                    overflow: "auto",
                    padding: "12px 24px 12px 24px",
                  },
                },
              }}
              showColumnSetting={false}
            />
          </Col>
        </Row>
      </div>

      {/* 转移权限弹窗 */}
      <AssignmentModal
        visible={transferModalVisible}
        onCancel={handleCloseTransferModal}
        onSuccess={handleAssignmentSuccess}
        roleId={selectedRole?.id}
        roleName={selectedRole?.name}
        currentPermissions={rolePermissions}
      />
    </>
  );
};

export default RolePermissionManagement;

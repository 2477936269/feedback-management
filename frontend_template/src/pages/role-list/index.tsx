import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Space,
  message,
  Tag,
  Tooltip,
  Modal, // 添加 Modal 导入
  App,
} from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import RoleFormModal from "./RoleFormModal";
import AssignPermissionModal from "../permission-list/AssignPermissionModal";
import GenericPanelSearch, {
  SearchItemConfig,
} from "../../components/generic/GenericPanelSearch";
import GenericPanelTable, {
  TableButtonConfig,
} from "../../components/generic/GenericPanelTable";
import {
  getRoles,
  deleteRole,
  updateRole,
  updateRoleStatus,
} from "../../service/roleService";

// 角色接口定义
interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions?: any[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  _id?: string;
}

const RoleList: React.FC = () => {
  const { modal } = App.useApp();
  // 状态定义
  const [formVisible, setFormVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState<any>({});
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Role[]>([]);

  // 加载角色数据
  // 修改 fetchData 函数中的数据处理部分
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // 准备发送给后端的参数
      const apiParams = { ...searchParams };

      // 特殊处理：如果status参数是空字符串，则移除它
      if (apiParams.status === "") {
        delete apiParams.status;
      }

      console.log("发送查询，处理后的API参数:", apiParams);

      // 传递处理后的参数给API
      const response = await getRoles(apiParams);

      // 详细记录API响应结构
      console.log("API返回的整个响应对象:", response);
      console.log("response类型:", typeof response);
      console.log("response.data类型:", typeof response?.data);

      // 更健壮的数据提取
      let roles = [];

      try {
        // 使用 try-catch 包装数据处理逻辑，防止任何意外错误
        // 简化数据访问逻辑，使用类型断言
        const responseData = (response as any)?.data;
        if (Array.isArray(responseData?.data)) {
          roles = responseData.data;
          console.log("从 response.data.data 中提取了角色数组");
        } else if (Array.isArray(responseData?.items)) {
          roles = responseData.items;
          console.log("从 response.data.items 中提取了角色数组");
        } else if (Array.isArray(responseData)) {
          roles = responseData;
          console.log("从 response.data 中提取了角色数组");
        } else if (responseData && typeof responseData === "object") {
          // 检查是否是单个角色对象
          if (responseData.id || responseData.name) {
            roles = [responseData];
            console.log("从单个角色对象创建了角色数组");
          }
        } else if (Array.isArray(response)) {
          roles = response;
          console.log("直接使用响应作为角色数组");
        } else {
          console.warn("无法识别的API响应格式，使用空数组");
          roles = [];
        }
      } catch (extractError) {
        console.error("提取角色数据时出错:", extractError);
        roles = [];
      }

      // 强制确保roles是数组类型
      if (!Array.isArray(roles)) {
        console.warn("提取的roles不是数组，强制转换为空数组");
        roles = [];
      }

      console.log("最终处理后的角色数据:", roles);
      console.log("角色数据是数组?", Array.isArray(roles));
      console.log("角色数组长度:", roles.length);

      // 转换角色数据
      const normalizedRoles = roles.map((role) => {
        // 使用安全的类型转换
        const anyRole = role || {};

        // 从 isActive 转换为 status 值
        let statusValue = "active";
        if (anyRole.isActive === false) {
          statusValue = "inactive";
        } else if (anyRole.status) {
          statusValue = anyRole.status;
        }

        return {
          ...anyRole,
          id: anyRole.id || anyRole._id || Math.random().toString(), // 确保一定有ID
          key: anyRole.id || anyRole._id || Math.random().toString(), // 添加key属性
          code: anyRole.code || "",
          name:
            anyRole.name || anyRole.roleName || anyRole.displayName || "未命名",
          status: statusValue,
        };
      });

      // 过滤和更新UI
      let filteredRoles = [...normalizedRoles];

      if (searchParams.status && searchParams.status !== "") {
        filteredRoles = filteredRoles.filter(
          (role) => role.status === searchParams.status
        );
      }

      setData(filteredRoles);

      // 更新分页，使用类型断言简化
      const paginationData = (response as any)?.data;
      const total =
        paginationData?.pagination?.total ||
        paginationData?.total ||
        filteredRoles.length;

      setPagination((prev) => ({
        ...prev,
        total,
      }));
    } catch (error) {
      console.error("获取角色列表失败:", error);
      message.error("获取角色列表失败");
      setData([]); // 重置数据为空数组
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 初始加载和搜索条件变化时重新加载数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 添加角色
  const handleAdd = () => {
    setCurrentRole(null);
    setFormVisible(true);
  };

  // 编辑角色
  const handleEdit = (record: Role) => {
    setCurrentRole(record);
    setFormVisible(true);
  };

  // 分配权限
  const handleAssignPermissions = (record: Role) => {
    setCurrentRole(record);
    setPermissionModalVisible(true);
  };

  // 在状态切换处理函数中
  // 处理角色状态切换
  const handleToggleStatus = (record: Role) => {
    // 确定新状态 (当前状态的反向)
    const newStatus = record.status === "active" ? "inactive" : "active";
    const actionText = newStatus === "active" ? "启用" : "禁用";

    modal.confirm({
      title: `确定要${actionText}角色 "${record.name}" 吗?`,
      content:
        newStatus === "active"
          ? "启用后，此角色将可被分配给用户。"
          : "禁用后，此角色将不可被分配给新用户，已分配用户权限不受影响。",
      okText: "确定",
      okType: newStatus === "active" ? "primary" : "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const loadingMessage = message.loading(`正在${actionText}角色...`, 0);

          // 调用updateRoleStatus函数更新状态
          await updateRoleStatus(record.id, newStatus);

          loadingMessage();
          message.success(`角色已${actionText}`);
          fetchData(); // 刷新数据
        } catch (error) {
          console.error("更新角色状态失败:", error);
          message.error("更新角色状态失败");
        }
      },
    });
  };

  // 删除角色
  const handleDelete = async (record: Role) => {
    try {
      await deleteRole(record.id);
      message.success("角色删除成功");
      fetchData();
    } catch (error) {
      console.error("删除角色失败:", error);
      message.error("删除角色失败");
    }
  };

  // 表单提交成功
  const handleFormSuccess = () => {
    setFormVisible(false);
    fetchData();
    message.success(currentRole ? "角色更新成功" : "角色创建成功");
  };

  // 权限分配成功
  const handlePermissionSuccess = () => {
    setPermissionModalVisible(false);
    fetchData();
    message.success("权限分配成功");
  };

  // 定义搜索项配置
  const searchItems: SearchItemConfig[] = [
    {
      name: "nameContains",
      label: "角色名称",
      type: "input",
      props: { placeholder: "角色名称包含内容" },
    },
    {
      name: "idContains", // 直接使用 idContains，而不是 codeContains
      label: "角色编码",
      type: "input",
      props: { placeholder: "角色编码包含内容" },
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "active", label: "启用" },
        { value: "inactive", label: "禁用" },
      ],
      props: {
        placeholder: "请选择状态",
        allowClear: true, // 允许清除选择
      },
    },
  ];

  // 处理搜索提交 - 修复后的版本
  const handleSearch = (values: any) => {
    console.log("原始搜索条件:", values);

    // 创建新搜索参数对象
    const newParams: Record<string, any> = {};

    // 处理角色名称
    if (values.nameContains) {
      newParams.nameContains = values.nameContains;
    }

    // 处理角色编码 - 直接使用 idContains
    if (values.idContains) {
      newParams.idContains = values.idContains;
    }

    // 特别处理状态参数 - 空字符串表示"全部"
    if (values.status !== undefined) {
      newParams.status = values.status;
    }

    // 重置分页到第一页
    setPagination({
      ...pagination,
      current: 1,
    });

    // 设置新的搜索参数
    console.log("处理后的搜索参数:", newParams);
    setSearchParams(newParams);
  };

  // 表格按钮配置
  const tableButtons: TableButtonConfig[] = [
    {
      key: "refresh",
      icon: <ReloadOutlined />,
      onClick: () => fetchData(),
      text: "刷新",
    },
    {
      key: "add",
      type: "primary",
      ghost: true,
      icon: <PlusOutlined />,
      onClick: () => handleAdd(),
      text: "新建",
    },
  ];

  // 表格列定义
  const columns = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
      width: 160,
    },
    // 修改表格列定义中的角色编码列
    // 修改表格列定义中的角色编码列
    {
      title: "角色编码",
      dataIndex: "code",
      key: "code",
      width: 160,
      render: (text: string, record: Role) => {
        // 添加日志，检查每行渲染时的code值
        console.log(`渲染角色 ${record.name} 的编码: ${text}`);

        // 确保即使code为空字符串也能被检测到
        return text && text.trim() ? (
          <Tag color="blue">{text}</Tag>
        ) : (
          <span style={{ color: "#999" }}>未设置</span>
        );
      },
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: { showTitle: false },
      render: (description: string) => (
        <Tooltip title={description}>{description || "-"}</Tooltip>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        console.log(`渲染状态值: "${status}"`);
        if (!status) return <Tag color="default">未设置</Tag>;
        return status === "active" ? (
          <Tag color="success">启用</Tag>
        ) : (
          <Tag color="default">禁用</Tag>
        );
      },
    },
    {
      title: "权限数量",
      key: "permissionCount",
      width: 100,
      render: (_: any, record: Role) => {
        const count = record.permissions?.length || 0;
        return <Tag color={count > 0 ? "green" : "orange"}>{count}</Tag>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (text: string) => {
        if (!text) return "-";
        try {
          const date = new Date(text);
          return date.toLocaleString();
        } catch (e) {
          return "-";
        }
      },
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      fixed: "right" as const,
      render: (_: any, record: Role) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>

          {/* 替换删除按钮为禁用/启用按钮 */}
          <Button
            type="link"
            size="small"
            danger={record.status === "active"} // 启用状态下为危险按钮
            style={{
              color: record.status === "active" ? "" : "#52c41a", // 禁用状态下为绿色
            }}
            icon={
              record.status === "active" ? <LockOutlined /> : <UnlockOutlined />
            }
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === "active" ? "禁用" : "启用"}
          </Button>

          {/* 权限分配按钮 */}
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => handleAssignPermissions(record)}
          >
            权限
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* 角色搜索面板 */}
      <GenericPanelSearch
        title="角色搜索"
        searchItems={searchItems}
        columns={3}
        onSearch={handleSearch}
        labelWidth={80}
      />

      {/* 角色列表面板 */}
      <GenericPanelTable
        title={
          Object.keys(searchParams).length > 0
            ? `角色列表 (搜索结果: ${data.length}条)`
            : "角色列表"
        }
        buttons={tableButtons}
        loading={loading}
        refreshData={fetchData}
        pagination={pagination}
        onPaginationChange={setPagination}
        tableProps={{
          rowKey: "id",
          columns,
          dataSource: data,
          scroll: { x: 1100 },
        }}
        cardProps={{
          style: { marginTop: 16 },
        }}
      />

      {/* 角色表单模态框 */}
      <RoleFormModal
        visible={formVisible}
        currentRole={currentRole}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      {/* 权限分配模态框 */}
      {currentRole && (
        <AssignPermissionModal
          visible={permissionModalVisible}
          roleId={currentRole.id}
          roleName={currentRole.name}
          onCancel={() => setPermissionModalVisible(false)}
          onSuccess={handlePermissionSuccess}
        />
      )}
    </>
  );
};

export default RoleList;

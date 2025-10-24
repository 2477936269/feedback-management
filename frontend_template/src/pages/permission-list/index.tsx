import React, { useState, useEffect, useCallback } from "react";
import { Button, Space, message, Tag } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  KeyOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import PermissionFormModal from "./PermissionFormModal"; // 需要创建这个模态框组件
import GenericPanelSearch, {
  SearchItemConfig,
} from "../../components/generic/GenericPanelSearch";
import GenericPanelTable, {
  TableButtonConfig,
} from "../../components/generic/GenericPanelTable";
import {
  getPermissions,
  deletePermission,
  Permission,
  PermissionQueryParams,
  createPermission,
  updatePermission,
  getPermissionEnums,
  EnumOption,
} from "../../service/permissionService";

import { usePermissionEnums } from "../../hooks/usePermissionEnums";
const PermissionManagement: React.FC = () => {
  // 状态定义
  const navigate = useNavigate();
  const [formVisible, setFormVisible] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(
    null
  );
  const [searchParams, setSearchParams] = useState<PermissionQueryParams>({});
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Permission[]>([]);

  const {
    systemOptions,
    resourceOptions,
    actionOptions,
    typeOptions,
    loading: enumsLoading,
    refresh: refreshEnums,
  } = usePermissionEnums();

  // 删除权限
  const handleDeletePermission = async (permissionId: string) => {
    try {
      const loadingMessage = message.loading("正在删除权限...", 0);

      await deletePermission(permissionId);

      loadingMessage();
      message.success("权限删除成功");
      fetchData();
    } catch (error: any) {
      console.error("删除权限失败:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "操作失败";
      message.error(`删除失败: ${errorMsg}`);
    }
  };

  // 定义搜索项配置
  const searchItems: SearchItemConfig[] = [
    {
      name: "nameContains",
      label: "权限名称",
      type: "input",
      props: { placeholder: "权限名称关键字" },
    },
    {
      name: "module", // 直接使用module，而不是systemModule
      label: "所属系统",
      type: "select",
      options: systemOptions,
      props: {
        placeholder: "请选择所属系统",
        loading: enumsLoading,
        showSearch: true,
        optionFilterProp: "label",
        allowClear: true,
      },
    },
    {
      name: "resource",
      label: "资源",
      type: "select", // 改为select类型
      options: resourceOptions,
      props: {
        placeholder: "请选择资源",
        loading: enumsLoading,
        showSearch: true,
        optionFilterProp: "label",
        allowClear: true,
      },
    },
    {
      name: "action",
      label: "操作",
      type: "select", // 改为select类型
      options: actionOptions,
      props: {
        placeholder: "请选择操作",
        loading: enumsLoading,
        showSearch: true,
        optionFilterProp: "label",
        allowClear: true,
      },
    },
    // 修复 filterOption 中的隐式 any 类型错误
    {
      name: "type",
      label: "权限类型",
      type: "select",
      options: typeOptions,
      props: {
        placeholder: "请选择权限类型",
        allowClear: true,
        showSearch: true,
        optionFilterProp: "label",
        filterOption: (
          input: string,
          option: any // 添加类型声明
        ) =>
          (option?.label as string)
            ?.toLowerCase()
            .includes(input.toLowerCase()),
      },
    },
  ];

  // 获取权限数据
  // 优化fetchData函数
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (loading && !forceRefresh) return; // 防止重复加载
      setLoading(true);

      // 构建API参数
      const apiParams: Record<string, any> = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      // 重要：按照后端期望的参数名称构建查询参数
      if (searchParams.nameContains)
        apiParams.nameContains = searchParams.nameContains;
      if (searchParams.system) apiParams.system = searchParams.system; // 使用 system 而不是 module
      if (searchParams.module) apiParams.module = searchParams.module; // 兼容已有的 module 参数
      if (searchParams.type) apiParams.type = searchParams.type;
      if (searchParams.resource) apiParams.resource = searchParams.resource;
      if (searchParams.action) apiParams.action = searchParams.action;

      console.log("原始搜索参数:", searchParams);
      console.log("发送到API的参数:", apiParams);
      console.log("查询类型参数:", apiParams.type);

      try {
        // 调用API获取权限列表
        const response = await getPermissions(apiParams);
        console.log("API返回的权限数据:", response);

        // 添加详细日志
        if (response?.data && Array.isArray(response.data)) {
          console.log("权限数据示例(第一条):", response.data[0]);
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          console.log("权限数据示例(第一条):", response.data.data[0]);
        }

        // 处理不同格式的响应
        let permissions: any[] = [];

        if (response?.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            permissions = response.data.data;
          } else if (
            response.data.items &&
            Array.isArray(response.data.items)
          ) {
            permissions = response.data.items;
          } else if (Array.isArray(response.data)) {
            permissions = response.data;
          } else if (typeof response.data === "object") {
            permissions = [response.data];
          }
        } else if (Array.isArray(response)) {
          permissions = response;
        }

        // 标准化数据
        // 在fetchData中修改标准化逻辑
        const normalizedData = Array.isArray(permissions)
          ? permissions.map((permission: any) => ({
              ...permission,
              id: permission.id || permission._id,
              key: permission.id || permission._id,
              name: permission.name || "未命名权限",
              code:
                permission.code ||
                `${permission.resource}:${permission.action}`,
              type: permission.type || "FUNCTION",
              module: permission.system || permission.module || "未分类", // 优先使用system字段
            }))
          : [];

        setData(normalizedData);

        // 更新分页信息
        let total = normalizedData.length;

        // 使用类型断言简化分页数据访问
        const paginationData = (response as any)?.data;
        if (paginationData?.pagination?.total !== undefined) {
          total = paginationData.pagination.total;
        } else if (paginationData?.total !== undefined) {
          total = paginationData.total;
        } else if ((response as any)?.total !== undefined) {
          total = (response as any).total;
        }

        setPagination((prev) => ({
          ...prev,
          total,
        }));
      } catch (error: any) {
        console.error("加载权限数据失败:", error);
        message.error("加载权限数据失败");
      } finally {
        setLoading(false);
      }
    },
    [searchParams, pagination.current, pagination.pageSize]
  );

  // 渲染系统模块标签
  const renderSystemModule = (module: string) => {
    const moduleColors: Record<string, string> = {
      CORE: "geekblue",
      USER_MANAGEMENT: "purple",
      ORDER: "orange",
      CRM: "volcano",
      FINANCE: "gold",
      INVENTORY: "lime",
      OTHER: "default",
    };

    return (
      <Tag color={moduleColors[module] || "default"}>{module || "未分类"}</Tag>
    );
  };

  // 初始加载和搜索条件变化时重新加载数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 添加权限
  const handleAdd = () => {
    setCurrentPermission(null);
    setFormVisible(false);
    setTimeout(() => {
      setFormVisible(true);
    }, 10);
  };

  // 编辑权限
  const handleEdit = (record: Permission) => {
    setCurrentPermission(record);
    setFormVisible(true);
  };

  // 表单提交成功
  const handleFormSuccess = () => {
    setFormVisible(false);
    fetchData();
    message.success(currentPermission ? "权限更新成功" : "权限创建成功");
  };

  // 处理搜索提交
  // 修改handleSearch函数，将module映射到system

  const handleSearch = (values: PermissionQueryParams) => {
    console.log("原始搜索条件:", values);
    console.log("类型搜索值:", values.type); // 调试类型值

    // 创建新对象，使用正确的后端参数名
    const apiParams: Record<string, any> = {};

    // 处理不同的参数，映射到后端字段名
    if (values.nameContains) apiParams.nameContains = values.nameContains;
    if (values.module) apiParams.system = values.module; // 关键：统一使用 system
    if (values.type) {
      apiParams.type = values.type;
      console.log("权限类型搜索值:", values.type, "转换后:", apiParams.type);
    }
    if (values.resource) apiParams.resource = values.resource;
    if (values.action) apiParams.action = values.action;

    console.log("映射后的搜索条件:", apiParams);

    // 过滤空值
    const filteredValues = Object.entries(apiParams).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    console.log("最终搜索条件:", filteredValues);

    // 重置分页到第一页
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));

    setSearchParams(filteredValues);
  };

  // 表格按钮配置
  const tableButtons: TableButtonConfig[] = [
    // 更新表格刷新按钮
    {
      key: "refresh",
      icon: <ReloadOutlined />,
      onClick: () => {
        refreshEnums(); // 使用从Hook获取的刷新函数
        fetchData(true); // 强制刷新数据
      },
      text: "刷新",
    },
    {
      key: "batch",
      icon: <PlusOutlined />,
      onClick: () => navigate("/permission/batch-add"),
      text: "批量",
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

  // 渲染权限类型标签
  const renderPermissionType = (type: string) => {
    const colors: Record<string, string> = {
      FUNCTION: "blue",
      DATA: "green",
      UI: "purple",
      API: "orange",
      MENU: "cyan",
    };

    return <Tag color={colors[type] || "default"}>{type || "未知"}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: "权限名称",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "权限类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => renderPermissionType(type || "FUNCTION"), // 添加默认值防止空显示
    },
    {
      title: "所属系统",
      dataIndex: "module",
      key: "module",
      width: 100,
      render: (module: string) => renderSystemModule(module),
    },
    {
      title: "权限代码",
      dataIndex: "code",
      key: "code",
      width: 180,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },

    // 修改创建时间列，添加调试信息并处理多种可能的日期字段

    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (_: any, record: Permission) => {
        // 打印整个记录以检查实际数据
        console.log("渲染权限记录:", record);

        // 尝试几种可能的时间字段
        const timeValue = record.createdAt;

        if (!timeValue) {
          console.log("未找到创建时间字段:", record);
          return <span style={{ color: "#999" }}>未知</span>;
        }

        try {
          // 解析ISO 8601格式的日期时间字符串
          const dateObj = new Date(timeValue);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }
          return timeValue;
        } catch (error) {
          console.error("日期格式化错误:", error);
          return timeValue; // 如果解析失败，直接返回原始字符串
        }
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: React.ReactNode, record: Permission) => (
        <Space size="small">
          <Button
            key="edit"
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            key="delete"
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(`确定要删除权限 "${record.name}" 吗?`)) {
                handleDeletePermission(String(record.id));
              }
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* 权限搜索面板 */}
      <GenericPanelSearch
        title="权限搜索"
        searchItems={searchItems}
        columns={3}
        onSearch={handleSearch}
        labelWidth={80}
      />

      {/* 权限列表面板 */}
      <GenericPanelTable
        title="权限列表"
        buttons={tableButtons}
        loading={loading}
        refreshData={fetchData}
        pagination={pagination}
        onPaginationChange={setPagination}
        resizableColumns={true}
        saveColumnWidths={true}
        storageKey="permissions-table"
        tableProps={{
          rowKey: "id",
          columns,
          dataSource: data,
          scroll: { x: 1300 },
        }}
        cardProps={{
          style: { marginTop: 16 },
        }}
      />

      {/* 权限表单模态框 */}
      {formVisible && (
        <PermissionFormModal
          visible={formVisible}
          currentPermission={currentPermission}
          onCancel={() => setFormVisible(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
};

export default PermissionManagement;

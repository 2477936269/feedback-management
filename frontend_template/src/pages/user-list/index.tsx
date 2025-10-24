import React, { useState, useEffect, useCallback } from "react";
import { Button, Space, message, Tag, Avatar } from "antd";
import type { TablePaginationConfig } from "antd/es/table"; // 添加此导入
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons"; // 导入图标
import { useNavigate } from "react-router-dom"; // 导入路由导航组件

import UserFormModal from "./UserFormModal"; // 引入创建的模态框
import GenericPanelSearch, {
  SearchItemConfig,
} from "../../components/generic/GenericPanelSearch"; // 导入搜索面板
import GenericPanelTable, {
  TableButtonConfig,
} from "../../components/generic/GenericPanelTable"; // 导入表格面板
import { getUsers, updateUser } from "../../service/userService"; // 导入用户服务

// 用户接口定义
interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  nickname?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  status: "active" | "inactive" | "locked";
  createdAt: string;
  updatedAt: string;
}

const UserList: React.FC = () => {
  // 状态定义
  const navigate = useNavigate(); // 导航函数
  const [formVisible, setFormVisible] = useState(false); // 表单模态框可见状态
  const [currentUser, setCurrentUser] = useState<User | null>(null); // 当前用户
  const [searchParams, setSearchParams] = useState<any>({}); // 搜索参数
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    // 分页参数
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false); // 加载状态
  const [data, setData] = useState<User[]>([]); // 用户数据

  // 切换用户状态
  const handleStatusToggle = async (
    // 添加异步处理
    record: User, // 用户对象
    newStatus: "active" | "inactive" | "locked" // 新状态
  ) => {
    try {
      console.log(`准备更新用户ID: ${record.id} 的状态为 ${newStatus}`);

      // 显示加载消息
      const loadingMessage = message.loading(`正在更新用户状态...`, 0);

      // 调用API更新状态
      await updateUser(record.id, { status: newStatus });

      // 关闭加载消息
      loadingMessage();

      // 显示成功消息
      message.success(
        `用户状态已更新为${
          newStatus === "active"
            ? "启用"
            : newStatus === "inactive"
            ? "禁用"
            : "锁定"
        }`
      );

      // 刷新数据
      fetchData();
    } catch (error: any) {
      console.error("更新状态失败:", error); // 记录错误
      const errorMsg =
        error.response?.data?.message || error.message || "操作失败"; // 获取错误消息
      message.error(`状态更新失败: ${errorMsg}`); // 显示错误消息
    }
  };

  // 定义搜索项配置
  const searchItems: SearchItemConfig[] = [
    {
      name: "usernameContains",
      label: "用户名",
      type: "input",
      props: { placeholder: "用户名包含内容" },
    },

    {
      name: "emailContains",
      label: "邮箱",
      type: "input",
      props: { placeholder: "邮箱包含内容" },
    },

    {
      name: "phoneContains",
      label: "手机号",
      type: "input",
      props: { placeholder: "手机号包含内容" },
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "active", label: "启用" },
        { value: "inactive", label: "禁用" },
        { value: "locked", label: "锁定" },
      ],
      props: { placeholder: "请选择状态" },
    },
    {
      name: "isEmailVerified",
      label: "邮箱验证",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "true", label: "已验证" },
        { value: "false", label: "未验证" },
      ],
      props: { placeholder: "请选择邮箱验证状态" },
    },
    // 添加手机验证状态搜索条件
    {
      name: "isPhoneVerified",
      label: "手机验证",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "true", label: "已验证" },
        { value: "false", label: "未验证" },
      ],
      props: { placeholder: "请选择手机验证状态" },
    },
    {
      name: "dateRange",
      label: "创建时间",
      type: "dateRange",
      props: {
        placeholder: ["开始日期", "结束日期"],
      },
    },
  ];

  // 修改 fetchData 函数，确保在所有情况下都正确重置 loading 状态
  const fetchData = useCallback(async () => {
    console.log("fetchData 被调用, loading 设为 true");
    setLoading(true);

    // 构建API参数
    const apiParams = {
      ...searchParams,
      current: pagination.current,
      pageSize: pagination.pageSize,
    };

    try {
      // 调用API获取用户列表
      const response = await getUsers(apiParams);
      console.log("API返回的用户数据:", response);

      // 增强的数据处理逻辑，确保用户数据是数组
      let users = [];

      // 简化数据访问逻辑，使用类型断言
      const responseData = (response as any)?.data;
      if (responseData) {
        if (Array.isArray(responseData.data)) {
          users = responseData.data;
          console.log("从 response.data.data 中提取了用户数组:", users.length);
        } else if (Array.isArray(responseData.items)) {
          users = responseData.items;
          console.log("从 response.data.items 中提取了用户数组:", users.length);
        } else if (Array.isArray(responseData)) {
          users = responseData;
        } else if (typeof responseData === "object") {
          users = [responseData];
        }
      } else if (Array.isArray(response)) {
        users = response;
      }

      console.log("处理后的用户数据数组:", users);

      // 处理数据
      const normalizedData = Array.isArray(users)
        ? users.map((user: any, index) => ({
            ...user,
            id: user.id || user._id || `temp-id-${index}`,
            key: user.id || user._id || `temp-id-${index}`,
            status: user.isLocked
              ? "locked"
              : user.isActive
              ? "active"
              : "inactive",
            phoneNumber: user.phone || user.phoneNumber,
            createdAt: user.createdAt || user.createTime,
            updatedAt: user.updatedAt || user.updateTime,
          }))
        : [];

      setData(normalizedData);

      // 更新分页信息，增强健壮性
      let total = normalizedData.length;

      // 处理不同的分页结构，使用类型断言简化
      const paginationData = (response as any)?.data;
      if (paginationData?.pagination?.total !== undefined) {
        total = paginationData.pagination.total;
      } else if (paginationData?.total !== undefined) {
        total = paginationData.total;
      } else if ((response as any)?.total !== undefined) {
        total = (response as any).total;
      }

      if (total !== pagination.total) {
        setPagination((prev) => ({
          ...prev,
          total,
        }));
      }
    } catch (error: any) {
      console.error("加载用户数据失败:", error);
      message.error("加载用户数据失败");
    } finally {
      // 确保无论成功还是失败，都会重置加载状态
      setLoading(false);
      console.log("loading 状态已重置为 false");
    }
  }, [searchParams, pagination.current, pagination.pageSize]);

  // 初始加载和搜索条件变化时重新加载数据
  useEffect(() => {
    fetchData();
  }, [fetchData]); // 添加 pagination 作为依赖

  // 添加用户
  const handleAdd = () => {
    // 确保清空当前用户
    setCurrentUser(null);

    // 先关闭模态框（如果已经打开），然后再打开
    setFormVisible(false);

    // 添加延迟以确保状态完全更新
    setTimeout(() => {
      setFormVisible(true);
      console.log("准备添加新用户, currentUser已设为null, formVisible:", true);
    }, 10);
  };

  // 编辑用户
  const handleEdit = (record: User) => {
    setCurrentUser(record); // 设置当前用户
    setFormVisible(true); // 打开模态框
  };

  // 查看用户详情
  const handleViewDetail = (id: string) => {
    // 添加查看用户详情函数
    navigate(`/user/detail/${id}`); // 跳转到用户详情页
  };

  // 表单提交成功
  const handleFormSuccess = () => {
    // 添加表单提交成功处理函数
    setFormVisible(false); // 关闭模态框
    fetchData(); // 重新加载数据
    message.success(currentUser ? "用户更新成功" : "用户创建成功"); // 提示成功消息
  };

  // 表格变化处理（分页、排序、筛选）
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    console.log("表格分页变化:", newPagination);
    setPagination(newPagination);
  };

  // 处理搜索提交
  const handleSearch = (values: any) => {
    console.log("搜索条件:", values);

    const processedValues = { ...values }; // 复制搜索条件

    // 处理日期范围
    if (values.dateRange && values.dateRange.length === 2) {
      // 处理日期范围
      processedValues.createdFrom = values.dateRange[0].format("YYYY-MM-DD"); // 转换日期格式
      processedValues.createdTo = values.dateRange[1].format("YYYY-MM-DD"); // 转换日期格式
      delete processedValues.dateRange; // 删除原始字段
    }

    // 处理布尔值转换 - 修复邮箱和手机验证状态搜索
    if (processedValues.isEmailVerified === "true")
      // 处理邮箱验证状态
      processedValues.isEmailVerified = true; // 转换为布尔值
    if (processedValues.isEmailVerified === "false")
      // 处理邮箱验证状态
      processedValues.isEmailVerified = false; // 转换为布尔值
    if (processedValues.isPhoneVerified === "true")
      // 处理手机验证状态
      processedValues.isPhoneVerified = true; // 转换为布尔值
    if (processedValues.isPhoneVerified === "false")
      // 处理手机验证状态
      processedValues.isPhoneVerified = false; // 转换为布尔值

    console.log("处理后的搜索条件:", processedValues); // 打印处理后的搜索条件

    // 过滤掉空值
    const filteredValues = Object.fromEntries(
      // 过滤掉空值
      Object.entries(processedValues).filter(
        // 过滤空值
        ([_, value]) => value !== undefined && value !== "" // 过滤空值
      )
    );

    // 重置分页到第一页
    setPagination({
      ...pagination, // 保留原始分页数据
      current: 1, // 重置为第一页
    });

    // 设置搜索参数
    setSearchParams(filteredValues); // 设置搜索参数
  };

  // 表格按钮配置
  const tableButtons: TableButtonConfig[] = [
    // 表格按钮配置
    {
      key: "refresh", // 刷新按钮
      icon: <ReloadOutlined />, // 刷新图标
      onClick: () => fetchData(), // 点击刷新按钮
      text: "刷新", // 按钮文本
    },
    {
      key: "add", // 新建按钮
      type: "primary", // 主要按钮
      ghost: true, // 透明背景
      icon: <PlusOutlined />, // 新建图标
      onClick: () => handleAdd(), // 点击新建按钮
      text: "新建", // 按钮文本
    },
  ];

  // 渲染状态标签
  const renderStatus = (status: string) => {
    switch (status) {
      case "active":
        return <Tag color="success">启用</Tag>; // 启用状态
      case "inactive":
        return <Tag color="default">禁用</Tag>; // 禁用状态
      case "locked":
        return <Tag color="error">锁定</Tag>; // 锁定状态
      default:
        return <Tag>未知</Tag>; // 未知状态
    }
  };

  // 表格列定义
  // 表格列定义
  const columns = [
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      width: 70,
      render: (
        avatar: string // 渲染头像
      ) => (
        <Avatar src={avatar} icon={<UserOutlined />} size="large" /> // 用户头像
      ),
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 160,
    },
    {
      title: "姓名",
      key: "fullName",
      width: 120,
      render: (record: any) => {
        // 渲染姓名
        const firstName = record.firstName || ""; // 名
        const lastName = record.lastName || ""; // 姓
        return `${lastName}${firstName}` || record.nickname || "-"; // 返回姓名
      },
    },
    {
      title: "电子邮箱",
      dataIndex: "email",
      key: "email",
      render: (text: string) => text || "-", // 渲染邮箱，如果为空则显示短横线
    },

    {
      title: "手机号",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
      render: (text: string) => text || "-", // 渲染手机号，如果为空则显示短横线
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100, // 宽度可以减小，因为不再显示按钮
      render: (status: string) => renderStatus(status), // 渲染状态，按照状态渲染不同的标签
    },
    {
      title: "邮箱验证",
      dataIndex: "isEmailVerified",
      key: "isEmailVerified",
      width: 100,
      render: (
        verified: boolean // 渲染邮箱验证
      ) =>
        verified ? (
          <Tag color="success">已验证</Tag> // 已验证
        ) : (
          <Tag color="warning">未验证</Tag> // 未验证
        ),
    },
    {
      title: "手机验证",
      dataIndex: "isPhoneVerified", // 手机验证
      key: "isPhoneVerified",
      width: 100,
      render: (
        verified: boolean // 渲染手机验证
      ) =>
        verified ? (
          <Tag color="success">已验证</Tag> // 已验证
        ) : (
          <Tag color="warning">未验证</Tag> // 未验证
        ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (text: string) => {
        // 渲染创建时间
        if (!text) return "-"; // 如果为空则显示短横线
        try {
          const date = new Date(text); // 转换为日期对象
          return date.toLocaleString(); // 返回本地时间字符串
        } catch (e) {
          return "-"; // 转换失败则显示短横线
        }
      },
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right" as const, // 固定到右侧
      render: (
        _: React.ReactNode, // 占位符
        record: User // 添加明确的类型 React.ReactNode
      ) => (
        <Space size="small">
          {/* 添加状态切换按钮作为第一项 */}
          {record.status !== "active" && (
            <Button
              key="enable" // 添加唯一key
              type="link"
              size="small"
              icon={<UnlockOutlined />}
              onClick={() => handleStatusToggle(record, "active")}
            >
              启用
            </Button>
          )}
          {record.status === "active" && (
            <Button
              key="disable" // 添加唯一key
              type="link"
              size="small"
              danger
              icon={<LockOutlined />}
              onClick={() => handleStatusToggle(record, "inactive")}
            >
              禁用
            </Button>
          )}

          {/* 编辑按钮 */}
          <Button
            key="edit" // 添加唯一key
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* 用户搜索面板 */}
      <GenericPanelSearch
        title="用户搜索" // 设置搜索面板标题
        searchItems={searchItems} // 设置搜索项配置
        columns={3} // 设置搜索项列数
        onSearch={handleSearch} // 设置搜索提交处理函数
        labelWidth={80} // 设置标签宽度
      />

      {/* 用户列表面板 */}
      <GenericPanelTable
        title="用户列表"
        buttons={tableButtons}
        loading={loading}
        refreshData={fetchData}
        pagination={pagination}
        onPaginationChange={setPagination}
        resizableColumns={true}
        saveColumnWidths={true}
        storageKey="unique-table-name"
        tableProps={{
          rowKey: (record) =>
            record.id || (record as any).key || Math.random().toString(), // 使用类型断言
          columns,
          dataSource: data,
          scroll: { x: 1300 },
          onChange: undefined,
        }}
        cardProps={{
          style: { marginTop: 16 },
        }}
      />

      {/* 用户表单模态框 */}
      <UserFormModal // 用户表单模态框
        visible={formVisible} // 设置模态框可见状态
        currentUser={currentUser} // 设置当前用户
        onCancel={() => setFormVisible(false)} // 设置取消处理函数
        onSuccess={handleFormSuccess} // 设置成功处理函数
      />
    </>
  );
};

export default UserList;

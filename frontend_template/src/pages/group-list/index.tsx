import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Space, message, Tag, Popconfirm, Typography, Tooltip, Progress, Spin } from "antd";
import type { TablePaginationConfig, ColumnType } from "antd/es/table"; // 添加 ColumnType

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import UserGroupFormModal from "./UserGroupFormModal";
import GenericPanelSearch, {
  SearchItemConfig,
} from "../../components/generic/GenericPanelSearch";
import GenericPanelTable, {
  TableButtonConfig,
} from "../../components/generic/GenericPanelTable";
import {
  getUserGroups,
  deleteUserGroup,
  updateUserGroup,
} from "../../service/userGroupService";

const { Text } = Typography;

// 更新用户组接口定义
interface UserGroup {
  id: string;
  originalId?: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  isActive: boolean;
  membersCount?: number;
  createdAt: string;
  updatedAt?: string;

  // 添加这个字段
  _count?: {
    members: number;
  };

  // 类型和有效期
  type: "PERMANENT" | "TEMPORARY";
  validFrom?: string;
  validTo?: string;
  autoExpire?: boolean;

  // 权限相关
  permissionLevel?: number;
  dataScope?: "SELF" | "TEAM" | "BRANCH" | "ALL";
  inheritPermissions?: boolean;

  // 业务和标识
  businessType?: "DEPARTMENT" | "PROJECT" | "TEAM" | "ROLE" | "OTHER";
  externalId?: string;
  tags?: string[];

  // 安全相关
  visibility?: "PUBLIC" | "INTERNAL" | "RESTRICTED" | "CONFIDENTIAL";
  securityLevel?: number;

  // 树形结构
  hasChildren?: boolean;
  children?: UserGroup[];
}

const UserGroupList: React.FC = () => {
  // 状态定义
  const [formVisible, setFormVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<UserGroup | null>(null);
  const [searchParams, setSearchParams] = useState<any>({});
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserGroup[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  // 在其他状态定义下方添加
  const [loadedChildGroupsCache, setLoadedChildGroupsCache] = useState<
    Record<string, UserGroup[]>
  >({});

  // 添加一个状态来跟踪表格的唯一键
  const [tableKey, setTableKey] = useState(0);

  // 添加排序状态
  const [sortInfo, setSortInfo] = useState<{
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }>({});

// 修改获取用户组数据函数，确保统一处理ID格式，正确建立树形结构

  const fetchData = useCallback(async () => {
    console.log("获取用户组数据...");
    setLoading(true);

    try {
      // 调用API获取用户组列表
      const response = await getUserGroups({
        ...searchParams,
        ...sortInfo,
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
      
      console.log("API返回的用户组数据:", response);

      // 处理响应数据
      let userGroups = [];
      if (response?.data) {
        // 使用类型断言简化数据访问
        const responseData = (response as any)?.data;
        if (Array.isArray(responseData?.data)) {
          userGroups = responseData.data;
        } else if (Array.isArray(responseData?.items)) {
          userGroups = responseData.items;
        } else if (Array.isArray(responseData)) {
          userGroups = responseData;
        } else if (typeof responseData === 'object') {
          userGroups = [response.data];
        }
      } else if (Array.isArray(response)) {
        userGroups = response;
      }
      
      console.log("处理前的用户组数据:", userGroups);
      
      // 统一处理数据，确保ID格式一致
      const normalizedData = Array.isArray(userGroups) 
      ? userGroups.map((group: any) => {
          const id = String(group.id || group._id || `group-${Math.random()}`);
          const parentId = group.parentId ? String(group.parentId) : null;
          
          return {
            ...group,
            id,
            originalId: id,
            parentId,
            key: id,
            parentName: group.parentName || (group.parent ? group.parent.name : null),
            createdAt: group.createdAt || group.createTime,
            updatedAt: group.updatedAt || group.updateTime,
            tags: group.tags && Array.isArray(group.tags) ? group.tags : [],
            _count: group._count, // 确保保留 _count 字段
            // 兼容处理：如果有 _count.members 则使用它，否则保留原有字段
            membersCount: group._count?.members !== undefined ? group._count.members : group.membersCount,
            hasChildren: Boolean(
              group.hasChildren ||
              (group.children && group.children.length > 0) ||
              group.childCount > 0
            )
          };
        }) 
      : [];
      
      console.log("标准化后的数据:", normalizedData);
      
      // 构建树形结构
      const buildTreeData = (items: any[]) => {
        // 创建 ID 到项目的映射
        const itemMap = new Map();
        items.forEach(item => {
          itemMap.set(item.id, { ...item, children: [] });
        });
        
        // 构建树形结构
        const rootItems: any[] = [];
        
        items.forEach(item => {
          if (item.parentId && itemMap.has(item.parentId)) {
            // 有父级且父级存在于当前数据中
            const parent = itemMap.get(item.parentId);
            const child = itemMap.get(item.id);
            
            // 添加到父级的 children 数组
            parent.children.push(child);
            parent.hasChildren = true; // 确保父级有 hasChildren 标记
          } else {
            // 没有父级或父级不在当前数据中，作为根节点
            const root = itemMap.get(item.id);
            rootItems.push(root);
          }
        });
        
        // 清理空 children 数组
        const processItem = (item: any) => {
          if (item.children.length === 0) {
            delete item.children;
          } else {
            item.children = item.children.map(processItem);
          }
          return item;
        };
        
        return rootItems.map(processItem);
      };
      
      // 构建树形数据
      const treeData = buildTreeData(normalizedData);
      console.log("构建的树形数据:", treeData);
      
      setData(treeData);
      
      // 处理分页信息
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
      
      if (total !== pagination.total) {
        setPagination(prev => ({
          ...prev,
          total
        }));
      }
    } catch (error: any) {
      console.error("获取用户组列表失败:", error);
      message.error("获取用户组列表失败: " + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, pagination.current, pagination.pageSize, sortInfo]);

  // 初始加载和搜索条件变化时重新加载数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 处理排序选择
  useEffect(() => {
    if (searchParams.sortConfig) {
      const [sortBy, sortDirection] = searchParams.sortConfig.split('_');
      setSortInfo({ sortBy, sortDirection });
    } else {
      setSortInfo({});
    }
  }, [searchParams.sortConfig]);

  // 修改 handleStatusToggle 函数，确保发送完整数据
  
  const handleStatusToggle = async (record: UserGroup, isActive: boolean) => {
    try {
      const loadingMessage = message.loading(
        `正在${isActive ? "启用" : "禁用"}用户组...`,
        0
      );
      
      // 保留重要字段，特别是 parentId，防止这些字段在更新时被清空
      const updateData = {
        isActive,
        // 保留关键字段，确保不会丢失
        parentId: record.parentId !== undefined ? record.parentId : null,
        // 可以添加其他需要保留的关键字段
        name: record.name,
        code: record.code,
        type: record.type,
        businessType: record.businessType,
        dataScope: record.dataScope,
        permissionLevel: record.permissionLevel,
        visibility: record.visibility,
        securityLevel: record.securityLevel,
        inheritPermissions: record.inheritPermissions
      };
      
      console.log(`更新用户组状态，ID: ${record.id}, parentId: ${record.parentId}, 状态: ${isActive}`);
      await updateUserGroup(record.id, updateData);
      
      loadingMessage();
      message.success(`用户组已${isActive ? "启用" : "禁用"}`);
      
      // 使用强制刷新版本的数据加载
      setData([]);  // 清空当前数据
      setExpandedRowKeys([]); // 重置展开状态
      setTableKey(prev => prev + 1); // 强制表格重新渲染
      
      // 延迟执行数据获取，确保状态已重置
      setTimeout(() => {
        fetchData();
      }, 100);
    } catch (error: any) {
      console.error("更新状态失败:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "操作失败";
      message.error(`状态更新失败: ${errorMsg}`);
    }
  };

  // 修改展开处理函数
  const handleExpand = async (expanded: boolean, record: UserGroup) => {
    const recordId = String(record.id);
    
    if (expanded) {
      // 如果是展开操作
      if (record.hasChildren && (!record.children || record.children.length === 0)) {
        try {
          setLoading(true);
          const response = await getUserGroups({ parentId: recordId });
          const childGroups = (response as any)?.data?.items || (response as any)?.data?.data || (response as any)?.data || [];

          // 处理子节点数据并确保ID格式一致
          const childData = childGroups.map((group: any) => {
            const id = String(group.id || group._id);
            
            return {
              ...group,
              id,
              originalId: id,
              key: id,
              parentId: recordId, // 确保父ID正确设置
              parentName: record.name,
              createdAt: group.createdAt || group.createTime,
              updatedAt: group.updatedAt || group.updateTime,
              hasChildren: Boolean(
                group.hasChildren ||
                (group.children && group.children.length > 0) ||
                group.childCount > 0
              ),
            };
          });

          // 更新数据，添加子节点到原有记录
          setData((prevData) => {
            const updateChildren = (items: UserGroup[]): UserGroup[] => {
              return items.map(item => {
                if (String(item.id) === recordId) {
                  return { ...item, children: childData };
                } else if (item.children) {
                  return { ...item, children: updateChildren(item.children) };
                }
                return item;
              });
            };
            
            return updateChildren(prevData);
          });
        } catch (error) {
          console.error("获取子用户组失败:", error);
          message.error("获取子用户组失败");
        } finally {
          setLoading(false);
        }
      }

      // 添加到展开键列表
      setExpandedRowKeys((prevKeys) => [...prevKeys, recordId]);
    } else {
      // 收起操作，从展开列表中移除
      setExpandedRowKeys((prevKeys) => prevKeys.filter((key) => key !== recordId));
    }
    // 更新表格键，强制重新渲染
    setTableKey((prevKey) => prevKey + 1);
  };

  // 删除用户组
  const handleDelete = async (record: UserGroup) => {
    try {
      const loadingMessage = message.loading("正在删除用户组...", 0);
      await deleteUserGroup(record.id);
      loadingMessage();
      message.success("用户组已删除");
      fetchData();
    } catch (error: any) {
      console.error("删除失败:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "操作失败";
      message.error(`删除失败: ${errorMsg}`);
    }
  };

  // 添加用户组
  const handleAdd = () => {
    setCurrentGroup(null);
    setFormVisible(false);

    setTimeout(() => {
      setFormVisible(true);
      console.log(
        "准备添加新用户组, currentGroup已设为null, formVisible:",
        true
      );
    }, 10);
  };

  // 编辑用户组
  const handleEdit = (record: UserGroup) => {
    setCurrentGroup(record);
    setFormVisible(true);
  };

  // 表单提交成功
  // 在 handleFormSuccess 函数中添加更强力的刷新
  
  const handleFormSuccess = () => {
    // 隐藏表单
    setFormVisible(false);
    // 重置当前编辑的组
    setCurrentGroup(null);
    
    // 清空现有数据，确保完全重新加载
    setData([]);
    
    // 重置展开的行，确保刷新后重新计算层级关系
    setExpandedRowKeys([]);
    
    // 强制触发表格重新渲染
    setTableKey(prev => prev + 1);
    
    // 延迟执行数据获取，确保状态已完全重置
    setTimeout(() => {
      // 强制重新获取数据
      fetchData();
      message.success('用户组列表已刷新');
    }, 100);
  };

  // 处理搜索提交的增强版本
  // 修改 handleSearch 函数，添加排序和有效期处理
  const handleSearch = (values: any) => {
    const processedValues = { ...values };
  
    // 处理日期范围 - 创建时间
    if (values.dateRange && values.dateRange.length === 2) {
      processedValues.createdFrom = values.dateRange[0].format("YYYY-MM-DD");
      processedValues.createdTo = values.dateRange[1].format("YYYY-MM-DD");
      delete processedValues.dateRange;
    }
  
    // 处理有效期日期范围
    if (values.validityRange && values.validityRange.length === 2) {
      processedValues.validFromAfter = values.validityRange[0].format("YYYY-MM-DD");
      processedValues.validToBefore = values.validityRange[1].format("YYYY-MM-DD");
      delete processedValues.validityRange;
    }
  
    // 处理布尔值转换
    if (processedValues.isActive === "true") processedValues.isActive = true;
    if (processedValues.isActive === "false") processedValues.isActive = false;
    if (processedValues.isValid === "true") processedValues.isValid = true;
    if (processedValues.isValid === "false") processedValues.isValid = false;
  
    // 处理权限级别范围
    if (values.permissionLevelRange && values.permissionLevelRange.length === 2) {
      if (values.permissionLevelRange[0]) {
        processedValues.minPermissionLevel = values.permissionLevelRange[0];
      }
      if (values.permissionLevelRange[1]) {
        processedValues.maxPermissionLevel = values.permissionLevelRange[1];
      }
      delete processedValues.permissionLevelRange;
    }
  
    // 处理多选业务类型
    if (values.businessType && Array.isArray(values.businessType)) {
      processedValues.businessType = values.businessType.join(',');
    }
  
    // 过滤掉空值
    const filteredValues = Object.fromEntries(
      Object.entries(processedValues).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );
  
    // 重置分页到第一页并清空展开状态
    setPagination((prev) => ({ ...prev, current: 1 }));
    setExpandedRowKeys([]);
  
    // 清空缓存，因为搜索条件变化
    setLoadedChildGroupsCache && setLoadedChildGroupsCache({});
  
    // 设置搜索参数
    setSearchParams(filteredValues);
  };

  // 修改搜索项配置，支持更多API参数
  const searchItems: SearchItemConfig[] = [
    {
      name: "nameContains",
      label: "名称",
      type: "input",
      props: { placeholder: "用户组名称" },
    },
    {
      name: "codeContains",
      label: "编码",
      type: "input",
      props: { placeholder: "用户组编码" },
    },
    {
      name: "type",
      label: "组类型",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "PERMANENT", label: "永久组" },
        { value: "TEMPORARY", label: "临时组" },
      ],
      props: { placeholder: "选择组类型" },
    },
    {
      name: "businessType",
      label: "业务类型",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "DEPARTMENT", label: "部门" },
        { value: "PROJECT", label: "项目组" },
        { value: "TEAM", label: "团队" },
        { value: "ROLE", label: "角色组" },
        { value: "COMMITTEE", label: "委员会" }, // 添加委员会选项
        { value: "OTHER", label: "其他" },
      ],
      props: { 
        placeholder: "选择业务类型",
        mode: "multiple", // 支持多选
        maxTagCount: 2    // 最多显示2个标签
      },
    },
    {
      name: "tag",
      label: "标签",
      type: "input",
      props: { placeholder: "输入标签关键词" },
    },
    // 使用两个独立的输入框替代
    {
      name: "minPermissionLevel",
      label: "最小权限",
      type: "inputNumber",
      props: { 
        placeholder: "最小值",
        min: 0,
        max: 100
      }
    },
    {
      name: "maxPermissionLevel",
      label: "最大权限",
      type: "inputNumber",
      props: { 
        placeholder: "最大值",
        min: 0,
        max: 100
      }
    },
    {
      name: "isActive",
      label: "状态",
      type: "select",
      options: [
        { value: "", label: "全部" },
        { value: "true", label: "启用" },
        { value: "false", label: "禁用" },
      ],
      props: { placeholder: "请选择状态" },
    },
    {
      name: "dateRange",
      label: "创建时间",
      type: "dateRange",
      props: {
        placeholder: ["开始日期", "结束日期"],
      },
    },
    // 添加有效期范围搜索
    {
      name: "validityRange", 
      label: "有效期",
      type: "dateRange",
      props: {
        placeholder: ["开始有效期", "结束有效期"],
      },
    },
    // 添加排序选项
    {
      name: "sortConfig",
      label: "排序方式",
      type: "select",
      options: [
        { value: "", label: "默认排序" },
        { value: "name_asc", label: "名称 (升序)" },
        { value: "name_desc", label: "名称 (降序)" },
        { value: "createdAt_desc", label: "创建时间 (最新)" },
        { value: "createdAt_asc", label: "创建时间 (最早)" },
        { value: "permissionLevel_desc", label: "权限级别 (高到低)" },
        { value: "permissionLevel_asc", label: "权限级别 (低到高)" },
      ],
      props: { placeholder: "选择排序方式" },
    },
  ];

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

  // 增强表格列定义
  const columns: ColumnType<UserGroup>[] = [
    {
      title: "用户组名称",
      dataIndex: "name",
      key: "name",
      width: 180,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text: string, record: UserGroup) => (
        <Space direction="vertical" size={0}>
          <Link to={`/user/groups/detail/${record.originalId || record.id}`}>
            <Text strong>{text}</Text>
          </Link>
          {record.tags && Array.isArray(record.tags) && record.tags.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {record.tags.map((tag) => (
                <Tag
                  key={tag}
                  color="cyan"
                  style={{ marginRight: 4, marginBottom: 2 }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "编码/类型",
      key: "codeAndType",
      width: 160,
      render: (_: any, record: UserGroup) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.code}</Tag>
          <div style={{ marginTop: 4 }}>
            {record.type === "PERMANENT" ? (
              <Tag color="green">永久组</Tag>
            ) : (
              <Tag color="orange">临时组</Tag>
            )}
            {record.businessType && (
              <Tag color="purple">
                {record.businessType === "DEPARTMENT" && "部门"}
                {record.businessType === "PROJECT" && "项目"}
                {record.businessType === "TEAM" && "团队"}
                {record.businessType === "ROLE" && "角色"}
                {record.businessType === "OTHER" && "其他"}
              </Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "数据权限",  // 修改列标题
      key: "dataScope",   // 更新key以反映实际内容
      width: 120,         // 减小宽度，因为内容减少了
      render: (_: any, record: UserGroup) => (
        <Space direction="vertical" size={0}>
          {record.dataScope ? (
            <Tag
              color={
                record.dataScope === "ALL"
                  ? "magenta"
                  : record.dataScope === "BRANCH"
                  ? "volcano"
                  : record.dataScope === "TEAM"
                  ? "geekblue"
                  : "default"
              }
            >
              {record.dataScope === "ALL" && "全部数据"}
              {record.dataScope === "BRANCH" && "分支数据"}
              {record.dataScope === "TEAM" && "团队数据"}
              {record.dataScope === "SELF" && "个人数据"}
            </Tag>
          ) : (
            <Text type="secondary">-</Text>
          )}
          {record.inheritPermissions && (
            <Tag color="cyan" style={{ marginTop: 4, marginLeft: 0 }}>继承权限</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text || "无描述"}>
          <span>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "有效期",
      key: "validity",
      width: 170,
      render: (_: any, record: UserGroup) => {
        // 检查是否过期
        const now = new Date();
        const validTo = record.validTo ? new Date(record.validTo) : null;
        const isExpired = validTo && now > validTo;

        return (
          <Space direction="vertical" size={0}>
            {record.type === "TEMPORARY" ? (
              <>
                <Text type={isExpired ? "danger" : undefined}>
                  {record.validFrom
                    ? new Date(record.validFrom).toLocaleDateString()
                    : ""}
                  {" 至 "}
                  {record.validTo
                    ? new Date(record.validTo).toLocaleDateString()
                    : "无限期"}
                </Text>
                {isExpired && <Tag color="red">已过期</Tag>}
                {record.autoExpire && <Tag color="orange">自动过期</Tag>}
              </>
            ) : (
              <Text type="secondary">永久有效</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "成员数",
      key: "membersCount",
      width: 90,
      render: (_: any, record: UserGroup) => (
        <Link to={`/user/group-members?groupId=${record.originalId || record.id}`}>
          <Button
            type="link"
            size="small"
            icon={<TeamOutlined />}
            style={{ padding: "0 4px" }}
          >
            {record._count?.members || record.membersCount || 0}
          </Button>
        </Link>
      ),
    },
    {
      title: "权限/安全",
      key: "permissionAndSecurity",
      width: 120,
      sorter: true, // 启用排序
      sortDirections: ['ascend', 'descend'],
      dataIndex: "permissionLevel", // 添加数据索引用于排序
      render: (_: any, record: UserGroup) => (
        <Space direction="vertical" size={0}>
          {record.permissionLevel !== undefined && (
            <Tooltip title="权限级别">
              <Progress
                percent={record.permissionLevel}
                size="small"
                format={(percent) => `${percent}`}
                status={
                  record.permissionLevel >= 80
                    ? "success"
                    : record.permissionLevel >= 40
                    ? "normal"
                    : "exception"
                }
              />
            </Tooltip>
          )}
          {record.securityLevel !== undefined && (
            <Tooltip title="安全级别">
              <div style={{ marginTop: 4 }}>
                <Tag
                  color={
                    record.securityLevel >= 8
                      ? "red"
                      : record.securityLevel >= 5
                      ? "orange"
                      : record.securityLevel >= 3
                      ? "blue"
                      : "green"
                  }
                >
                  安全等级 {record.securityLevel}
                </Tag>
                {record.visibility && (
                  <Tag
                    color={
                      record.visibility === "CONFIDENTIAL"
                        ? "red"
                        : record.visibility === "RESTRICTED"
                        ? "orange"
                        : record.visibility === "INTERNAL"
                        ? "blue"
                        : "green"
                    }
                  >
                    {record.visibility === "CONFIDENTIAL" && "机密"}
                    {record.visibility === "RESTRICTED" && "受限"}
                    {record.visibility === "INTERNAL" && "内部"}
                    {record.visibility === "PUBLIC" && "公开"}
                  </Tag>
                )}
              </div>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="success">启用</Tag>
        ) : (
          <Tag color="error">禁用</Tag>
        ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      sorter: true, // 启用排序
      sortDirections: ['ascend', 'descend'],
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
    // 优化操作列配置
    {
      title: "操作",
      key: "action",
      width: 180, // 减小列宽，从220减到180
      fixed: "right" as const,
      render: (_: any, record: UserGroup) => (
        <Space size={4} split={<span style={{ width: 2 }} />}>
          {/* 状态切换按钮 */}
          {record.isActive ? (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleStatusToggle(record, false)}
              style={{ padding: '0', height: '22px', lineHeight: '22px' }}
            >
              <StopOutlined style={{ marginRight: 0 }} />
              禁用
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusToggle(record, true)}
              style={{ padding: '0', height: '22px', lineHeight: '22px' }}
            >
              <CheckCircleOutlined style={{ marginRight: 2 }} />
              启用
            </Button>
          )}
    
          {/* 编辑按钮 */}
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleEdit(record)}
            style={{ padding: '0', height: '22px', lineHeight: '22px' }}
          >
            <EditOutlined style={{ marginRight: 0 }} />
            编辑
          </Button>
    
          {/* 删除按钮 */}
          <Popconfirm
            title="确定删除此用户组吗?"
            description="删除后不可恢复，组内成员将失去相关权限"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small" 
              danger
              style={{ padding: '0', height: '22px', lineHeight: '22px' }}
            >
              <DeleteOutlined style={{ marginRight: 0 }} />
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* 用户组搜索面板 */}
      <GenericPanelSearch
        title="用户组搜索"
        searchItems={searchItems}
        columns={3}
        onSearch={handleSearch}
        labelWidth={80}
        collapseThreshold={4} // 当搜索条件过多时，启用折叠功能
      />

      {/* 用户组列表面板 */}
      <GenericPanelTable
        title="用户组列表"
        key={tableKey}
        buttons={tableButtons}
        loading={loading}
        refreshData={fetchData}
        pagination={pagination}
        resizableColumns={true}
        saveColumnWidths={true}
        onPaginationChange={setPagination}
        showColumnSetting={true} // 可选，默认为true
        storageKey="userGroupColumnVisibility" // 可选，指定存储键
        tableProps={{
          rowKey: "id",
          columns,
          dataSource: data,
          scroll: { x: 1200 },
          onChange: (pagination, filters, sorter) => {
            // 处理排序变更
            if (sorter && 'field' in sorter && 'order' in sorter) {
              const sortBy = sorter.field as string;
              const sortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
              setSortInfo({ sortBy, sortDirection });
            }
          },
          expandable: {
            expandedRowKeys: expandedRowKeys,
            onExpand: handleExpand,
            rowExpandable: (record) => Boolean(record.hasChildren),
            indentSize: 20,
          },
        }}
        cardProps={{
          style: { marginTop: 16 },
        }}
      />

      {/* 用户组表单模态框 */}
      <UserGroupFormModal
        visible={formVisible}
        currentGroup={currentGroup}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
        layout="horizontal"         
        labelCol={{ span: 6 }}      
        wrapperCol={{ span: 18 }}   
      />
    </>
  );
};

export default UserGroupList;

import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  message,
  Button,
  Typography,
  Space,
  Table,
  Avatar,
  Tag,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import GenericPanelTree, {
  TreeNodeData,
} from "../../components/generic/GenericPanelTree";
import GenericPanelTable, {
  TableButtonConfig,
} from "../../components/generic/GenericPanelTable";
import TransferUserModal from "./TransferUserModal";
import {
  getUserGroups,
  getUserGroupMembers,
  removeUserGroupMember,
} from "../../service/userGroupService";
import { getUsers } from "../../service/userService";
import { useSearchParams, useLocation } from "react-router-dom";

const { Title, Text } = Typography;

// 用户组节点类型
interface UserGroupNode {
  id: string;
  name: string;
  key: string;
  title: string;
  children?: UserGroupNode[];
  parentId?: string;
  isLeaf?: boolean;
  [key: string]: any;
}

// 用户类型
interface User {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  [key: string]: any;
}

// 转换为TransferItemData类型
interface TransferItemData {
  id: string;
  key: string;
  title: string;
  description?: string;
  avatar?: string;
  userData?: any;
}

const GroupMemberManagement: React.FC = () => {
  // 获取URL参数
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const groupIdFromUrl = searchParams.get("groupId");

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 状态定义
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroupNode | null>(
    null
  );
  const [transferModalVisible, setTransferModalVisible] =
    useState<boolean>(false);
  const [groupMembers, setGroupMembers] = useState<TransferItemData[]>([]);
  const [allUsers, setAllUsers] = useState<TransferItemData[]>([]);
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [memberTableLoading, setMemberTableLoading] = useState<boolean>(false);
  const [componentHeight, setComponentHeight] = useState<number>(600);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // 在组件初始化时打印参数信息
  useEffect(() => {
    console.log("🔍 接收到的 URL 参数:", groupIdFromUrl);
  }, [groupIdFromUrl, location]);

  // 获取用户组树数据
  const fetchUserGroupTree = async () => {
    try {
      setTreeLoading(true);
      const response = await getUserGroups({ tree: true });

      if (response?.data?.data) {
        // 构建用户组树
        const nodeMap = new Map<string, any>();

        const dataArray = (response as any)?.data?.data || [];
        dataArray.forEach((node: any) => {
          nodeMap.set(node.id, { ...node, children: [] });
        });

        const treeData: TreeNodeData[] = [];

        nodeMap.forEach((node) => {
          if (node.parentId && nodeMap.has(node.parentId)) {
            nodeMap.get(node.parentId).children.push(node);
          } else {
            treeData.push(node);
          }
        });

        // 处理节点
        const processNode = (node: any, path: string = ""): TreeNodeData => {
          const currentPath = path ? `${path}-${node.id}` : node.id;

          const children =
            node.children && node.children.length > 0
              ? node.children.map((child: any) =>
                  processNode(child, currentPath)
                )
              : undefined;

          return {
            key: currentPath,
            title: node.name,
            id: node.id,
            name: node.name,
            parentId: node.parentId,
            isLeaf: !children,
            children: children,
          };
        };

        const processedData = treeData.map((node) => processNode(node));

        setTreeData(processedData);
      } else {
        setTreeData([]);
      }
    } catch (error) {
      console.error("获取用户组结构失败:", error);
      message.error("获取用户组结构失败");
      setTreeData([]);
    } finally {
      setTreeLoading(false);
    }
  };

  // 获取组成员和可用用户数据
  const fetchGroupMembersAndUsers = async (groupId: string) => {
    try {
      setMemberTableLoading(true);

      // 获取组成员
      const membersResponse = await getUserGroupMembers(groupId);
      console.log("组成员API响应:", membersResponse);

      // 处理组成员数据 - 增强数据处理逻辑
      let members: any[] = [];
      const memberData: TransferItemData[] = [];

      // 确定从响应中获取数据的正确路径
      if (membersResponse?.data) {
        if (
          membersResponse.data.data &&
          Array.isArray(membersResponse.data.data)
        ) {
          members = membersResponse.data.data;
          console.log(
            "从 response.data.data 中提取了成员数组:",
            members.length
          );
        } else if (
          (membersResponse as any)?.data?.items &&
          Array.isArray((membersResponse as any).data.items)
        ) {
          members = (membersResponse as any).data.items;
          console.log(
            "从 response.data.items 中提取了成员数组:",
            members.length
          );
        } else if (Array.isArray(membersResponse.data)) {
          members = membersResponse.data;
          console.log("直接从 response.data 中提取了成员数组:", members.length);
        } else if (typeof membersResponse.data === "object") {
          members = [membersResponse.data];
          console.log("从单个对象创建了成员数组");
        }
      } else if (Array.isArray(membersResponse)) {
        members = membersResponse;
        console.log("直接从 response 中提取了成员数组:", members.length);
      }

      // 处理每个成员数据
      members.forEach((item: any) => {
        const user = item.user || item;

        if (user) {
          const userId = user.id || user._id || user.userId;
          if (userId) {
            memberData.push({
              id: userId,
              key: userId,
              title:
                user.nickname ||
                user.username ||
                user.name ||
                user.email ||
                user.phone ||
                `用户(${userId.toString().substr(0, 8)})`,
              description: user.email || user.phone || user.username || "",
              avatar: user.avatar,
              userData: {
                // 先展开原始用户对象
                ...user,
                // 然后添加/覆盖特定属性
                username: user.username || "",
                nickname: user.nickname || user.name || "",
                email: user.email || "",
                phone: user.phone || user.phoneNumber || "",
                avatar: user.avatar || "",
                status: user.status || (user.isActive ? "active" : "inactive"),
              },
            });
          }
        }
      });

      console.log("处理后的组成员数据:", memberData);
      setGroupMembers(memberData);

      // 打开转移模态框时才获取所有用户
      if (transferModalVisible) {
        setTransferLoading(true);
        try {
          // 获取所有用户
          const usersResponse = await getUsers({ limit: 1000 });

          // 处理所有用户
          const memberIds = memberData.map((member) => member.id);
          const userData: TransferItemData[] = [];

          let allUsers: any[] = [];

          // 确定从响应中获取数据的正确路径
          if (usersResponse?.data) {
            const usersData = (usersResponse as any)?.data;
            if (Array.isArray(usersData?.data)) {
              allUsers = usersData.data;
            } else if (Array.isArray(usersData?.items)) {
              allUsers = usersData.items;
            } else if (Array.isArray(usersData)) {
              allUsers = usersData;
            }
          } else if (Array.isArray(usersResponse)) {
            allUsers = usersResponse;
          }

          allUsers
            .filter((user: User) => {
              const userId = user.id || user._id || user.userId;
              return userId && !memberIds.includes(userId);
            })
            .forEach((user: User) => {
              const userId = user.id || user._id || user.userId;
              if (userId) {
                userData.push({
                  id: userId,
                  key: userId,
                  title:
                    user.nickname ||
                    user.username ||
                    user.name ||
                    user.email ||
                    user.phone ||
                    `用户(${userId.toString().substr(0, 8)})`,
                  description: user.email || user.phone || user.username || "",
                  avatar: user.avatar,
                  userData: user,
                });
              }
            });

          setAllUsers(userData);
        } finally {
          setTransferLoading(false);
        }
      }
    } catch (error) {
      console.error("获取用户组成员或用户列表失败:", error);
      message.error("获取用户组成员或用户列表失败");
    } finally {
      setMemberTableLoading(false);
    }
  };

  // 打开转移模态框前获取所有用户
  const handleOpenTransferModal = async () => {
    if (!selectedGroup) {
      message.warning("请先选择用户组");
      return;
    }

    setTransferModalVisible(true);

    try {
      setTransferLoading(true);
      const usersResponse = await getUsers({ limit: 1000 });
      console.log("所有用户API响应:", usersResponse);

      // 处理所有用户 - 增强数据处理逻辑
      const memberIds = groupMembers.map((member) => member.id);
      const userData: TransferItemData[] = [];

      let allUsers: any[] = [];

      // 确定从响应中获取数据的正确路径
      if (usersResponse?.data) {
        if (usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          allUsers = usersResponse.data.data;
          console.log(
            "从 response.data.data 中提取了用户数组:",
            allUsers.length
          );
        } else if (
          (usersResponse as any)?.data?.items &&
          Array.isArray((usersResponse as any).data.items)
        ) {
          allUsers = (usersResponse as any).data.items;
          console.log(
            "从 response.data.items 中提取了用户数组:",
            allUsers.length
          );
        } else if (Array.isArray(usersResponse.data)) {
          allUsers = usersResponse.data;
          console.log(
            "直接从 response.data 中提取了用户数组:",
            allUsers.length
          );
        }
      } else if (Array.isArray(usersResponse)) {
        allUsers = usersResponse;
        console.log("直接从 response 中提取了用户数组:", allUsers.length);
      }

      allUsers
        .filter((user: User) => {
          const userId = user.id || user._id || user.userId;
          return userId && !memberIds.includes(userId);
        })
        .forEach((user: User) => {
          const userId = user.id || user._id || user.userId;
          if (userId) {
            userData.push({
              id: userId,
              key: userId,
              title:
                user.nickname ||
                user.username ||
                user.name ||
                user.email ||
                user.phone ||
                `用户(${userId.toString().substr(0, 8)})`,
              description: user.email || user.phone || user.username || "",
              avatar: user.avatar,
              userData: {
                // 先展开原始用户对象
                ...user,
                // 然后添加/覆盖特定属性
                username: user.username || "",
                nickname: user.nickname || user.name || "",
                email: user.email || "",
                phone: user.phone || user.phoneNumber || "",
                avatar: user.avatar || "",
                status: user.status || (user.isActive ? "active" : "inactive"),
              },
            });
          }
        });

      console.log("处理后的可选用户数据:", userData);
      setAllUsers(userData);
    } catch (error) {
      console.error("获取用户列表失败:", error);
      message.error("获取用户列表失败");
    } finally {
      setTransferLoading(false);
    }
  };

  // 移除组成员
  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) {
      message.warning("请先选择用户组");
      return;
    }

    try {
      await removeUserGroupMember(selectedGroup.id, userId);
      message.success("成员已从组中移除");
      fetchGroupMembersAndUsers(selectedGroup.id);
    } catch (error) {
      console.error("移除组成员失败:", error);
      message.error("移除组成员失败");
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
          gapHeight -
          32;
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
    fetchUserGroupTree();
  }, []);

  // 处理URL参数指定的组
  useEffect(() => {
    if (groupIdFromUrl && treeData.length > 0) {
      console.log("尝试根据URL参数自动选择组:", groupIdFromUrl);

      const findGroupInTree = (nodes: TreeNodeData[]): TreeNodeData | null => {
        for (const node of nodes) {
          if (node.id === groupIdFromUrl) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findGroupInTree(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const targetGroup = findGroupInTree(treeData);

      if (targetGroup) {
        console.log("自动选择组:", targetGroup.name || targetGroup.title);

        setSelectedKeys([targetGroup.key]);

        setSelectedGroup({
          id: targetGroup.id,
          key: targetGroup.key,
          name: targetGroup.name || targetGroup.title,
          title: targetGroup.title,
          parentId: targetGroup.parentId,
        });

        fetchGroupMembersAndUsers(targetGroup.id);
      } else {
        console.log("未找到匹配的组:", groupIdFromUrl);
      }
    }
  }, [groupIdFromUrl, treeData]);

  // 选择用户组
  const handleSelectGroup = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);

    if (selectedKeys.length === 0) {
      setSelectedGroup(null);
      setGroupMembers([]);
      setAllUsers([]);
      return;
    }

    const nodeData = info.node;
    const groupId = nodeData.id;

    setSelectedGroup({
      id: groupId,
      key: nodeData.key,
      name: nodeData.name || nodeData.title,
      title: nodeData.title,
      parentId: nodeData.parentId,
    });

    fetchGroupMembersAndUsers(groupId);
  };

  // 用户表格列定义
  const userColumns = [
    {
      title: "用户信息",
      dataIndex: "userData",
      key: "userData",
      width: 200,
      render: (userData: any) => {
        if (!userData) return <Text type="secondary">无用户数据</Text>;

        return (
          <Space>
            <Avatar
              src={userData.avatar}
              icon={<UserOutlined />}
              size="small"
            />
            <Space direction="vertical" size={0}>
              <Text strong>
                {userData.nickname ||
                  userData.username ||
                  userData.name ||
                  "未命名"}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {userData.username || userData.id?.substr(0, 8) || ""}
              </Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "联系方式",
      dataIndex: "userData",
      key: "contact",
      render: (userData: any) => {
        if (!userData) return <Text type="secondary">-</Text>;

        return (
          <Space direction="vertical" size={0}>
            {userData.email && (
              <Space size="small">
                <MailOutlined style={{ color: "#1890ff" }} />
                <Text>{userData.email}</Text>
              </Space>
            )}
            {(userData.phone || userData.phoneNumber) && (
              <Space size="small">
                <PhoneOutlined style={{ color: "#52c41a" }} />
                <Text>{userData.phone || userData.phoneNumber}</Text>
              </Space>
            )}
            {!userData.email && !userData.phone && !userData.phoneNumber && (
              <Text type="secondary">未设置联系方式</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "userData",
      key: "status",
      width: 120,
      render: (userData: any) => {
        if (!userData) return <Tag color="default">未知</Tag>;

        const status =
          userData.status || (userData.isActive ? "active" : "inactive");

        return (
          <Tag color={status === "active" ? "success" : "default"}>
            {status === "active" ? "启用" : "禁用"}
          </Tag>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: any, record: TransferItemData) => (
        <Popconfirm
          title="确定从该组移除此用户吗?"
          onConfirm={() => handleRemoveMember(record.id)}
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
        selectedGroup && fetchGroupMembersAndUsers(selectedGroup.id),
      text: "刷新",
      disabled: !selectedGroup,
    },
    {
      key: "add",
      type: "primary",
      ghost: true,
      icon: <PlusOutlined />,
      onClick: handleOpenTransferModal,
      text: "添加",
      disabled: !selectedGroup,
    },
  ];

  // 自定义展开/折叠图标
  const customSwitcherIcon = (props: any) => {
    if (props.expanded) {
      return <CaretDownOutlined style={{ color: "#1890ff" }} />;
    }
    return <CaretRightOutlined style={{ color: "#1890ff" }} />;
  };

  // 自定义样式
  const customStyles = `
  .group-member-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 152px); /* 减去头部和尾部的高度 */
  }
  
  .user-group-row {
    flex: 1;
    height: 100%;
  }
  
  .user-group-col {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .user-group-col .ant-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .user-group-col .ant-card .ant-card-body {
    flex: 1;
    overflow: hidden !important; /* 改为hidden，防止整体滚动 */
    padding: 12px 24px 12px 24px !important; /* 增加四周边距 */
    display: flex;
    flex-direction: column;
  }
  
  /* 搜索框固定在顶部 */
  .tree-search-container {
    margin-bottom: 16px;
    flex-shrink: 0;
  }
  
  /* 树容器自适应高度并滚动 */
  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 0 0 12px;
  }
  
  .tree-panel .ant-tree-treenode {
    padding: 4px 4px 4px 0 !important;
  }
  
  .tree-panel .ant-tree-switcher {
    background: transparent !important;
  }
  
  .tree-panel .ant-tree-switcher .anticon {
    transition: none !important;
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

  // 仅在选择了组时显示成员表格标题
  const tableTitle = selectedGroup
    ? `"${selectedGroup.name}" 组成员列表 (${groupMembers.length}人)`
    : "组成员列表";

  return (
    <>
      <style>{customStyles}</style>
      <div className="group-member-page">
        <Row gutter={[16, 16]} className="user-group-row">
          <Col xs={24} sm={24} md={8} lg={6} xl={5} className="user-group-col">
            <GenericPanelTree
              title="用户组结构"
              buttons={[
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                  onClick={fetchUserGroupTree}
                  loading={treeLoading}
                  type="link"
                >
                  刷新
                </Button>,
              ]}
              treeData={treeData}
              loading={treeLoading}
              onSelect={handleSelectGroup}
              showLine={false}
              showIcon={false}
              defaultExpandAll={true}
              height="100%" // 保持100%高度
              switcherIcon={customSwitcherIcon as any}
              selectedKeys={selectedKeys}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={16}
            lg={18}
            xl={19}
            className="user-group-col"
          >
            <GenericPanelTable
              title={tableTitle}
              buttons={tableButtons}
              loading={memberTableLoading}
              refreshData={
                selectedGroup
                  ? () => fetchGroupMembersAndUsers(selectedGroup.id)
                  : undefined
              }
              tableProps={{
                rowKey: "id",
                columns: userColumns,
                dataSource: groupMembers.map((member) => ({
                  ...member,
                  key: member.id,
                })),
                pagination: {
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                },
                locale: {
                  emptyText: selectedGroup
                    ? '该组暂无成员，点击"添加成员"按钮添加'
                    : "请先选择左侧的用户组",
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
                  }
                },
              }}
              showColumnSetting={false}
            />
          </Col>
        </Row>
      </div>

      {/* 转移用户弹窗 */}
      <TransferUserModal
        visible={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onSuccess={() => {
          setTransferModalVisible(false);
          selectedGroup && fetchGroupMembersAndUsers(selectedGroup.id);
        }}
        groupId={selectedGroup?.id}
        groupName={selectedGroup?.name}
        currentMembers={groupMembers}
        allUsers={allUsers}
        loading={transferLoading}
      />
    </>
  );
};

export default GroupMemberManagement;

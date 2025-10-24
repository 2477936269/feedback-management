import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Modal,
  Transfer,
  Spin,
} from "antd";
import type { TransferDirection, TransferItem } from "antd/es/transfer";
import {
  PlusOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserGroupMembers,
  removeUserGroupMember,
  updateUserGroupMemberStatus,
  addUserGroupMembers,
} from "../../service/userGroupService";
import { getUsers } from "../../service/userService";

const { Title, Text } = Typography;

// 修复接口定义，删除重复字段和错误语法
interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  isActive: boolean;
}

interface GroupMember {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  isManager: boolean;
  joinedAt: string;
}

const UserGroupMembers: React.FC = () => {
  const { groupId = "" } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState<string>("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // 使用 React.Key 类型
  const [selectedUserIds, setSelectedUserIds] = useState<React.Key[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);

  // 获取用户组成员
  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const response = await getUserGroupMembers(groupId);

      let membersList: any[] = [];
      let groupInfo = null;

      // 使用类型断言简化数据访问
      const responseData = (response as any)?.data;
      if (Array.isArray(responseData)) {
        membersList = responseData;
      } else if (responseData) {
        membersList = responseData.items || responseData.members || [];
        groupInfo = responseData.groupInfo || null;
      }

      if (groupInfo && groupInfo.name) {
        setGroupName(groupInfo.name);
      }

      const processedMembers = membersList.map((member: any) => ({
        ...member,
        fullName:
          member.fullName ||
          member.nickname ||
          (member.lastName || member.firstName
            ? `${member.lastName || ""}${member.firstName || ""}`
            : member.username),
      }));

      setMembers(processedMembers);
    } catch (error) {
      console.error("获取用户组成员失败:", error);
      message.error("获取用户组成员失败");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 移除成员
  const handleRemoveMember = async (userId: string) => {
    try {
      await removeUserGroupMember(groupId, userId);
      message.success("成员已移除");
      fetchMembers();
    } catch (error) {
      console.error("移除成员失败:", error);
      message.error("移除成员失败");
    }
  };

  // 更改成员管理员状态
  const handleToggleManager = async (userId: string, isManager: boolean) => {
    try {
      await updateUserGroupMemberStatus(
        groupId,
        userId,
        !isManager ? "manager" : "member"
      );
      message.success(isManager ? "已移除管理员权限" : "已设置为管理员");
      fetchMembers();
    } catch (error) {
      console.error("更新管理员状态失败:", error);
      message.error("更新管理员状态失败");
    }
  };

  // 打开添加成员模态框
  const handleAddMemberClick = async () => {
    try {
      setTransferLoading(true);
      setAddMemberVisible(true);

      const response = await getUsers({ isActive: true });

      let users: User[] = [];
      // 使用类型断言简化数据访问
      const responseData = (response as any)?.data;
      if (Array.isArray(responseData)) {
        users = responseData;
      } else if (responseData) {
        users = responseData.data || responseData.items || [];
      }

      const memberUserIds = members.map((member) => member.userId);
      const filteredUsers = users.filter(
        (user) => !memberUserIds.includes(user.id)
      );

      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("获取可用用户失败:", error);
      message.error("获取可用用户失败");
    } finally {
      setTransferLoading(false);
    }
  };

  // 添加选中的用户为成员
  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) {
      message.warning("请选择至少一名用户");
      return;
    }

    try {
      // 将 React.Key[] 转换为 string[] 以适应API
      const userIds = selectedUserIds.map((id) => String(id));

      await addUserGroupMembers(groupId, {
        userIds,
        isManager: false,
      });
      message.success("成员添加成功");
      setAddMemberVisible(false);
      setSelectedUserIds([]);
      fetchMembers();
    } catch (error) {
      console.error("添加成员失败:", error);
      message.error("添加成员失败");
    }
  };

  // 返回用户组列表
  const handleBackToGroups = () => {
    navigate("/user/groups");
  };

  // 使用 React.Key 类型
  const handleTransferChange = (
    targetKeys: React.Key[],
    direction: TransferDirection,
    moveKeys: React.Key[]
  ) => {
    setSelectedUserIds(targetKeys);
  };

  // 处理筛选逻辑
  const handleFilterOption = (
    inputValue: string,
    option: TransferItem,
    direction?: TransferDirection
  ): boolean => {
    const itemTitle = String(option.title || "");
    const itemDesc = String(option.description || "");
    const input = inputValue.toLowerCase();

    return (
      itemTitle.toLowerCase().indexOf(input) !== -1 ||
      itemDesc.toLowerCase().indexOf(input) !== -1
    );
  };

  // 表格列定义
  const columns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 160,
    },
    {
      title: "姓名",
      dataIndex: "fullName",
      key: "fullName",
      width: 160,
      render: (text: string) => text || "-",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (text: string) => text || "-",
    },
    {
      title: "角色",
      dataIndex: "isManager",
      key: "isManager",
      width: 120,
      render: (isManager: boolean) =>
        isManager ? <Tag color="green">管理员</Tag> : <Tag>普通成员</Tag>,
    },
    {
      title: "加入时间",
      dataIndex: "joinedAt",
      key: "joinedAt",
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
      width: 200,
      render: (_: React.ReactNode, record: GroupMember) => (
        <Space size="small">
          <Button
            type="text"
            icon={
              record.isManager ? (
                <StarFilled style={{ color: "#faad14" }} />
              ) : (
                <StarOutlined />
              )
            }
            onClick={() => handleToggleManager(record.userId, record.isManager)}
          >
            {record.isManager ? "取消管理员" : "设为管理员"}
          </Button>
          <Popconfirm
            title="确定要移除此成员吗?"
            onConfirm={() => handleRemoveMember(record.userId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              移除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToGroups}>
            返回用户组
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {groupName || "用户组"} - 成员管理
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMemberClick}
        >
          添加成员
        </Button>
      </div>

      <Table
        dataSource={members}
        columns={columns}
        rowKey="userId"
        loading={loading}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        locale={{ emptyText: "该用户组暂无成员" }}
      />

      {/* 添加成员模态框 */}
      <Modal
        title="添加成员"
        open={addMemberVisible}
        onOk={handleAddMembers}
        onCancel={() => {
          setAddMemberVisible(false);
          setSelectedUserIds([]);
        }}
        width={700}
        okText="添加"
        cancelText="取消"
        okButtonProps={{ disabled: selectedUserIds.length === 0 }}
        destroyOnClose
      >
        <Spin spinning={transferLoading}>
          {availableUsers.length === 0 && !transferLoading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Text type="secondary">
                没有可添加的用户，所有用户已在用户组中
              </Text>
            </div>
          ) : (
            <Transfer
              dataSource={availableUsers.map((user) => ({
                key: user.id,
                title: user.nickname || user.username,
                description: user.email || user.username,
                disabled: false,
              }))}
              titles={["可选用户", "已选用户"]}
              targetKeys={selectedUserIds}
              onChange={handleTransferChange}
              filterOption={handleFilterOption}
              showSearch
              listStyle={{
                width: 300,
                height: 400,
              }}
              render={(item) => (
                <div>
                  <div>{item.title}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {item.description}
                  </div>
                </div>
              )}
              locale={{
                searchPlaceholder: "搜索用户",
                notFoundContent: "无匹配用户",
                itemUnit: "项",
                itemsUnit: "项",
              }}
            />
          )}
        </Spin>
      </Modal>
    </Card>
  );
};

export default UserGroupMembers;

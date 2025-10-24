import React from "react";
import {
  PlusOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  GenericPanelSearch,
  GenericPanelTable,
  GenericModalForm,
  GenericStatisticCards,
  StatisticCardConfig,
} from "../components/generic";

// 导入配置和hooks
import {
  searchItems,
  getFormItems,
  getStatisticCardsConfig,
  getTableColumnsConfig,
  getTableButtonsConfig,
} from "./config";
import useUserManagement from "./hooks/useUserManagement";

const UserManagement: React.FC = () => {
  const {
    modalVisible,
    editingUser,
    isEditMode,
    users,
    loading,
    handleSearch,
    handleRefresh,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleFormSubmit,
    handleFormCancel,
  } = useUserManagement();

  // 图标映射
  const iconMap = {
    UserOutlined: <UserOutlined />,
    LockOutlined: <LockOutlined />,
    MailOutlined: <MailOutlined />,
    PlusOutlined: <PlusOutlined />,
    ReloadOutlined: <ReloadOutlined />,
  };

  // 获取统计卡片配置并添加图标和数值
  const statisticCardsData: StatisticCardConfig[] = getStatisticCardsConfig(
    users
  ).map((item: any) => {
    let value: number;
    switch (item.key) {
      case "totalUsers":
        value = users.length;
        break;
      case "activeUsers":
        value = users.filter((user: any) => user.status === "active").length;
        break;
      case "inactiveUsers":
        value = users.filter((user: any) => user.status === "inactive").length;
        break;
      case "recentUsers":
        value = users.filter((user: any) => {
          const createdAt = new Date(user.createdAt);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return createdAt >= oneWeekAgo;
        }).length;
        break;
      default:
        value = 0;
    }

    // 确保值不是NaN，如果是NaN则显示0
    if (isNaN(value) || !isFinite(value)) {
      value = 0;
    }

    return {
      ...item,
      value,
      prefix: iconMap[item.iconName as keyof typeof iconMap],
    };
  });

  return (
    <div className="user-management">
      {/* 统计卡片 */}
      <GenericStatisticCards
        configs={statisticCardsData}
      />

      {/* 搜索面板 */}
      <GenericPanelSearch
        searchItems={searchItems}
        onSearch={handleSearch}
      />

      {/* 表格 */}
      <GenericPanelTable
        tableProps={{
          dataSource: users,
          columns: getTableColumnsConfig({
            onEdit: handleEditUser,
            onDelete: handleDeleteUser,
          }),
          rowKey: "id",
          loading: loading,
        }}
        buttons={getTableButtonsConfig({
          onAdd: handleAddUser,
          onRefresh: handleRefresh,
        })}
      />

      {/* 用户表单模态框 */}
      <GenericModalForm
        visible={modalVisible}
        title={isEditMode ? "编辑用户" : "添加用户"}
        formItems={getFormItems(isEditMode)}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        onCancel={handleFormCancel}
        onSubmit={handleFormSubmit}
        initialValues={
          editingUser
            ? {
                form_username: editingUser.username,
                form_phone: editingUser.phone,
                form_status: editingUser.status,
              }
            : undefined
        }
        width={600}
      />
    </div>
  );
};

export default UserManagement;

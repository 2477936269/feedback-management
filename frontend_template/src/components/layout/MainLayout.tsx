import React, { useState, useEffect } from "react";
import { Layout, Menu, theme, Dropdown, Avatar, Space, App } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getMenuItems, AppRoute } from "../../routes";
import BreadcrumbNav from "./BreadcrumbNav";
import { layoutConfig, getUserMenuItems } from "../../config/layoutConfig";
import ChangePasswordModal from "../ChangePasswordModal";

// 导入SVG图标
import LogoSvg from "../../assets/Logo.svg";

const { Header, Sider, Content, Footer } = Layout;

// 定义更明确的菜单项类型
type MenuItem = {
  key: React.Key;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // 获取当前用户信息
  const fetchCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);
      } else {
        // 如果本地没有用户信息，尝试从sessionStorage获取
        const sessionUserStr = sessionStorage.getItem("user");
        if (sessionUserStr) {
          const userData = JSON.parse(sessionUserStr);
          setCurrentUser(userData);
        }
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  // 组件挂载时获取用户信息
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 添加退出登录处理函数
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
    message.success(layoutConfig.messages.logoutSuccess);
  };

  // 添加修改密码处理函数
  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordModalCancel = () => {
    setPasswordModalVisible(false);
  };

  const handlePasswordModalSuccess = () => {
    // 修改密码成功后的处理
    setPasswordModalVisible(false);
    message.success('密码修改成功，请使用新密码重新登录');
    // 可以选择自动退出登录
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  // 使用配置创建用户菜单
  const userMenuItems = getUserMenuItems(navigate, handleLogout, handleChangePassword);

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    const pathParts = path.slice(1).split("/");

    if (pathParts.length === 1) {
      return [pathParts[0]];
    }

    if (pathParts.length > 1) {
      const possibleKey = `${pathParts[0]}.${pathParts[1]}`;
      return [possibleKey];
    }

    return [layoutConfig.defaults.selectedMenuKey];
  };

  // 将菜单项转换为Ant Design Menu组件需要的items格式
  const convertToMenuItems = (
    menuItems: AppRoute[],
    parentPath: string = ""
  ): MenuItem[] => {
    return menuItems.map((item) => {
      const currentPath = parentPath ? `${parentPath}/${item.path}` : item.path;
      const key = String(item.key);

      if (item.children && item.children.length > 0) {
        return {
          key,
          icon: item.icon,
          label: item.label,
          children: convertToMenuItems(item.children, item.path),
        };
      }

      return {
        key,
        icon: item.icon,
        label: item.label,
        onClick: () => navigate(`/${currentPath}`),
      };
    });
  };

  const menuItems = getMenuItems();
  const items = convertToMenuItems(menuItems);

  const getAllTopLevelMenuKeys = () => {
    return menuItems.map((item) => String(item.key));
  };

  // 合并样式
  const getSiderLogoStyle = () => {
    return {
      ...layoutConfig.styles.siderLogo,
      ...(collapsed ? layoutConfig.styles.siderLogoCollapsed : {}),
      borderBottom: `1px solid rgb(60, 60, 60)`,
      color: token.colorPrimary,
    };
  };

  // Style for the logo SVG to make it white
  const logoStyle = {
    height: collapsed ? 32 : 28,
    marginRight: collapsed ? 0 : 12,
    transition: "all 0.2s",
    filter: "brightness(0) invert(1)", // This makes the SVG white
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={getSiderLogoStyle()}>
          <img
            src={LogoSvg}
            alt={layoutConfig.system.logoAlt}
            style={logoStyle}
          />
          {!collapsed && (
            <span style={layoutConfig.styles.systemTitle}>
              {layoutConfig.system.name}
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          className="custom-menu"
          defaultSelectedKeys={[layoutConfig.defaults.selectedMenuKey]}
          selectedKeys={getSelectedKey()}
          defaultOpenKeys={collapsed ? [] : getAllTopLevelMenuKeys()}
          items={items}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "64px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{ padding: "0 24px", cursor: "pointer" }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
              <BreadcrumbNav style={{ margin: 0 }} />
            </div>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ padding: "0 24px", cursor: "pointer" }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: token.colorPrimary }}
                />
                <span>
                  {currentUser?.name || currentUser?.username || '未登录用户'}
                </span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "16px" }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: "center" }}>
          {layoutConfig.footer.copyright} ©{new Date().getFullYear()}{" "}
          {layoutConfig.footer.company}
        </Footer>
      </Layout>

      {/* 修改密码弹窗 */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onCancel={handlePasswordModalCancel}
        onSuccess={handlePasswordModalSuccess}
      />
    </Layout>
  );
};

export default MainLayout;

// 定义layout的配置
// 定义layout的配置
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import React from 'react';

// 菜单项类型
export interface UserMenuItem {
  key: string;
  icon?: React.ReactNode | string;
  label: string;
  path?: string;
  type?: 'divider';
  onClick?: () => void;
}

const createIcon = (IconComponent: any) => React.createElement(IconComponent);

export const layoutConfig = {
  // 系统信息
  system: {
    name: "反馈管理系统",
    shortName: "反馈管理", // 较短的名称
    logo: "/src/assets/Logo.svg", // Logo路径，如需使用
    logoAlt: "秋果反馈管理系统LOGO"
  },

  // 页脚信息
  footer: {
    copyright: "反馈管理系统",
    company: "idTree微服务平台",
  },

  // 用户菜单
  userMenu: {
    items: [
      {
        key: 'profile',
        icon: createIcon(UserOutlined),
        label: '个人信息',
        path: '/account/profile',
      },
      {
        key: 'settings',
        icon: createIcon(SettingOutlined),
        label: '修改密码',
        path: '/account/settings',
      },
      {
        type: 'divider',
        key: 'divider',
        label: '',
      },
      {
        key: 'logout',
        icon: createIcon(LogoutOutlined),
        label: '退出登录',
        path: '/login',
      },
    ],
  },

  // 消息提示
  messages: {
    logoutSuccess: '退出登录成功',
  },

  // 默认值
  defaults: {
    selectedMenuKey: 'dashboard',
  },

  // 样式配置
  styles: {
    siderLogo: {
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0 16px',
      overflow: 'hidden',
    },
    siderLogoCollapsed: {
      justifyContent: 'center',
      padding: 0,
    },
    systemTitle: {
      fontSize: '16px',           // 增大字体
      fontWeight: '400',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'opacity 0.3s',
      maxWidth: '200px'           // 增大最大宽度以适应更长的标题
    }
  }
};

// 辅助函数：获取图标组件
export const getUserMenuItems = (
  navigate: (path: string) => void,
  handleLogout: () => void,
  handleChangePassword?: () => void
) => {
  return layoutConfig.userMenu.items.map(item => {
    if (item.type === 'divider') {
      return { type: 'divider' as const };
    }

    // 特殊处理退出登录按钮
    if (item.key === 'logout') {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: handleLogout,
      };
    }

    // 特殊处理修改密码按钮
    if (item.key === 'settings' && handleChangePassword) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: handleChangePassword,
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
      onClick: () => navigate(item.path || '/'),
    };
  });
};

export default layoutConfig;
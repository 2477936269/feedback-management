import React from "react"; // 导入React
import { Navigate } from "react-router-dom"; // 导入路由导航组件
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  MessageOutlined,
  ToolOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  TagOutlined,
} from "@ant-design/icons"; // 导入图标

// 导入组件
import MainLayout from "./components/layout/MainLayout"; // 导入主布局组件

import Dashboard from "./pages/dashboard/Dashboard"; // 导入仪表盘组件
import UserList from "./pages/user-list"; // 导入用户列表组件
import Profile from "./pages/profile/index"; // 导入个人中心组件

// 反馈管理相关页面
import FeedbackList from "./pages/feedback-list/index";
import FeedbackProcess from "./pages/feedback-process/index";
import FeedbackCategory from "./pages/feedback-category/index";
import FeedbackDetailTest from "./pages/feedback-list/FeedbackDetailTest";

// 工作流管理相关页面
import WorkflowManagement from "./pages/workflow-management/index";
import WorkflowDesigner from "./pages/workflow-management/WorkflowDesigner";
import WorkflowExecution from "./pages/workflow-management/WorkflowExecution";



import Login from "./pages/login/login"; // 登录页
import Register from "./pages/login/register"; // 导入注册页

// 修改isAuthenticated函数，添加更多详细日志
const isAuthenticated = (): boolean => {
  const localStorageToken = localStorage.getItem("token");
  const sessionStorageToken = sessionStorage.getItem("token");

  console.log(`🔑 isAuthenticated() 被调用:`, {
    路径: window.location.pathname,
    localStorage存在: !!localStorageToken,
    sessionStorage存在: !!sessionStorageToken,
  });

  const result = !!(localStorageToken || sessionStorageToken);
  console.log(`🔐 认证结果: ${result ? "已认证" : "未认证"}`);

  return result;
};

// 暴露测试函数到全局，便于在控制台调试
(window as any).testAuth = isAuthenticated;
(window as any).routesDebug = () => {
  console.log("📊 当前路由配置:", routes);
  console.log("🌐 当前URL:", window.location.href);
  console.log("🔐 当前认证状态:", isAuthenticated());
};

// 修改getRouteObjects函数，添加详细日志
export const getRouteObjects = (): any[] => {
  console.log(
    "⚠️ getRouteObjects() 被调用, 当前路径:",
    window.location.pathname
  );

  // 在函数开始处添加详细的token检查日志
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");
  console.log(
    "🔍 当前token状态: localStorage:",
    localToken ? "存在" : "不存在",
    "sessionStorage:",
    sessionToken ? "存在" : "不存在"
  );

  const auth = isAuthenticated();
  console.log("🔐 认证状态:", auth);

  const routesWithAuth = routes.map((route) => {
    // 登录页特殊处理 - 添加详细日志
    if (route.path === "/login" || route.path === "/register") {
      console.log("🚪 处理公共路由 - 检测到访问", route.path);
      console.log("👉 对于公共页面：无条件放行，不检查token");
      return route; // 不变更，直接返回原始路由配置
    }

    // 其他页面的权限保护
    console.log(`🛡️ 处理路由: ${route.path}, 认证状态: ${auth}`);

    if (route.children) {
      // 打印所有子路由
      route.children.forEach((child) => {
        console.log(`  📑 子路由: ${child.path}`);
      });

      // 处理子路由
      const childrenWithAuth = route.children.map((childRoute) => {
        console.log(`  🔒 处理子路由: ${childRoute.path}, 认证状态: ${auth}`);
        return {
          ...childRoute,
          element: auth ? childRoute.element : <Navigate to="/login" replace />,
        };
      });

      return {
        ...route,
        element: auth ? route.element : <Navigate to="/login" replace />,
        children: childrenWithAuth,
      };
    }

    return {
      ...route,
      element: auth ? route.element : <Navigate to="/login" replace />,
    };
  });

  console.log("✅ 路由处理完成，总计:", routesWithAuth.length, "条路由");
  return routesWithAuth;
};

// 自定义路由对象类型
interface RouteObjectType {
  path?: string;
  element?: React.ReactNode;
  index?: boolean;
  children?: RouteObjectType[];
  caseSensitive?: boolean;
}

/**
 * 路由配置类型
 */
export interface AppRoute extends RouteObjectType {
  key?: string; // 路由的唯一标识
  label?: string; // 菜单显示名称
  icon?: React.ReactNode; // 菜单图标
  hideInMenu?: boolean; // 是否在菜单中隐藏
  children?: AppRoute[]; // 子路由
}

/**
 * 应用路由配置
 */
export const routes: AppRoute[] = [
  // 登录页（独立路由，不在MainLayout内）
  {
    path: "/login",
    element: <Login />,
    key: "login",
    hideInMenu: true,
  },
  // 注册页（独立路由，不在MainLayout内）
  {
    path: "/register",
    element: <Register />,
    key: "register",
    hideInMenu: true,
  },
  {
    path: "/",
    element: <MainLayout />,
    key: "root",
    children: [
      // 仪表板
      {
        path: "dashboard",
        element: <Dashboard />,
        key: "dashboard",
        label: "仪表盘",
        icon: <DashboardOutlined />,
      },

      // 用户管理已移动到系统设置



      // 反馈管理
      {
        path: "feedback",
        key: "feedback",
        label: "反馈管理",
        icon: <MessageOutlined />,
        children: [
          {
            path: "list",
            key: "feedback.list",
            label: "反馈列表",
            element: <FeedbackList />,
            icon: <MessageOutlined />,
          },
          {
            path: "process/:id",
            key: "feedback.process",
            label: "反馈处理",
            element: <FeedbackProcess />,
            icon: <ToolOutlined />,
            hideInMenu: true,
          },
          // 数据分析功能已合并到主仪表盘
          {
            path: "category",
            key: "feedback.category",
            label: "分类管理",
            element: <FeedbackCategory />,
            icon: <TagOutlined />,
          },
          {
            path: "detail-test",
            key: "feedback.detail-test",
            label: "详情功能测试",
            element: <FeedbackDetailTest />,
            icon: <MessageOutlined />,
            hideInMenu: true,
          },
        ],
      },

      // 工作流管理
      {
        path: "workflow",
        key: "workflow",
        label: "工作流管理",
        icon: <BranchesOutlined />,
        children: [
          {
            path: "management",
            key: "workflow.management",
            label: "工作流管理",
            element: <WorkflowManagement />,
            icon: <NodeIndexOutlined />,
          },
          {
            path: "designer",
            key: "workflow.designer",
            label: "工作流设计器",
            element: <WorkflowDesigner />,
            icon: <SettingOutlined />,
          },
          {
            path: "execution",
            key: "workflow.execution",
            label: "执行管理",
            element: <WorkflowExecution />,
            icon: <PlayCircleOutlined />,
          },


        ],
      },

      // 系统设置
      {
        path: "settings",
        key: "settings",
        label: "系统设置",
        icon: <SettingOutlined />,
        children: [
          {
            path: "profile",
            key: "settings.profile",
            label: "个人中心",
            element: <Profile />,
            icon: <UserOutlined />,
          },
          {
            path: "users",
            key: "settings.users",
            label: "反馈管理",
            element: <UserList />,
            icon: <TeamOutlined />,
          },
        ],
      },

      // 默认路由（根路径重定向到仪表盘）
      {
        path: "",
        key: "home",
        element: isAuthenticated() ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <Navigate to="/login" replace />
        ),
        hideInMenu: true,
      },

      // 404路由（未匹配的路径重定向到仪表盘）
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
        key: "404",
        hideInMenu: true,
      },
    ],
  },
];

/**
 * 将路由配置转换为React Router所需的路由对象
 * 确保这个函数被正确导出
 */

/**
 * 获取菜单项配置
 * 从路由配置中筛选出需要在菜单中显示的项目
 */
export const getMenuItems = () => {
  // 递归函数，用于处理嵌套路由
  const getItems = (routes: AppRoute[]): AppRoute[] => {
    return routes
      .filter((route) => !route.hideInMenu)
      .map((route) => {
        const item = { ...route };
        if (route.children) {
          item.children = getItems(route.children);
        }
        return item;
      });
  };

  // 获取根路由下的子路由作为顶级菜单项
  const rootRoute = routes.find((route) => route.path === "/");
  if (rootRoute && rootRoute.children) {
    return getItems(rootRoute.children);
  }
  return [];
};

export default routes;

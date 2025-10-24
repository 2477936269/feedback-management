// 修改后的 App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { ConfigProvider, App as AntApp, Spin } from "antd";
import zhCN from "antd/lib/locale/zh_CN";

// 导入集中式配置
import { themeConfig, routerConfig } from "./config";
import { getRouteObjects } from "./routes";
import { initializeApp } from "./service/appInitializer";
// 样式
import "./App.css";

/**
 * 路由组件
 */
const AppRoutes: React.FC = () => {
  return useRoutes(getRouteObjects());
};

/**
 * 主应用组件
 */
const App: React.FC = () => {
  console.log("🚀 App组件初始化, 当前路径:", window.location.pathname);
  console.log(
    "💾 初始化时token状态:",
    localStorage.getItem("token") ? "存在" : "不存在"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 环境初始化
  useEffect(() => {
    const init = async () => {
      const result = await initializeApp();
      if (!result.success) {
        setError(result.error ?? null);
      }
      setLoading(false);
    };
    init();
  }, []);

  // 应用加载中状态
  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" fullscreen />
      </div>
    );
  }

  // 应用加载失败状态
  if (error) {
    return (
      <div
        className="app-error"
        style={{ textAlign: "center", padding: "50px 20px" }}
      >
        <h2>应用加载失败</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntApp>
        <Router future={routerConfig.futureConfig}>
          <AppRoutes />
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;

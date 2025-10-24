import React from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { routes, AppRoute } from "../../routes";

// 面包屑导航组件属性
interface BreadcrumbNavProps {
  className?: string;
  style?: React.CSSProperties;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ className, style }) => {
  const location = useLocation();

  // 获取当前路径
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  // 替换现有的findRouteByPath函数，大约在第16行附近

  // 通过路径查找对应的路由配置信息
  const findRouteByPath = (
    pathArray: string[]
  ): {
    breadcrumbs: { path: string; label: string }[];
    found: boolean;
  } => {
    // 初始化面包屑数组
    const breadcrumbs = [{ path: "/", label: "首页" }];

    // 如果没有路径片段，直接返回
    if (!pathArray.length) {
      return { breadcrumbs, found: false };
    }

    console.log("查找路径:", pathArray);

    // 获取根路由的子路由作为起点
    const rootRoute = routes.find((route) => route.path === "/");
    if (!rootRoute || !rootRoute.children) {
      return { breadcrumbs, found: false };
    }

    let currentRoutes = rootRoute.children;
    let currentPath = "";

    // 遍历路径片段，尝试在路由配置中查找对应项
    for (let i = 0; i < pathArray.length; i++) {
      const segment = pathArray[i];
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      // 查找匹配的路由
      const matchedRoute = currentRoutes.find((route) => {
        if (route.path) {
          return route.path === segment;
        }
        return false;
      });

      if (matchedRoute) {
        // 将匹配的路由添加到面包屑
        if (matchedRoute.label) {
          breadcrumbs.push({
            path: `/${currentPath}`,
            label: matchedRoute.label as string,
          });
        }

        // 继续遍历子路由
        if (matchedRoute.children) {
          currentRoutes = matchedRoute.children;
        } else {
          break; // 没有更多的子路由了
        }
      } else {
        // 如果没有直接匹配，可能是子路由，需要在父路由的子路由中查找
        let found = false;
        for (const route of currentRoutes) {
          if (route.children) {
            const childRoute = route.children.find((child) => {
              return child.path === segment;
            });

            if (childRoute) {
              // 先添加父路由到面包屑
              if (route.label) {
                breadcrumbs.push({
                  path: `/${route.path}`,
                  label: route.label as string,
                });
              }
              // 再添加子路由到面包屑
              if (childRoute.label) {
                breadcrumbs.push({
                  path: `/${currentPath}`,
                  label: childRoute.label as string,
                });
              }
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }

    console.log("生成的面包屑:", breadcrumbs);
    return { breadcrumbs, found: breadcrumbs.length > 1 };
  };

  const { breadcrumbs } = findRouteByPath(pathSnippets);

  // 转换为Ant Design 4.x/5.x的items格式
  const breadcrumbItems = breadcrumbs.map((breadcrumb, index) => {
    const isFirst = index === 0;
    const isLast = index === breadcrumbs.length - 1;

    // 构造不同类型的面包屑项
    return {
      key: breadcrumb.path,
      title: isFirst ? (
        <Link to={breadcrumb.path}>
          <HomeOutlined style={{ marginRight: 4 }} />
          {breadcrumb.label}
        </Link>
      ) : isLast ? (
        <span>{breadcrumb.label}</span>
      ) : (
        <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
      ),
    };
  });

  // 使用items属性代替子组件
  return (
    <Breadcrumb
      className={className}
      style={{ margin: "0 0 24px 0", ...style }}
      items={breadcrumbItems}
    />
  );
};

export default BreadcrumbNav;

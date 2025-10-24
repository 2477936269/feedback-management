## 目录结构
frontend/
  .env                   # 环境变量配置
  build.sh               # 构建脚本
  package.json           # NPM配置和依赖
  pageList.md            # 页面结构文档
  tsconfig.json          # TypeScript配置
  build/                 # 构建输出目录
  public/                # 静态资源目录
    index.html           # HTML模板
    manifest.json        # PWA配置
  src/                   # 源代码目录
    App.tsx              # 应用根组件
    index.tsx            # 应用入口点
    config/              # 配置文件目录
      index.ts
      themeConfig.ts
      dataConfig.ts
      routerConfig.ts
      netConfig.ts
      layoutConfig.ts
    components/          # 组件目录
      generic/           # 通用组件
        GenericModalForm.tsx
      layout/            # 布局组件
      common/            # 通用组件
    pages/               # 页面组件
      dashboard/         # 仪表盘
      group-list/        # 用户组管理
      profile/           # 用户资料
    services/            # API服务调用
    hooks/               # 自定义Hooks
    models/              # 数据类型定义
    utils/               # 工具函数
    routes.tsx           # 路由配置


## 功能概述
认证相关界面

多种登录方式（用户名/邮箱/手机号/二维码）
用户注册流程
验证邮箱和手机
用户管理界面

用户搜索、筛选和分页功能
用户详情和编辑功能
批量导入用户
角色权限管理

角色列表与管理
权限分配界面
用户角色分配
用户组管理

树形展示组织结构
组织创建和编辑
组织成员管理
个人中心功能

个人信息管理
安全设置
活跃会话查看

## 安装与运行

## 安装依赖
cd frontend
npm install

## 配置环境变量
复制 .env.example 为 .env（如果存在），或创建 .env 文件
配置API基础URL等环境变量

## 运行开发服务器
npm start

## 构建生产版本
npm run build
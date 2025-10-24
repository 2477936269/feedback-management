#!/bin/bash
# filepath: /Users/peter/dev/microservices-platform/services/org-service/frontend/create_structure.sh

# 创建基础目录结构
echo "创建目录结构..."

# 公共目录
mkdir -p public

# src主要目录结构
mkdir -p src/components/layout
mkdir -p src/components/organization
mkdir -p src/components/position
mkdir -p src/components/common

mkdir -p src/pages/dashboard
mkdir -p src/pages/organization
mkdir -p src/pages/position
mkdir -p src/pages/assignment
mkdir -p src/pages/relation

mkdir -p src/services
mkdir -p src/models
mkdir -p src/utils
mkdir -p src/hooks

# 创建基础文件
echo "创建基础文件..."

# 公共文件
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="组织结构系统" />
    <title>组织结构系统</title>
  </head>
  <body>
    <noscript>您需要启用JavaScript才能运行此应用。</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

touch public/favicon.ico

# 布局组件
touch src/components/layout/PageHeader.tsx
touch src/components/layout/SideMenu.tsx
touch src/components/layout/MainLayout.tsx

# 组织组件
touch src/components/organization/OrganizationTree.tsx
touch src/components/organization/OrganizationForm.tsx
touch src/components/organization/OrganizationTypeTable.tsx

# 职位组件
touch src/components/position/PositionTable.tsx
touch src/components/position/PositionForm.tsx

# 通用组件
touch src/components/common/ConfirmModal.tsx
touch src/components/common/SearchBox.tsx

# 页面组件
touch src/pages/dashboard/Dashboard.tsx
touch src/pages/organization/OrganizationTree.tsx
touch src/pages/organization/OrganizationDetail.tsx
touch src/pages/organization/OrganizationTypeManagement.tsx
touch src/pages/position/PositionList.tsx
touch src/pages/position/PositionDetail.tsx
touch src/pages/assignment/UserPositionAssignment.tsx
touch src/pages/relation/OrganizationRelation.tsx

# 服务
touch src/services/organizationService.ts
touch src/services/positionService.ts
touch src/services/userAssignmentService.ts

# 模型定义
touch src/models/organization.ts
touch src/models/position.ts
touch src/models/common.ts

# 工具函数
touch src/utils/request.ts
touch src/utils/treeUtils.ts

# 自定义hooks
touch src/hooks/useOrganization.ts
touch src/hooks/usePosition.ts

# 主要入口文件
touch src/App.tsx
touch src/routes.tsx
touch src/index.tsx

# package.json
cat > package.json << 'EOF'
{
  "name": "org-service-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@ant-design/icons": "^4.8.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.14",
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "antd": "^5.10.0",
    "axios": "^1.3.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.2",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:3007"
}
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
EOF

# 添加执行权限
chmod +x create_structure.sh

echo "目录和文件结构创建完成！"
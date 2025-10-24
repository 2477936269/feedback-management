# 分类管理数据丢失问题修复指南

## 问题描述
分类管理中新增的数据在刷新后就没有了，这是因为前端配置为使用Mock数据而不是真实的后端数据库。

## 问题原因
1. **前端配置问题**: `netConfig.ts` 中开发环境配置禁用了后端请求
2. **API服务错误处理**: 错误时返回默认数据而不是抛出错误
3. **数据持久化问题**: 数据只保存在前端状态中，没有真正保存到数据库

## 修复内容

### 1. 修复前端网络配置
- 文件: `frontend_template/frontend_template/src/config/netConfig.ts`
- 修改: 启用开发环境的后端请求，连接到 `http://localhost:50008/api`

### 2. 修复API服务错误处理
- 文件: `frontend_template/frontend_template/src/service/categoryService.ts`
- 修改: 在API调用失败时抛出错误而不是返回默认数据

### 3. 修复前端状态管理
- 文件: `frontend_template/frontend_template/src/pages/feedback-category/index.tsx`
- 修改: 使用服务器返回的真实数据更新本地状态

## 启动步骤

### 1. 启动后端数据库服务
```bash
cd backend/backend
./start-database-server.sh
```

### 2. 启动前端服务
```bash
cd frontend_template/frontend_template
npm start
```

## 验证修复
1. 打开分类管理页面
2. 新增一个分类
3. 刷新页面
4. 检查新增的分类是否仍然存在

## 注意事项
- 确保后端服务运行在端口 50008
- 确保数据库连接正常
- 如果仍有问题，检查浏览器控制台的网络请求和错误信息

## 技术细节
- 前端现在会正确连接到后端API
- 数据会保存到Prisma数据库
- 错误处理更加严格，不会静默失败
- 使用服务器返回的真实数据更新UI状态

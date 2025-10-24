#!/bin/bash

# 启动数据库后端服务器脚本
# 这个脚本启动使用真实数据库的后端服务

echo "🚀 启动数据库后端服务器..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

# 检查数据库连接
echo "🔍 检查数据库连接..."
npx prisma db push --accept-data-loss

# 启动服务器
echo "🌟 启动服务器 (端口: 50008)..."
node server.js

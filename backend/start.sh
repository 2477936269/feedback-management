#!/bin/bash

echo "🚀 启动 MSFeedback 后端服务..."

# 检查PostgreSQL容器是否运行
if ! docker ps | grep -q msfeedback-postgres; then
    echo "📦 启动PostgreSQL容器..."
    docker run --name msfeedback-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=feedback -p 5432:5432 -d postgres:latest
    
    # 等待PostgreSQL启动
    echo "⏳ 等待PostgreSQL启动..."
    sleep 10
fi

# 生成 Prisma 客户端（如果需要）
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 启动后端服务
echo "🌐 启动后端服务..."
node server.js 
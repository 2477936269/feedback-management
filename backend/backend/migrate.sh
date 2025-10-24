#!/bin/bash

echo "🗄️ 执行数据库迁移..."

# 检查数据库连接
echo "🔍 检查数据库连接..."
npx prisma db pull

# 执行迁移
echo "📦 执行数据库迁移..."
npx prisma migrate deploy

# 生成客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

echo "✅ 数据库迁移完成！" 
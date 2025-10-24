import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 初始化系统配置
  const systemConfigs = [
    {
      key: 'FEEDBACK_TYPES',
      value: JSON.stringify([
        '功能异常',
        '体验建议', 
        '新功能需求',
        '其他'
      ])
    },
    {
      key: 'UPLOAD_LIMIT',
      value: JSON.stringify({
        maxFiles: 5,
        maxFileSize: 10485760 // 10MB
      })
    },
    {
      key: 'ADMIN_API_KEY',
      value: 'admin-secret-key-2024'
    }
  ]

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    })
  }

  // 创建默认外部系统
  const defaultExternalSystem = await prisma.externalSystem.upsert({
    where: { name: '默认外部系统' },
    update: {},
    create: {
      name: '默认外部系统',
      description: '系统默认的外部系统配置',
      permissions: ['feedback:submit', 'feedback:query', 'stats:view'],
      rateLimit: 100
    }
  })

  // 为默认外部系统创建API密钥
  await prisma.apiKey.upsert({
    where: { key: 'default-api-key-2024' },
    update: {},
    create: {
      key: 'default-api-key-2024',
      status: true,
      externalSystemId: defaultExternalSystem.id
    }
  })

  console.log('数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

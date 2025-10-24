// 自定义统计卡片配置接口，用于配置文件
interface StatisticCardConfigData {
  key: string;
  title: string;
  iconName: string;
  valueStyle?: React.CSSProperties;
}

/**
 * 统计卡片配置
 * 根据传入的数据动态生成统计卡片配置
 */
export const getStatisticCardsConfig = (
  users: any[]
): StatisticCardConfigData[] => [
    {
      key: "totalUsers",
      title: "总用户数",
      iconName: "UserOutlined",
      valueStyle: { color: "#1890ff" },
    },
    {
      key: "activeUsers",
      title: "活跃用户",
      iconName: "UserOutlined",
      valueStyle: { color: "#52c41a" },
    },
    {
      key: "inactiveUsers",
      title: "禁用用户",
      iconName: "LockOutlined",
      valueStyle: { color: "#faad14" },
    },
    {
      key: "recentUsers",
      title: "最近注册",
      iconName: "MailOutlined",
      valueStyle: { color: "#722ed1" },
    },
  ];

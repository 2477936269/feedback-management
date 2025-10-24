import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Statistic, Table, Tag, Spin, Alert, Button, Space, DatePicker, message } from "antd";
import {
  UserOutlined,
  KeyOutlined,
  ApartmentOutlined,
  DownloadOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { MockService } from "../../service/mockService";
import { GenericStatisticCards, StatisticCardConfig } from "../../components/generic";

const { RangePicker } = DatePicker;

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalGroups: number;
  recentLogins: any[];
  userGrowthData: any[];
}

// 反馈统计数据接口
interface FeedbackStatsData {
  total: number;
  pending: number;
  todayNew: number;
  avgProcessTime: string;
  typeStats: Array<{
    type: string;
    count: number;
    ratio: string;
  }>;
  statusStats: Array<{
    status: string;
    count: number;
  }>;
  trendData: Array<{
    date: string;
    count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 反馈统计相关状态
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStatsData>({
    total: 0,
    pending: 0,
    todayNew: 0,
    avgProcessTime: '0h',
    typeStats: [],
    statusStats: [],
    trendData: [],
  });

  // 组件级别的权限验证
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // 加载仪表盘数据
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await MockService.getDashboardStats();

        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError("加载仪表盘数据失败: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // 模拟反馈统计数据
  const mockFeedbackStatsData: FeedbackStatsData = React.useMemo(() => ({
    total: 1250,
    pending: 45,
    todayNew: 23,
    avgProcessTime: '4.5h',
    typeStats: [
      { type: '功能异常', count: 520, ratio: '41.6%' },
      { type: '体验建议', count: 380, ratio: '30.4%' },
      { type: '新功能需求', count: 280, ratio: '22.4%' },
      { type: '其他', count: 70, ratio: '5.6%' },
    ],
    statusStats: [
      { status: '待处理', count: 45 },
      { status: '处理中', count: 23 },
      { status: '已解决', count: 1150 },
      { status: '已拒绝', count: 32 },
    ],
    trendData: [
      { date: '2025-01-10', count: 15 },
      { date: '2025-01-11', count: 18 },
      { date: '2025-01-12', count: 22 },
      { date: '2025-01-13', count: 19 },
      { date: '2025-01-14', count: 25 },
      { date: '2025-01-15', count: 23 },
    ],
  }), []);

  // 获取反馈统计数据
  const fetchFeedbackStats = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      setFeedbackStats(mockFeedbackStatsData);
    } catch (error) {
      message.error('获取反馈统计数据失败');
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  // 应用筛选
  const handleApplyFilter = () => {
    fetchFeedbackStats();
  };

  // 导出报表
  const handleExport = () => {
    message.success('开始导出Excel报表');
    // 实际项目中这里会调用导出API
  };

  // 刷新反馈数据
  const handleRefreshFeedback = () => {
    fetchFeedbackStats();
  };

  // 初始化反馈数据
  useEffect(() => {
    fetchFeedbackStats();
  }, [fetchFeedbackStats]);

  // 最近登录用户表格列配置
  const recentLoginColumns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "活跃" : "非活跃"}
        </Tag>
      ),
    },
    {
      title: "最后登录",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      render: (date: string) => new Date(date).toLocaleString("zh-CN"),
    },
  ];

  // 反馈统计卡片配置
  const feedbackStatisticCardsData: StatisticCardConfig[] = [
    {
      title: '总反馈数',
      value: feedbackStats.total,
      suffix: '条',
      color: '#1890ff',
      icon: <BarChartOutlined />,
    },
    {
      title: '待处理数',
      value: feedbackStats.pending,
      suffix: '条',
      color: '#ff4d4f',
      icon: <PieChartOutlined />,
    },
    {
      title: '今日新增',
      value: feedbackStats.todayNew,
      suffix: '条',
      color: '#52c41a',
      icon: <LineChartOutlined />,
    },
    {
      title: '平均处理时长',
      value: feedbackStats.avgProcessTime,
      color: '#722ed1',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]}>
        {/* 系统统计卡片 */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats?.activeUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="角色数量"
              value={stats?.totalRoles || 0}
              prefix={<KeyOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户组数量"
              value={stats?.totalGroups || 0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>

        {/* 反馈统计卡片 */}
        <Col span={24}>
          <Card title="反馈统计概览" variant="borderless" style={{ marginBottom: 16 }}>
            <GenericStatisticCards configs={feedbackStatisticCardsData} />
          </Card>
        </Col>

        {/* 反馈数据筛选区域 */}
        <Col span={24}>
          <Card title="反馈数据分析" variant="borderless" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col>
                <span style={{ marginRight: 8 }}>时间范围：</span>
                <RangePicker
                  onChange={(dates) => {
                    if (dates) {
                      setDateRange([
                        dates[0]?.format('YYYY-MM-DD') || '',
                        dates[1]?.format('YYYY-MM-DD') || '',
                      ]);
                    } else {
                      setDateRange(null);
                    }
                  }}
                />
              </Col>
              <Col>
                <Button type="primary" onClick={handleApplyFilter}>
                  应用筛选
                </Button>
              </Col>
              <Col flex="auto" />
              <Col>
                <Space>
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出Excel报表
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleRefreshFeedback} loading={feedbackLoading}>
                    刷新数据
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 图表区域 */}
        <Col span={12}>
          <Card title="反馈类型分布" extra={<Button type="link" size="small">下载图片</Button>}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }}>
                  📊
                </div>
                <div style={{ color: '#666' }}>
                  <div>功能异常: {feedbackStats.typeStats[0]?.count || 0} ({feedbackStats.typeStats[0]?.ratio || '0%'})</div>
                  <div>体验建议: {feedbackStats.typeStats[1]?.count || 0} ({feedbackStats.typeStats[1]?.ratio || '0%'})</div>
                  <div>新功能需求: {feedbackStats.typeStats[2]?.count || 0} ({feedbackStats.typeStats[2]?.ratio || '0%'})</div>
                  <div>其他: {feedbackStats.typeStats[3]?.count || 0} ({feedbackStats.typeStats[3]?.ratio || '0%'})</div>
                </div>
                <div style={{ marginTop: 16, fontSize: '12px', color: '#999' }}>
                  点击饼图可查看详细列表
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 状态分布 */}
        <Col span={12}>
          <Card title="反馈状态分布" extra={<Button type="link" size="small">下载图片</Button>}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }}>
                  📈
                </div>
                <div style={{ color: '#666' }}>
                  <div>待处理: {feedbackStats.statusStats[0]?.count || 0}</div>
                  <div>处理中: {feedbackStats.statusStats[1]?.count || 0}</div>
                  <div>已解决: {feedbackStats.statusStats[2]?.count || 0}</div>
                  <div>已拒绝: {feedbackStats.statusStats[3]?.count || 0}</div>
                </div>
                <div style={{ marginTop: 16, fontSize: '12px', color: '#999' }}>
                  柱状图展示各状态数量
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 趋势图 */}
        <Col span={24}>
          <Card 
            title="近30天反馈趋势" 
            style={{ marginTop: 16 }}
            extra={<Button type="link" size="small">下载图片</Button>}
          >
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#722ed1', marginBottom: 16 }}>
                  📉
                </div>
                <div style={{ color: '#666' }}>
                  <div>最近6天数据：</div>
                  {feedbackStats.trendData.map((item, index) => (
                    <div key={index}>
                      {item.date}: {item.count} 条
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, fontSize: '12px', color: '#999' }}>
                  折线图显示每日新增反馈数量
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 系统概览 */}
        <Col span={24}>
          <Card title="系统概览" variant="borderless">
            <Row gutter={16}>
              <Col span={12}>
                <Alert
                  message="Mock数据模式"
                  description="当前系统运行在Mock数据模式下，所有数据都是模拟数据，不依赖后端服务。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <p>✅ 反馈管理模块已启用</p>
                <p>✅ 角色权限管理已启用</p>
                <p>✅ 用户组管理已启用</p>
                <p>✅ 反馈系统已启用</p>
                <p>✅ Mock数据服务正常运行</p>
              </Col>
              <Col span={12}>
                <h4>功能特性：</h4>
                <ul>
                  <li>完整的用户CRUD操作</li>
                  <li>角色和权限管理</li>
                  <li>用户组管理</li>
                  <li>反馈系统数据分析</li>
                  <li>模拟数据持久化</li>
                  <li>响应式界面设计</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 最近登录用户 */}
        <Col span={24}>
          <Card title="最近登录用户" variant="borderless">
            <Table
              columns={recentLoginColumns}
              dataSource={stats?.recentLogins || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

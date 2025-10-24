import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Button, Space, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { GenericStatisticCards, StatisticCardConfig } from '../../components/generic';

const { RangePicker } = DatePicker;

// 统计数据接口
interface StatsData {
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

const FeedbackDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [statsData, setStatsData] = useState<StatsData>({
    total: 0,
    pending: 0,
    todayNew: 0,
    avgProcessTime: '0h',
    typeStats: [],
    statusStats: [],
    trendData: [],
  });

  // 模拟统计数据
  const mockStatsData: StatsData = {
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
  };

  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatsData(mockStatsData);
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  const handleApplyFilter = () => {
    fetchStats();
  };

  // 导出报表
  const handleExport = () => {
    message.success('开始导出Excel报表');
    // 实际项目中这里会调用导出API
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchStats();
  };

  // 统计卡片配置
  const statisticCardsData: StatisticCardConfig[] = [
    {
      title: '总反馈数',
      value: statsData.total,
      suffix: '条',
      color: '#1890ff',
      icon: <BarChartOutlined />,
    },
    {
      title: '待处理数',
      value: statsData.pending,
      suffix: '条',
      color: '#ff4d4f',
      icon: <PieChartOutlined />,
    },
    {
      title: '今日新增',
      value: statsData.todayNew,
      suffix: '条',
      color: '#52c41a',
      icon: <LineChartOutlined />,
    },
    {
      title: '平均处理时长',
      value: statsData.avgProcessTime,
      color: '#722ed1',
    },
  ];

  // 初始化数据
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="feedback-dashboard">
      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
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
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                刷新数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <GenericStatisticCards configs={statisticCardsData} />
      </Card>

      {/* 图表区域 */}
      <Row gutter={16}>
        {/* 反馈类型分布 */}
        <Col span={12}>
          <Card title="反馈类型分布" extra={<Button type="link" size="small">下载图片</Button>}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }}>
                  📊
                </div>
                <div style={{ color: '#666' }}>
                  <div>功能异常: {statsData.typeStats[0]?.count || 0} ({statsData.typeStats[0]?.ratio || '0%'})</div>
                  <div>体验建议: {statsData.typeStats[1]?.count || 0} ({statsData.typeStats[1]?.ratio || '0%'})</div>
                  <div>新功能需求: {statsData.typeStats[2]?.count || 0} ({statsData.typeStats[2]?.ratio || '0%'})</div>
                  <div>其他: {statsData.typeStats[3]?.count || 0} ({statsData.typeStats[3]?.ratio || '0%'})</div>
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
          <Card title="状态分布" extra={<Button type="link" size="small">下载图片</Button>}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }}>
                  📈
                </div>
                <div style={{ color: '#666' }}>
                  <div>待处理: {statsData.statusStats[0]?.count || 0}</div>
                  <div>处理中: {statsData.statusStats[1]?.count || 0}</div>
                  <div>已解决: {statsData.statusStats[2]?.count || 0}</div>
                  <div>已拒绝: {statsData.statusStats[3]?.count || 0}</div>
                </div>
                <div style={{ marginTop: 16, fontSize: '12px', color: '#999' }}>
                  柱状图展示各状态数量
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 趋势图 */}
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
              {statsData.trendData.map((item, index) => (
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
    </div>
  );
};

export default FeedbackDashboard;

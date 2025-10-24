import React, { useState, useEffect, useCallback } from 'react';
import {
  GenericPanelSearch,
  GenericPanelTable,
  SearchItemConfig,
} from '../../components/generic';
import type { TableButtonConfig as PanelTableButtonConfig } from '../../components/generic/GenericPanelTable';
import { Card, Tag, Space, Button, App, Row, Col, Statistic } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import FeedbackAddModal from '../../components/FeedbackAddModal';
import FeedbackDetailModal from '../../components/FeedbackDetailModal';
import { categoryService, Category } from '../../service/categoryService';

// 附件类型定义
export interface AttachmentData {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

// 反馈数据类型
export interface FeedbackData {
  id: string;
  feedbackNo: string;
  type: string;
  mediaType?: string; // 支持多个媒体类型，用逗号分隔
  title?: string;
  content: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'PENDING' | 'PROCESSING' | 'SOLVED' | 'REJECTED';
  contact?: string;
  attachments?: AttachmentData[] | string; // 支持数组和字符串两种格式
  createdAt: string;
  updatedAt: string;
  reply?: string;
  externalSystem?: {
    id: string;
    name: string;
  };
}

// 基础搜索项配置（不包含动态分类）
const baseSearchItems: SearchItemConfig[] = [
  {
    name: 'status',
    label: '状态',
    type: 'select',
    props: { placeholder: '请选择状态' },
    options: [
      { label: '全部', value: '' },
      { label: '待处理', value: 'PENDING' },
      { label: '处理中', value: 'PROCESSING' },
      { label: '已解决', value: 'SOLVED' },
      { label: '已拒绝', value: 'REJECTED' },
    ],
  },
  {
    name: 'mediaType',
    label: '媒体类型',
    type: 'select',
    props: { placeholder: '请选择媒体类型' },
    options: [
      { label: '全部', value: '' },
      { label: '文本', value: 'TEXT' },
      { label: '图片', value: 'IMAGE' },
      { label: '视频', value: 'VIDEO' },
      { label: '语音', value: 'VOICE' },
      { label: '链接', value: 'LINK' },
    ],
  },
  {
    name: 'dateRange',
    label: '时间范围',
    type: 'dateRange',
    props: { placeholder: ['开始日期', '结束日期'] },
  },
  {
    name: 'keyword',
    label: '关键词搜索',
    type: 'input',
    props: { placeholder: '搜索反馈内容/ID' },
  },
];

// 状态标签颜色映射
const statusColorMap = {
  PENDING: 'default',
  PROCESSING: 'processing',
  SOLVED: 'success',
  REJECTED: 'error',
};

// 状态文字映射
const statusTextMap = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  SOLVED: '已解决',
  REJECTED: '已拒绝',
};

const FeedbackList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusStats, setStatusStats] = useState({
    pending: 0,
    processing: 0,
    solved: 0,
    rejected: 0,
    total: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const { message, modal } = App.useApp();

  // 模拟数据
  const mockFeedbacks: FeedbackData[] = [
    {
      id: '1',
      feedbackNo: 'A1B2C3',
      type: '功能异常',
      mediaType: 'TEXT',
      title: '登录按钮无响应',
      content: '登录按钮点击无反应，无法正常登录系统',
      priority: 'high',
      status: 'PENDING',
      contact: 'user@example.com',
      createdAt: '2025-01-15 10:30:00',
      updatedAt: '2025-01-15 10:30:00',
    },
    {
      id: '2',
      feedbackNo: 'D4E5F6',
      type: '体验建议',
      mediaType: 'IMAGE,VIDEO',
      title: '添加深色模式',
      content: '建议在用户界面添加深色模式选项，附上了设计图和演示视频',
      priority: 'medium',
      status: 'PROCESSING',
      contact: '13800138000',
      createdAt: '2025-01-14 15:20:00',
      updatedAt: '2025-01-15 09:15:00',
    },
    {
      id: '3',
      feedbackNo: 'G7H8I9',
      type: '新功能需求',
      mediaType: 'VIDEO',
      title: '批量导入用户功能',
      content: '希望能够添加批量导入用户功能',
      priority: 'medium',
      status: 'SOLVED',
      contact: 'admin@example.com',
      createdAt: '2025-01-13 11:45:00',
      updatedAt: '2025-01-14 16:30:00',
      reply: '该功能已开发完成，将在下个版本中发布',
    },
    {
      id: '4',
      feedbackNo: 'J1K2L3',
      type: '其他',
      mediaType: 'VOICE,IMAGE,TEXT',
      title: '系统响应速度慢',
      content: '系统响应速度较慢，附上了录音、截图和详细描述',
      priority: 'low',
      status: 'REJECTED',
      contact: 'test@example.com',
      createdAt: '2025-01-12 14:20:00',
      updatedAt: '2025-01-13 10:45:00',
      reply: '经测试系统性能正常，建议检查网络连接',
    },
  ];

  // 加载分类数据
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const categoriesData = await categoryService.getActiveCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('加载分类数据失败:', error);
      message.error('加载分类数据失败');
    } finally {
      setCategoriesLoading(false);
    }
  }, [message]);

  // 计算状态统计
  const calculateStatusStats = useCallback((data: FeedbackData[]) => {
    const stats = {
      pending: data.filter(item => item.status === 'PENDING').length,
      processing: data.filter(item => item.status === 'PROCESSING').length,
      solved: data.filter(item => item.status === 'SOLVED').length,
      rejected: data.filter(item => item.status === 'REJECTED').length,
      total: data.length,
    };
    setStatusStats(stats);
  }, []);

  // 获取反馈列表
  const fetchFeedbacks = useCallback(async (params: any = {}) => {
    setLoading(true);
    try {
      // 从本地存储读取，若不存在则用模拟数据并写入
      const persisted = localStorage.getItem('feedback_list_data');
      if (!persisted) {
        localStorage.setItem('feedback_list_data', JSON.stringify(mockFeedbacks));
      }
      const baseData: FeedbackData[] = persisted ? JSON.parse(persisted) : mockFeedbacks;

      // 筛选逻辑
      let filteredData = [...baseData];
      
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      if (params.type) {
        filteredData = filteredData.filter(item => item.type === params.type);
      }
      if (params.mediaType) {
        filteredData = filteredData.filter(item => {
          if (!item.mediaType) return params.mediaType === 'TEXT';
          // 支持多个媒体类型的搜索
          const itemTypes = item.mediaType.split(',').map(t => t.trim());
          return itemTypes.includes(params.mediaType);
        });
      }
      if (params.keyword) {
        filteredData = filteredData.filter(item => 
          item.content.includes(params.keyword) || 
          item.feedbackNo.includes(params.keyword)
        );
      }

      setFeedbacks(filteredData);
      setPagination(prev => ({
        ...prev,
        total: filteredData.length,
      }));
      
      // 计算状态统计（基于原始数据，不受筛选影响）
      calculateStatusStats(baseData);
    } catch (error) {
      message.error('获取反馈列表失败');
    } finally {
      setLoading(false);
    }
  }, [calculateStatusStats]);

  // 搜索处理
  const handleSearch = (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchFeedbacks(values);
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchFeedbacks();
    loadCategories(); // 同时刷新分类数据
  };

  // 动态搜索项配置
  const searchItems: SearchItemConfig[] = [
    ...baseSearchItems,
    {
      name: 'type',
      label: '反馈类型',
      type: 'select',
      props: { 
        placeholder: '请选择类型',
        loading: categoriesLoading,
        disabled: categoriesLoading
      },
      options: [
        { label: '全部', value: '' },
        ...categoryService.categoriesToOptions(categories)
      ],
    },
  ];

  // 初始化数据
  useEffect(() => {
    loadCategories();
    fetchFeedbacks();
  }, [loadCategories, fetchFeedbacks]);

  // 查看反馈详情
  const handleView = (record: FeedbackData) => {
    setSelectedFeedback(record);
    setDetailModalVisible(true);
  };

  // 处理反馈
  const handleProcess = (record: FeedbackData) => {
    navigate(`/feedback/process/${record.id}`, { state: { feedback: record } });
  };

  // 批量标记为已解决
  const handleBatchSolve = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择需要操作的反馈');
      return;
    }
    
    modal.confirm({
      title: '确认操作',
      content: `确定要将选中的 ${selectedRowKeys.length} 条反馈标记为已解决吗？`,
      onOk: () => {
        message.success('批量操作成功');
        setSelectedRowKeys([]);
        fetchFeedbacks();
      },
    });
  };

  // 批量标记为已拒绝
  const handleBatchReject = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择需要操作的反馈');
      return;
    }
    
    modal.confirm({
      title: '确认操作',
      content: `确定要将选中的 ${selectedRowKeys.length} 条反馈标记为已拒绝吗？`,
      onOk: () => {
        message.success('批量操作成功');
        setSelectedRowKeys([]);
        fetchFeedbacks();
      },
    });
  };

  // 删除反馈
  const handleDelete = (record: FeedbackData) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除反馈「${record.title || record.content}」吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        // 模拟删除
        await new Promise(resolve => setTimeout(resolve, 300));
        // 本地更新列表与分页并持久化
        setFeedbacks(prev => {
          const next = prev.filter(item => item.id !== record.id);
          localStorage.setItem('feedback_list_data', JSON.stringify(next));
          return next;
        });
        setPagination(prev => ({ ...prev, total: Math.max(0, (prev.total || 0) - 1) }));
        setSelectedRowKeys(prev => prev.filter(key => key !== record.id));
        message.success('删除成功');
      },
    });
  };

  // 导出选中数据
  const handleExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择需要导出的反馈');
      return;
    }
    message.success('导出功能开发中');
  };

  // 新增反馈
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  // 新增反馈成功回调（接受新增项并持久化）
  const handleAddSuccess = (newItem?: FeedbackData) => {
    if (newItem) {
      setFeedbacks(prev => {
        const next = [newItem, ...prev];
        localStorage.setItem('feedback_list_data', JSON.stringify(next));
        return next;
      });
      setPagination(prev => ({ ...prev, total: (prev.total || 0) + 1 }));
      setAddModalVisible(false);
    } else {
      fetchFeedbacks();
    }
  };

  // 导出数据
  const handleExportAll = () => {
    message.success('导出数据功能开发中');
  };

  // 表格按钮配置（与 GenericPanelTable 的按钮定义保持一致）
  const getTableButtonsConfig = (): PanelTableButtonConfig[] => [
    {
      key: 'add',
      text: '新增分类',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: (_selectedRows: any[], _refreshData: () => void) => handleAdd(),
    },
    {
      key: 'export',
      text: '导出数据',
      type: 'default',
      icon: <DownloadOutlined />,
      onClick: (_selectedRows: any[], _refreshData: () => void) => handleExportAll(),
    },
    {
      key: 'refresh',
      text: '刷新',
      type: 'default',
      icon: <ReloadOutlined />,
      onClick: (_selectedRows: any[], _refreshData: () => void) => handleRefresh(),
    },
  ];

  // 优先级颜色映射
  const priorityColorMap = {
    low: 'default',
    medium: 'processing',
    high: 'warning',
    urgent: 'error',
  };

  // 优先级文字映射
  const priorityTextMap = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };

  // 媒体类型颜色映射
  const mediaTypeColorMap = {
    TEXT: 'default',
    IMAGE: 'blue',
    VIDEO: 'purple',
    VOICE: 'green',
    LINK: 'orange',
  };

  // 媒体类型文字映射
  const mediaTypeTextMap = {
    TEXT: '文本',
    IMAGE: '图片',
    VIDEO: '视频',
    VOICE: '语音',
    LINK: '链接',
  };

  // 渲染多个媒体类型
  const renderMediaTypes = (mediaType: string | undefined) => {
    if (!mediaType) {
      return <Tag color="default">文本</Tag>;
    }
    
    // 如果是单个类型（不包含逗号）
    if (!mediaType.includes(',')) {
      return (
        <Tag color={mediaTypeColorMap[mediaType as keyof typeof mediaTypeColorMap] || 'default'}>
          {mediaTypeTextMap[mediaType as keyof typeof mediaTypeTextMap] || mediaType}
        </Tag>
      );
    }
    
    // 如果是多个类型（包含逗号）
    const types = mediaType.split(',').map(t => t.trim()).filter(t => t);
    return (
      <Space wrap size="small">
        {types.map((type, index) => (
          <Tag 
            key={index}
            color={mediaTypeColorMap[type as keyof typeof mediaTypeColorMap] || 'default'}
            style={{ fontSize: '12px', padding: '2px 6px' }}
          >
            {mediaTypeTextMap[type as keyof typeof mediaTypeTextMap] || type}
          </Tag>
        ))}
      </Space>
    );
  };

  // 表格列配置
  const getTableColumnsConfig = () => [
    {
      title: '反馈ID',
      dataIndex: 'feedbackNo',
      key: 'feedbackNo',
      width: 120,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: '反馈标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
      render: (text: string, record: FeedbackData) => (
        <span title={text || record.content}>
          {text || record.content}
        </span>
      ),
    },
    {
      title: '反馈类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const category = categories.find(cat => cat.name === type);
        return (
          <Tag color={category?.color || '#1890ff'}>
            {type}
          </Tag>
        );
      },
      filters: categories.map(category => ({
        text: category.name,
        value: category.name
      })),
    },
    {
      title: '媒体类型',
      dataIndex: 'mediaType',
      key: 'mediaType',
      width: 150,
      render: renderMediaTypes,
      filters: [
        { text: '文本', value: 'TEXT' },
        { text: '图片', value: 'IMAGE' },
        { text: '视频', value: 'VIDEO' },
        { text: '语音', value: 'VOICE' },
        { text: '链接', value: 'LINK' },
      ],
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: keyof typeof priorityColorMap) => (
        <Tag color={priorityColorMap[priority]}>
          {priorityTextMap[priority]}
        </Tag>
      ),
      filters: [
        { text: '低', value: 'low' },
        { text: '中', value: 'medium' },
        { text: '高', value: 'high' },
        { text: '紧急', value: 'urgent' },
      ],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusColorMap) => (
        <Tag color={statusColorMap[status]}>
          {statusTextMap[status]}
        </Tag>
      ),
      filters: [
        { text: '待处理', value: 'PENDING' },
        { text: '处理中', value: 'PROCESSING' },
        { text: '已解决', value: 'SOLVED' },
        { text: '已拒绝', value: 'REJECTED' },
      ],
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      key: 'contact',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: FeedbackData) => (
        <Space size={16}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          {(record.status === 'PENDING' || record.status === 'PROCESSING') && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleProcess(record)}
            >
              编辑
            </Button>
          )}
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 渲染状态统计组件
  const renderStatusStats = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={4}>
        <Card 
          size="small" 
          style={{ textAlign: 'center', cursor: 'pointer' }}
          hoverable
          onClick={() => handleSearch({})}
        >
          <Statistic
            title="全部"
            value={statusStats.total}
            suffix="条"
            valueStyle={{ color: '#262626' }}
            prefix={<BarChartOutlined style={{ color: '#262626' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card 
          size="small" 
          style={{ textAlign: 'center', cursor: 'pointer' }}
          hoverable
          onClick={() => handleSearch({ status: 'PENDING' })}
        >
          <Statistic
            title="待处理"
            value={statusStats.pending}
            suffix="条"
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card 
          size="small" 
          style={{ textAlign: 'center', cursor: 'pointer' }}
          hoverable
          onClick={() => handleSearch({ status: 'PROCESSING' })}
        >
          <Statistic
            title="处理中"
            value={statusStats.processing}
            suffix="条"
            valueStyle={{ color: '#1890ff' }}
            prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card 
          size="small" 
          style={{ textAlign: 'center', cursor: 'pointer' }}
          hoverable
          onClick={() => handleSearch({ status: 'SOLVED' })}
        >
          <Statistic
            title="已解决"
            value={statusStats.solved}
            suffix="条"
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card 
          size="small" 
          style={{ textAlign: 'center', cursor: 'pointer' }}
          hoverable
          onClick={() => handleSearch({ status: 'REJECTED' })}
        >
          <Statistic
            title="已拒绝"
            value={statusStats.rejected}
            suffix="条"
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card 
          size="small" 
          style={{ textAlign: 'center', cursor: 'pointer' }}
          hoverable
          onClick={handleRefresh}
        >
          <Statistic
            title="刷新"
            value=""
            suffix=""
            valueStyle={{ color: '#722ed1' }}
            prefix={<ReloadOutlined style={{ color: '#722ed1' }} />}
          />
        </Card>
      </Col>
    </Row>
  );

  // 初始化数据
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // 监听页面可见性变化，当从其他页面返回时刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchFeedbacks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFeedbacks]);

  // 监听路由变化，当从处理页面返回时刷新数据
  useEffect(() => {
    if (location.pathname === '/feedback/list') {
      fetchFeedbacks();
    }
  }, [location.pathname, fetchFeedbacks]);

  return (
    <div className="feedback-list">
      {/* 状态统计组件 */}
      {renderStatusStats()}
      
      <Card title="反馈管理" style={{ marginBottom: 16 }}>
        {/* 搜索面板 */}
        <GenericPanelSearch
          searchItems={searchItems}
          onSearch={handleSearch}
        />
      </Card>

      {/* 表格 */}
      <GenericPanelTable
        title={
          <Space>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#262626' }}>反馈列表</span>
            <span style={{ color: '#595959', fontSize: '14px' }}>总计: {feedbacks.length}</span>
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate('/feedback/category')}
              style={{ padding: 0, height: 'auto' }}
            >
              管理分类
            </Button>
          </Space>
        }
        tableProps={{
          dataSource: feedbacks,
          columns: getTableColumnsConfig(),
          rowKey: 'id',
          loading: loading,
          rowSelection: {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          },
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          },
        }}
        buttons={getTableButtonsConfig()}
        showColumnSetting={true}
        storageKey="feedback-list-table"
        resizableColumns={true}
        cardProps={{
          style: {
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0'
          },
          styles: { body: { padding: '24px' } }
        }}
      />

      {/* 新增反馈模态框 */}
      <FeedbackAddModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      {/* 反馈详情模态框 */}
      <FeedbackDetailModal
        visible={detailModalVisible}
        feedback={selectedFeedback}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedFeedback(null);
        }}
      />
    </div>
  );
};

export default FeedbackList;

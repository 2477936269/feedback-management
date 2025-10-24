import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Tag, Space, Tooltip, Modal, Input, Typography, Avatar, Badge, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  BarChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BranchesOutlined,
  SearchOutlined,
  UserOutlined,
  FileTextOutlined,
  AuditOutlined,
  AlertOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  BankOutlined,
  CarOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  LaptopOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  TrophyOutlined,
  GiftOutlined,
  SolutionOutlined,
  UserSwitchOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';
import { 
  GenericStatisticCards,
  GenericModalForm,
  StatisticCardConfig
} from '../../components/generic';
import { FormItemConfig } from '../../components/generic/GenericModalForm';

const { Title, Text } = Typography;
const { Search } = Input;

// 工作流类型定义
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  isNew?: boolean;
  isHot?: boolean;
  usageCount: number;
  avgRating: number;
  tags: string[];
}

// 工作流分类定义
interface WorkflowCategory {
  id: string;
  name: string;
  workflows: WorkflowTemplate[];
}

// 工作流模板数据配置
const workflowTemplates: WorkflowTemplate[] = [
  // 人事类
  {
    id: 'hr-recruitment',
    name: '招聘需求',
    description: '发起招聘需求申请，包含岗位信息、要求等',
    category: '人事',
    icon: <AuditOutlined />,
    color: '#1890ff',
    usageCount: 156,
    avgRating: 4.8,
    tags: ['招聘', '人力资源']
  },
  {
    id: 'hr-onboarding',
    name: '入职申请',
    description: '新员工入职流程申请',
    category: '人事',
    icon: <UserOutlined />,
    color: '#f5222d',
    usageCount: 89,
    avgRating: 4.6,
    tags: ['入职', '新员工']
  },
  {
    id: 'hr-transfer',
    name: '调岗申请',
    description: '员工内部调岗申请流程',
    category: '人事',
    icon: <AlertOutlined />,
    color: '#fa541c',
    usageCount: 45,
    avgRating: 4.3,
    tags: ['调岗', '内部流动']
  },
  {
    id: 'hr-offer',
    name: 'Offer 发放',
    description: '向候选人发放录用通知',
    category: '人事',
    icon: <FileTextOutlined />,
    color: '#eb2f96',
    usageCount: 78,
    avgRating: 4.7,
    tags: ['录用', 'Offer']
  },
  {
    id: 'hr-correction',
    name: '转正申请',
    description: '试用期员工转正申请',
    category: '人事',
    icon: <CheckCircleOutlined />,
    color: '#1890ff',
    usageCount: 92,
    avgRating: 4.5,
    tags: ['转正', '试用期']
  },
  {
    id: 'hr-training',
    name: '培训申请',
    description: '员工培训需求申请',
    category: '人事',
    icon: <BookOutlined />,
    color: '#52c41a',
    usageCount: 134,
    avgRating: 4.4,
    tags: ['培训', '学习']
  },
  {
    id: 'hr-resignation',
    name: 'Offer 薪酬申请',
    description: '候选人薪酬方案申请',
    category: '人事',
    icon: <GiftOutlined />,
    color: '#13c2c2',
    usageCount: 67,
    avgRating: 4.2,
    tags: ['薪酬', '待遇']
  },
  {
    id: 'hr-departure',
    name: '出差申请',
    description: '员工出差申请流程',
    category: '人事',
    icon: <CarOutlined />,
    color: '#52c41a',
    isNew: true,
    usageCount: 23,
    avgRating: 4.6,
    tags: ['出差', '差旅']
  },
  {
    id: 'hr-leave',
    name: '离职',
    description: '员工离职申请流程',
    category: '人事',
    icon: <AlertOutlined />,
    color: '#fa541c',
    usageCount: 34,
    avgRating: 4.1,
    tags: ['离职', '人员流动']
  },

  // 考勤类
  {
    id: 'attendance-leave',
    name: '请假',
    description: '员工请假申请',
    category: '考勤',
    icon: <CalendarOutlined />,
    color: '#1890ff',
    usageCount: 234,
    avgRating: 4.7,
    tags: ['请假', '考勤']
  },
  {
    id: 'attendance-overtime',
    name: '加班',
    description: '员工加班申请',
    category: '考勤',
    icon: <ClockCircleOutlined />,
    color: '#722ed1',
    usageCount: 187,
    avgRating: 4.3,
    tags: ['加班', '工时']
  },
  {
    id: 'attendance-business-trip',
    name: '外出',
    description: '员工外出申请',
    category: '考勤',
    icon: <EnvironmentOutlined />,
    color: '#13c2c2',
    usageCount: 98,
    avgRating: 4.4,
    tags: ['外出', '考勤']
  },

  // 财务类
  {
    id: 'finance-expense',
    name: '费用报销',
    description: '员工费用报销申请',
    category: '财务',
    icon: <BankOutlined />,
    color: '#52c41a',
    isHot: true,
    usageCount: 456,
    avgRating: 4.8,
    tags: ['报销', '费用']
  },
  {
    id: 'finance-procurement',
    name: '采购申请',
    description: '物品采购申请流程',
    category: '财务',
    icon: <ShoppingCartOutlined />,
    color: '#1890ff',
    usageCount: 123,
    avgRating: 4.5,
    tags: ['采购', '物品']
  },
  {
    id: 'finance-contract',
    name: '合同申请',
    description: '合同签署申请流程',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#fa8c16',
    usageCount: 89,
    avgRating: 4.6,
    tags: ['合同', '法务']
  },
  {
    id: 'finance-project',
    name: '立项申请',
    description: '新项目立项申请',
    category: '财务',
    icon: <TrophyOutlined />,
    color: '#1890ff',
    usageCount: 67,
    avgRating: 4.4,
    tags: ['项目', '立项']
  },
  {
    id: 'finance-payment',
    name: '付款申请',
    description: '对外付款申请流程',
    category: '财务',
    icon: <BankOutlined />,
    color: '#13c2c2',
    usageCount: 145,
    avgRating: 4.3,
    tags: ['付款', '财务']
  },
  {
    id: 'finance-activity',
    name: '活动经费申请',
    description: '团建活动经费申请',
    category: '财务',
    icon: <GiftOutlined />,
    color: '#fa8c16',
    usageCount: 78,
    avgRating: 4.2,
    tags: ['活动', '团建']
  },
  // 更多财务类
  {
    id: 'finance-contract-application',
    name: '合同申请',
    description: '合同签署申请流程',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#fa8c16',
    usageCount: 156,
    avgRating: 4.5,
    tags: ['合同', '签署']
  },
  {
    id: 'finance-project-application',
    name: '立项申请',
    description: '新项目立项申请流程',
    category: '财务',
    icon: <TrophyOutlined />,
    color: '#1890ff',
    usageCount: 89,
    avgRating: 4.4,
    tags: ['项目', '立项']
  },
  {
    id: 'finance-expense-application',
    name: '备用金申请',
    description: '员工备用金申请流程',
    category: '财务',
    icon: <BankOutlined />,
    color: '#1890ff',
    usageCount: 234,
    avgRating: 4.6,
    tags: ['备用金', '资金']
  },
  {
    id: 'finance-collection-single',
    name: '收款单',
    description: '客户收款单据处理',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#52c41a',
    usageCount: 167,
    avgRating: 4.3,
    tags: ['收款', '单据']
  },
  {
    id: 'finance-expense-reimbursement',
    name: '费用全款',
    description: '费用全额报销申请',
    category: '财务',
    icon: <BankOutlined />,
    color: '#52c41a',
    usageCount: 298,
    avgRating: 4.7,
    tags: ['报销', '费用']
  },
  {
    id: 'finance-collection-receipt',
    name: '应收单',
    description: '应收账款单据处理',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#13c2c2',
    usageCount: 145,
    avgRating: 4.2,
    tags: ['应收', '账款']
  },
  {
    id: 'finance-payment-receipt',
    name: '应付实付',
    description: '应付账款实际付款',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#13c2c2',
    usageCount: 178,
    avgRating: 4.4,
    tags: ['应付', '付款']
  },
  {
    id: 'finance-collection-voucher',
    name: '应收账',
    description: '应收账款管理',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#13c2c2',
    usageCount: 156,
    avgRating: 4.3,
    tags: ['应收', '账款']
  },
  {
    id: 'finance-payment-voucher',
    name: '应付免付',
    description: '应付账款免付处理',
    category: '财务',
    icon: <FileTextOutlined />,
    color: '#13c2c2',
    usageCount: 89,
    avgRating: 4.1,
    tags: ['应付', '免付']
  },
  {
    id: 'finance-account-transfer',
    name: '转账申请',
    description: '银行转账申请流程',
    category: '财务',
    icon: <ExportOutlined />,
    color: '#fa8c16',
    usageCount: 123,
    avgRating: 4.5,
    tags: ['转账', '银行']
  },

  // 行政类
  {
    id: 'admin-supplies',
    name: '物品领用',
    description: '办公用品领用申请',
    category: '行政',
    icon: <HomeOutlined />,
    color: '#fa8c16',
    usageCount: 345,
    avgRating: 4.6,
    tags: ['物品', '领用']
  },
  {
    id: 'admin-seal-application',
    name: '用章用印申请',
    description: '公司印章使用申请',
    category: '行政',
    icon: <UserOutlined />,
    color: '#1890ff',
    usageCount: 178,
    avgRating: 4.4,
    tags: ['印章', '用章']
  },
  {
    id: 'admin-name-card',
    name: '名片申请',
    description: '员工名片制作申请',
    category: '行政',
    icon: <FileTextOutlined />,
    color: '#1890ff',
    usageCount: 89,
    avgRating: 4.2,
    tags: ['名片', '制作']
  },
  {
    id: 'admin-gift-application',
    name: '礼品申请',
    description: '商务礼品申请流程',
    category: '行政',
    icon: <GiftOutlined />,
    color: '#eb2f96',
    usageCount: 67,
    avgRating: 4.3,
    tags: ['礼品', '商务']
  },
  {
    id: 'admin-vehicle-application',
    name: '用车申请',
    description: '公司车辆使用申请',
    category: '行政',
    icon: <CarOutlined />,
    color: '#fa8c16',
    usageCount: 234,
    avgRating: 4.5,
    tags: ['用车', '车辆']
  },
  {
    id: 'admin-express-delivery',
    name: '快递寄送',
    description: '快递寄送申请流程',
    category: '行政',
    icon: <CarOutlined />,
    color: '#fa8c16',
    usageCount: 156,
    avgRating: 4.4,
    tags: ['快递', '寄送']
  },
  {
    id: 'admin-equipment-repair',
    name: '物品报修',
    description: '办公设备报修申请',
    category: '行政',
    icon: <SettingOutlined />,
    color: '#1890ff',
    usageCount: 98,
    avgRating: 4.1,
    tags: ['报修', '设备']
  },
  {
    id: 'admin-document-application',
    name: '发文申请',
    description: '公司发文申请流程',
    category: '行政',
    icon: <FileTextOutlined />,
    color: '#1890ff',
    usageCount: 123,
    avgRating: 4.3,
    tags: ['发文', '文档']
  },
  {
    id: 'admin-communication-batch',
    name: '通用申请',
    description: '通用行政申请流程',
    category: '行政',
    icon: <UserOutlined />,
    color: '#1890ff',
    usageCount: 89,
    avgRating: 4.2,
    tags: ['通用', '申请']
  },
  {
    id: 'admin-logistics-work',
    name: '售后工单',
    description: '客户售后服务工单',
    category: '行政',
    icon: <UserOutlined />,
    color: '#eb2f96',
    usageCount: 167,
    avgRating: 4.4,
    tags: ['售后', '工单']
  },
  {
    id: 'admin-equipment-inspection',
    name: '设备巡检',
    description: '设备定期巡检流程',
    category: '行政',
    icon: <UserOutlined />,
    color: '#eb2f96',
    usageCount: 78,
    avgRating: 4.0,
    tags: ['设备', '巡检']
  },

  // 其他服务商提供
  {
    id: 'recruitment-approval',
    name: '录用审批',
    description: '新员工录用审批流程',
    category: '其他服务商提供',
    icon: <SolutionOutlined />,
    color: '#1890ff',
    usageCount: 120,
    avgRating: 4.7,
    tags: ['人事', '审批', '录用']
  },
  {
    id: 'card-replacement',
    name: '补卡',
    description: '员工门禁卡/工牌补办申请',
    category: '其他服务商提供',
    icon: <UserOutlined />,
    color: '#eb2f96',
    usageCount: 45,
    avgRating: 4.0,
    tags: ['行政', '考勤', '补办']
  },
  {
    id: 'regularization',
    name: '转正',
    description: '试用期员工转正申请流程',
    category: '其他服务商提供',
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    usageCount: 90,
    avgRating: 4.6,
    tags: ['人事', '转正', '审批']
  },
  {
    id: 'job-transfer',
    name: '调岗',
    description: '员工岗位调动申请流程',
    category: '其他服务商提供',
    icon: <UserSwitchOutlined />,
    color: '#13c2c2',
    usageCount: 60,
    avgRating: 4.3,
    tags: ['人事', '调动', '岗位']
  },
  {
    id: 'resignation',
    name: '离职',
    description: '员工离职申请及审批流程',
    category: '其他服务商提供',
    icon: <UserDeleteOutlined />,
    color: '#f5222d',
    usageCount: 70,
    avgRating: 4.1,
    tags: ['人事', '离职', '审批']
  }
];

// 分类配置
const categories = [
  { id: 'all', name: '全部', count: workflowTemplates.length },
  { id: '人事', name: '人事', count: workflowTemplates.filter(w => w.category === '人事').length },
  { id: '考勤', name: '考勤', count: workflowTemplates.filter(w => w.category === '考勤').length },
  { id: '财务', name: '财务', count: workflowTemplates.filter(w => w.category === '财务').length },
  { id: '行政', name: '行政', count: workflowTemplates.filter(w => w.category === '行政').length },
  { id: '其他服务商提供', name: '其他服务商提供', count: workflowTemplates.filter(w => w.category === '其他服务商提供').length }
];

const WorkflowManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowTemplate[]>(workflowTemplates);

  // 添加悬停效果的CSS样式
  const cardHoverStyle = `
    .workflow-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
      border-color: #1890ff !important;
    }
    .workflow-card:active {
      transform: translateY(0px);
    }
  `;

  // 将样式注入到页面中
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = cardHoverStyle;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 筛选工作流
  useEffect(() => {
    let filtered = workflowTemplates;
    
    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(workflow => workflow.category === selectedCategory);
    }
    
    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(workflow => 
        workflow.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        workflow.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    setFilteredWorkflows(filtered);
  }, [selectedCategory, searchKeyword]);

  // 事件处理函数
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  const handleWorkflowClick = (workflow: WorkflowTemplate) => {
    message.info(`启动工作流：${workflow.name}`);
    // 这里可以跳转到具体的工作流启动页面
    navigate(`/workflow/start/${workflow.id}`);
  };

  // 渲染工作流卡片
  const renderWorkflowCard = (workflow: WorkflowTemplate) => (
    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={workflow.id}>
      <Card
        hoverable
        className="workflow-card"
        onClick={() => handleWorkflowClick(workflow)}
        style={{ 
          height: '140px',
          marginBottom: 16,
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease'
        }}
        bodyStyle={{ 
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* 新/热门标签 */}
        {(workflow.isNew || workflow.isHot) && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}>
            {workflow.isNew && (
              <Badge 
                count="新" 
                style={{ 
                  backgroundColor: '#52c41a',
                  fontSize: '10px',
                  height: '16px',
                  lineHeight: '16px',
                  minWidth: '16px'
                }} 
              />
            )}
            {workflow.isHot && (
              <Badge 
                count="热" 
                style={{ 
                  backgroundColor: '#f5222d',
                  fontSize: '10px',
                  height: '16px',
                  lineHeight: '16px',
                  minWidth: '16px',
                  marginLeft: workflow.isNew ? 4 : 0
                }} 
              />
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar
            size={40}
            style={{ 
              backgroundColor: workflow.color,
              flexShrink: 0,
              marginRight: 12
            }}
            icon={workflow.icon}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {workflow.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              lineHeight: '16px',
              height: '32px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {workflow.description}
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            使用 {workflow.usageCount} 次
          </Text>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {workflow.tags.slice(0, 2).map(tag => (
              <Tag 
                key={tag}
                style={{ 
                  fontSize: '10px',
                  margin: '0 2px',
                  padding: '0 4px',
                  height: '16px',
                  lineHeight: '16px'
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#262626' }}>
          发起申请
        </Title>
      </div>

      {/* 搜索栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="请输入申请名称"
          allowClear
          size="large"
          style={{ maxWidth: 400 }}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Card>

      {/* 左侧分类导航 */}
      <Row gutter={16}>
        <Col span={4}>
          <Card 
            title="分类" 
            size="small"
            bodyStyle={{ padding: '8px 0' }}
          >
            {categories.map(category => (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === category.id ? '#e6f7ff' : 'transparent',
                  color: selectedCategory === category.id ? '#1890ff' : '#262626',
                  borderLeft: selectedCategory === category.id ? '3px solid #1890ff' : '3px solid transparent',
                  transition: 'all 0.3s'
                }}
              >
                {category.name}
                {category.count > 0 && (
                  <span style={{ float: 'right', fontSize: '12px', color: '#999' }}>
                    {category.count}
                  </span>
                )}
              </div>
            ))}
      </Card>
        </Col>

        {/* 右侧工作流卡片区域 */}
        <Col span={20}>
          {selectedCategory !== 'all' && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, color: '#262626' }}>
                {categories.find(c => c.id === selectedCategory)?.name}
              </Title>
            </div>
          )}
          
          {filteredWorkflows.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">暂无相关工作流</Text>
              </div>
            </Card>
          ) : (
            <Row gutter={[16, 0]}>
              {filteredWorkflows.map(renderWorkflowCard)}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowManagement;

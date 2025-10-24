import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  message, 
  Tag, 
  Space, 
  Tooltip, 
  Modal, 
  Progress,
  Timeline,
  Avatar,
  Badge,
  Descriptions,
  Divider,
  Typography,
  Alert,
  Steps,
  App,
  List,
  Input,
  Form
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  MessageOutlined,
  SendOutlined,
  HistoryOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

// 工作流执行实例类型定义
interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'paused' | 'failed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  progress: number;
  startTime: string;
  endTime?: string;
  duration: number; // 已执行时间（小时）
  estimatedDuration: number; // 预计总时间（小时）
  initiator: string;
  participants: string[];
  currentAssignee: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

// 执行步骤类型定义
interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  assignee: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  comments: string[];
  attachments: string[];
  result?: string;
}

// 执行日志类型定义
interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  user: string;
  action: string;
}

const WorkflowExecution: React.FC = () => {
  const { modal } = App.useApp();
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<ExecutionStep | null>(null);
  const [commentForm] = Form.useForm();

  // 状态配置
  const statusConfig = {
    running: { label: '执行中', color: 'processing', icon: <PlayCircleOutlined /> },
    completed: { label: '已完成', color: 'success', icon: <CheckCircleOutlined /> },
    paused: { label: '已暂停', color: 'warning', icon: <PauseCircleOutlined /> },
    failed: { label: '执行失败', color: 'error', icon: <StopOutlined /> },
    cancelled: { label: '已取消', color: 'default', icon: <StopOutlined /> }
  };

  // 优先级配置
  const priorityConfig = {
    high: { label: '高', color: 'red' },
    medium: { label: '中', color: 'orange' },
    low: { label: '低', color: 'green' }
  };

  // 模拟数据
  useEffect(() => {
    const mockInstances: WorkflowInstance[] = [
      {
        id: '1',
        workflowId: 'wf-001',
        workflowName: '员工报销流程',
        status: 'running',
        currentStep: 2,
        totalSteps: 5,
        progress: 40,
        startTime: '2024-01-25 09:30:00',
        duration: 2.5,
        estimatedDuration: 8,
        initiator: '张三',
        participants: ['张三', '李经理', '王财务', '赵总监'],
        currentAssignee: '王财务',
        priority: 'medium',
        description: '张三的差旅费报销申请'
      },
      {
        id: '2',
        workflowId: 'wf-002',
        workflowName: '项目开发协作流程',
        status: 'completed',
        currentStep: 8,
        totalSteps: 8,
        progress: 100,
        startTime: '2024-01-20 10:00:00',
        endTime: '2024-01-24 16:30:00',
        duration: 15.2,
        estimatedDuration: 20,
        initiator: '李产品',
        participants: ['李产品', '张设计', '王开发', '刘测试'],
        currentAssignee: '',
        priority: 'high',
        description: '新功能模块开发项目'
      },
      {
        id: '3',
        workflowId: 'wf-003',
        workflowName: '客户投诉应急处理',
        status: 'paused',
        currentStep: 1,
        totalSteps: 4,
        progress: 25,
        startTime: '2024-01-25 14:20:00',
        duration: 1.2,
        estimatedDuration: 4,
        initiator: '陈客服',
        participants: ['陈客服', '王主管', '李经理'],
        currentAssignee: '王主管',
        priority: 'high',
        description: '客户投诉处理流程'
      }
    ];
    setInstances(mockInstances);

    // 模拟执行步骤数据
    const mockSteps: ExecutionStep[] = [
      {
        id: '1',
        name: '提交申请',
        status: 'completed',
        assignee: '张三',
        startTime: '2024-01-25 09:30:00',
        endTime: '2024-01-25 09:35:00',
        duration: 0.08,
        comments: ['申请已提交，等待审核'],
        attachments: ['报销单.pdf', '发票.jpg']
      },
      {
        id: '2',
        name: '部门经理审核',
        status: 'completed',
        assignee: '李经理',
        startTime: '2024-01-25 10:00:00',
        endTime: '2024-01-25 11:30:00',
        duration: 1.5,
        comments: ['审核通过，转财务处理'],
        attachments: ['审核意见.docx']
      },
      {
        id: '3',
        name: '财务核验',
        status: 'running',
        assignee: '王财务',
        startTime: '2024-01-25 14:00:00',
        comments: ['正在核验票据'],
        attachments: []
      },
      {
        id: '4',
        name: '财务总监审批',
        status: 'pending',
        assignee: '赵总监',
        comments: [],
        attachments: []
      },
      {
        id: '5',
        name: '出纳打款',
        status: 'pending',
        assignee: '钱出纳',
        comments: [],
        attachments: []
      }
    ];
    setExecutionSteps(mockSteps);

    // 模拟执行日志数据
    const mockLogs: ExecutionLog[] = [
      {
        id: '1',
        timestamp: '2024-01-25 09:30:00',
        level: 'info',
        message: '工作流实例已创建',
        user: '张三',
        action: '创建'
      },
      {
        id: '2',
        timestamp: '2024-01-25 09:35:00',
        level: 'success',
        message: '申请提交完成',
        user: '张三',
        action: '提交'
      },
      {
        id: '3',
        timestamp: '2024-01-25 10:00:00',
        level: 'info',
        message: '任务已分配给李经理',
        user: '系统',
        action: '分配'
      },
      {
        id: '4',
        timestamp: '2024-01-25 11:30:00',
        level: 'success',
        message: '部门经理审核通过',
        user: '李经理',
        action: '审核'
      },
      {
        id: '5',
        timestamp: '2024-01-25 14:00:00',
        level: 'info',
        message: '任务已分配给王财务',
        user: '系统',
        action: '分配'
      }
    ];
    setExecutionLogs(mockLogs);
  }, []);

  // 事件处理函数
  const handleInstanceSelect = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
  };

  const handlePause = (instance: WorkflowInstance) => {
    const updatedInstances = instances.map(i => 
      i.id === instance.id 
        ? { ...i, status: 'paused' as const }
        : i
    );
    setInstances(updatedInstances);
    message.success('工作流已暂停');
  };

  const handleResume = (instance: WorkflowInstance) => {
    const updatedInstances = instances.map(i => 
      i.id === instance.id 
        ? { ...i, status: 'running' as const }
        : i
    );
    setInstances(updatedInstances);
    message.success('工作流已恢复');
  };

  const handleCancel = (instance: WorkflowInstance) => {
    modal.confirm({
      title: '确认取消',
      content: `确定要取消工作流"${instance.workflowName}"吗？`,
      onOk: () => {
        const updatedInstances = instances.map(i => 
          i.id === instance.id 
            ? { ...i, status: 'cancelled' as const, endTime: new Date().toLocaleString() }
            : i
        );
        setInstances(updatedInstances);
        message.success('工作流已取消');
      }
    });
  };

  const handleAddComment = (step: ExecutionStep) => {
    setCurrentStep(step);
    setCommentModalVisible(true);
  };

  const handleCommentSubmit = (values: any) => {
    if (currentStep) {
      const updatedSteps = executionSteps.map(s => 
        s.id === currentStep.id 
          ? { ...s, comments: [...s.comments, values.comment] }
          : s
      );
      setExecutionSteps(updatedSteps);
      message.success('评论已添加');
      setCommentModalVisible(false);
      commentForm.resetFields();
    }
  };

  const handleStepComplete = (step: ExecutionStep) => {
    const updatedSteps = executionSteps.map(s => 
      s.id === step.id 
        ? { 
            ...s, 
            status: 'completed' as const,
            endTime: new Date().toLocaleString(),
            duration: 1.5 // 模拟完成时间
          }
        : s
    );
    setExecutionSteps(updatedSteps);
    message.success('步骤已完成');
  };

  const handleStepSkip = (step: ExecutionStep) => {
    const updatedSteps = executionSteps.map(s => 
      s.id === step.id 
        ? { 
            ...s, 
            status: 'skipped' as const,
            endTime: new Date().toLocaleString(),
            result: '已跳过'
          }
        : s
    );
    setExecutionSteps(updatedSteps);
    message.success('步骤已跳过');
  };

  // 渲染实例列表
  const renderInstanceList = () => (
    <List
      dataSource={instances}
      renderItem={(instance) => (
        <List.Item
          actions={[
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleInstanceSelect(instance)}
            >
              查看详情
            </Button>,
            instance.status === 'running' && (
              <Button 
                type="text" 
                icon={<PauseCircleOutlined />} 
                onClick={() => handlePause(instance)}
              >
                暂停
              </Button>
            ),
            instance.status === 'paused' && (
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                onClick={() => handleResume(instance)}
              >
                恢复
              </Button>
            ),
            (instance.status === 'running' || instance.status === 'paused') && (
              <Button 
                type="text" 
                danger 
                icon={<StopOutlined />} 
                onClick={() => handleCancel(instance)}
              >
                取消
              </Button>
            )
          ]}
        >
          <List.Item.Meta
            avatar={
              <Badge 
                status={statusConfig[instance.status].color as any} 
                text={statusConfig[instance.status].icon}
              />
            }
            title={
              <Space>
                <span>{instance.workflowName}</span>
                <Tag color={priorityConfig[instance.priority].color}>
                  {priorityConfig[instance.priority].label}
                </Tag>
                <Tag color={statusConfig[instance.status].color}>
                  {statusConfig[instance.status].label}
                </Tag>
              </Space>
            }
            description={
              <div>
                <div>{instance.description}</div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">发起人: {instance.initiator}</Text>
                  <Text type="secondary" style={{ marginLeft: 16 }}>
                    当前执行人: {instance.currentAssignee || '无'}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Progress 
                    percent={instance.progress} 
                    size="small" 
                    status={instance.status === 'failed' ? 'exception' : undefined}
                  />
                </div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  // 渲染实例详情
  const renderInstanceDetail = () => {
    if (!selectedInstance) return null;

    return (
      <div>
        <Card 
          title="工作流执行详情" 
          extra={
            <Space>
              <Button icon={<ReloadOutlined />}>刷新</Button>
              <Button icon={<ExportOutlined />}>导出</Button>
            </Space>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="工作流名称" span={1}>{selectedInstance.workflowName}</Descriptions.Item>
            <Descriptions.Item label="执行状态" span={1}>
              <Tag color={statusConfig[selectedInstance.status].color}>
                {statusConfig[selectedInstance.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发起人" span={1}>{selectedInstance.initiator}</Descriptions.Item>
            <Descriptions.Item label="当前执行人" span={1}>{selectedInstance.currentAssignee || '无'}</Descriptions.Item>
            <Descriptions.Item label="开始时间" span={1}>{selectedInstance.startTime}</Descriptions.Item>
            <Descriptions.Item label="结束时间" span={1}>{selectedInstance.endTime || '进行中'}</Descriptions.Item>
            <Descriptions.Item label="已执行时间" span={1}>{selectedInstance.duration}小时</Descriptions.Item>
            <Descriptions.Item label="预计总时间" span={1}>{selectedInstance.estimatedDuration}小时</Descriptions.Item>
            <Descriptions.Item label="优先级" span={1}>
              <Tag color={priorityConfig[selectedInstance.priority].color}>
                {priorityConfig[selectedInstance.priority].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="进度" span={1}>
              <Progress 
                percent={selectedInstance.progress} 
                status={selectedInstance.status === 'failed' ? 'exception' : undefined}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="执行步骤" style={{ marginTop: 16 }}>
          <Steps direction="vertical" current={selectedInstance.currentStep - 1}>
            {executionSteps.map((step, index) => (
              <Step
                key={step.id}
                title={
                  <Space>
                    <span>{step.name}</span>
                    <Tag color={
                      step.status === 'completed' ? 'success' :
                      step.status === 'running' ? 'processing' :
                      step.status === 'failed' ? 'error' :
                      step.status === 'skipped' ? 'warning' : 'default'
                    }>
                      {step.status === 'completed' ? '已完成' :
                       step.status === 'running' ? '执行中' :
                       step.status === 'failed' ? '失败' :
                       step.status === 'skipped' ? '已跳过' : '待执行'}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>执行人: {step.assignee}</div>
                    {step.startTime && <div>开始时间: {step.startTime}</div>}
                    {step.endTime && <div>结束时间: {step.endTime}</div>}
                    {step.duration && <div>执行时长: {step.duration}小时</div>}
                    {step.comments.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>最新评论:</Text> {step.comments[step.comments.length - 1]}
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Space>
                        {step.status === 'running' && (
                          <>
                            <Button size="small" type="primary" onClick={() => handleStepComplete(step)}>
                              完成
                            </Button>
                            <Button size="small" onClick={() => handleStepSkip(step)}>
                              跳过
                            </Button>
                          </>
                        )}
                        <Button size="small" icon={<MessageOutlined />} onClick={() => handleAddComment(step)}>
                          添加评论
                        </Button>
                      </Space>
                    </div>
                  </div>
                }
                icon={
                  step.status === 'completed' ? <CheckCircleOutlined /> :
                  step.status === 'running' ? <ClockCircleOutlined /> :
                  step.status === 'failed' ? <StopOutlined /> :
                  <UserOutlined />
                }
              />
            ))}
          </Steps>
        </Card>

        <Card title="执行日志" style={{ marginTop: 16 }}>
          <Timeline>
            {executionLogs.map((log) => (
              <Timeline.Item
                key={log.id}
                color={
                  log.level === 'success' ? 'green' :
                  log.level === 'warning' ? 'orange' :
                  log.level === 'error' ? 'red' : 'blue'
                }
              >
                <div>
                  <div>
                    <Text strong>{log.user}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {log.timestamp}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text>{log.message}</Text>
                    <Tag style={{ marginLeft: 8 }}>
                      {log.action}
                    </Tag>
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>工作流执行管理</Title>
        <Text type="secondary">
          监控和管理工作流的执行状态，查看进度和操作日志
        </Text>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card title="执行实例列表" size="small">
            {renderInstanceList()}
          </Card>
        </Col>
        <Col span={16}>
          {selectedInstance ? renderInstanceDetail() : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">请选择一个工作流实例查看详情</Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* 评论模态框 */}
      <Modal
        title="添加评论"
        open={commentModalVisible}
        onOk={() => commentForm.submit()}
        onCancel={() => {
          setCommentModalVisible(false);
          commentForm.resetFields();
        }}
      >
        <Form form={commentForm} onFinish={handleCommentSubmit}>
          <Form.Item
            name="comment"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea rows={4} placeholder="请输入评论内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowExecution;

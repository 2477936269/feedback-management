import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Tag, 
  Badge,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tooltip,
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  BranchesOutlined,
  EyeOutlined,
  SettingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Option } = Select;

// 步骤类型定义
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'task' | 'approval' | 'decision' | 'notification' | 'automation' | 'submitter' | 'approver' | 'deduplication';
  config?: any;
  order: number;
  role?: string;
  duration?: number;
  isRequired?: boolean;
  canSkip?: boolean;
  conditions?: string[];
  actions?: string[];
}

// 步骤类型配置
const stepTypeConfig = {
  task: { 
    label: '任务', 
    color: '#1890ff', 
    icon: <CheckCircleOutlined />,
    defaultDescription: '执行具体任务'
  },
  approval: { 
    label: '审批', 
    color: '#52c41a', 
    icon: <UserOutlined />,
    defaultDescription: '审批流程节点'
  },
  decision: { 
    label: '决策', 
    color: '#fa8c16', 
    icon: <BranchesOutlined />,
    defaultDescription: '决策分支节点'
  },
  notification: { 
    label: '通知', 
    color: '#722ed1', 
    icon: <EyeOutlined />,
    defaultDescription: '发送通知'
  },
  automation: { 
    label: '自动化', 
    color: '#13c2c2', 
    icon: <SettingOutlined />,
    defaultDescription: '自动化处理'
  },
  submitter: { 
    label: '提交人权限', 
    color: '#1890ff', 
    icon: <UserOutlined />,
    defaultDescription: '允许撤销审批中的申请'
  },
  approver: { 
    label: '审批人设置', 
    color: '#fa8c16', 
    icon: <TeamOutlined />,
    defaultDescription: '允许审批人批量处理'
  },
  deduplication: { 
    label: '审批人去重', 
    color: '#52c41a', 
    icon: <CheckCircleOutlined />,
    defaultDescription: '仅审批一次，后续重复的审批节点均自动同意'
  }
};

interface StepDesignFlowProps {
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
}

const StepDesignFlow: React.FC<StepDesignFlowProps> = ({ steps, onStepsChange }) => {
  const { modal } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [form] = Form.useForm();

  // 添加步骤
  const handleAddStep = (type: keyof typeof stepTypeConfig) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      name: stepTypeConfig[type].label,
      description: stepTypeConfig[type].defaultDescription,
      type,
      config: {},
      order: steps.length
    };
    
    const newSteps = [...steps, newStep];
    onStepsChange(newSteps);
    message.success('步骤添加成功');
  };

  // 编辑步骤
  const handleEditStep = (step: WorkflowStep) => {
    setEditingStep(step);
    form.setFieldsValue({
      name: step.name,
      description: step.description,
      type: step.type
    });
    setModalVisible(true);
  };

  // 删除步骤
  const handleDeleteStep = (stepId: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这个步骤吗？',
      onOk: () => {
        const newSteps = steps.filter(s => s.id !== stepId);
        onStepsChange(newSteps);
        message.success('步骤删除成功');
      }
    });
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStep) {
        const newSteps = steps.map(s => 
          s.id === editingStep.id 
            ? { ...s, ...values }
            : s
        );
        onStepsChange(newSteps);
        setModalVisible(false);
        setEditingStep(null);
        message.success('步骤更新成功');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染步骤卡片
  const renderStepCard = (step: WorkflowStep, index: number) => {
    const config = stepTypeConfig[step.type];
    const isHighlighted = index === 1; // 中间卡片高亮

    return (
      <div key={step.id} style={{ position: 'relative' }}>
        {/* 步骤卡片 */}
        <Card
          style={{
            marginBottom: 16,
            backgroundColor: isHighlighted ? '#fff7e6' : '#fff',
            borderColor: isHighlighted ? '#fa8c16' : '#d9d9d9',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          {/* 状态指示器 */}
          <Badge 
            count={1} 
            style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px',
              backgroundColor: '#ff4d4f'
            }} 
          />
          
          {/* 卡片内容 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px' 
              }}>
                <span style={{ 
                  color: config.color, 
                  marginRight: '8px' 
                }}>
                  {config.icon}
                </span>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: 500 
                }}>
                  {step.name}
                </h4>
                <Tag 
                  color={config.color} 
                  style={{ marginLeft: '8px' }}
                >
                  {config.label}
                </Tag>
              </div>
              
              <div style={{ 
                color: '#666', 
                fontSize: '14px', 
                marginBottom: '12px' 
              }}>
                {step.description}
              </div>
              
              {/* 配置输入框 */}
              <div style={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  点击配置详细设置
                </span>
                <ArrowRightOutlined style={{ color: '#999' }} />
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div style={{ marginLeft: '12px' }}>
              <Space>
                <Button 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditStep(step)}
                >
                  编辑
                </Button>
                <Button 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteStep(step.id)}
                >
                  删除
                </Button>
              </Space>
            </div>
          </div>
        </Card>
        
        {/* 连接线和添加按钮 */}
        {index < steps.length - 1 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            {/* 连接线 */}
            <div style={{
              width: '2px',
              height: '20px',
              backgroundColor: '#d9d9d9',
              marginBottom: '8px'
            }} />
            
            {/* 添加按钮 */}
            <Tooltip title="添加新步骤">
              <Button
                type="text"
                icon={<PlusOutlined />}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  modal.confirm({
                    title: '添加步骤',
                    content: (
                      <div>
                        <p>请选择要添加的步骤类型：</p>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('submitter');
                              Modal.destroyAll();
                            }}
                          >
                            提交人权限
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('approver');
                              Modal.destroyAll();
                            }}
                          >
                            审批人设置
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('deduplication');
                              Modal.destroyAll();
                            }}
                          >
                            审批人去重
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('task');
                              Modal.destroyAll();
                            }}
                          >
                            任务
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('approval');
                              Modal.destroyAll();
                            }}
                          >
                            审批
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('decision');
                              Modal.destroyAll();
                            }}
                          >
                            决策
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('notification');
                              Modal.destroyAll();
                            }}
                          >
                            通知
                          </Button>
                          <Button 
                            block 
                            onClick={() => {
                              handleAddStep('automation');
                              Modal.destroyAll();
                            }}
                          >
                            自动化
                          </Button>
                        </Space>
                      </div>
                    ),
                    onCancel: () => Modal.destroyAll(),
                    okButtonProps: { style: { display: 'none' } },
                    cancelButtonProps: { style: { display: 'none' } }
                  });
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* 步骤流程 */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {steps.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ marginBottom: '16px' }}>
              <PlusOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            </div>
            <div style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '8px' }}>
              暂无步骤配置
            </div>
            <div style={{ fontSize: '12px', color: '#bfbfbf', marginBottom: '16px' }}>
              点击下方按钮添加第一个步骤
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                modal.confirm({
                  title: '添加步骤',
                  content: (
                    <div>
                      <p>请选择要添加的步骤类型：</p>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                          block 
                          onClick={() => {
                            handleAddStep('submitter');
                            Modal.destroyAll();
                          }}
                        >
                          提交人权限
                        </Button>
                        <Button 
                          block 
                          onClick={() => {
                            handleAddStep('approver');
                            Modal.destroyAll();
                          }}
                        >
                          审批人设置
                        </Button>
                        <Button 
                          block 
                          onClick={() => {
                            handleAddStep('deduplication');
                            Modal.destroyAll();
                          }}
                        >
                          审批人去重
                        </Button>
                      </Space>
                    </div>
                  ),
                  onCancel: () => Modal.destroyAll(),
                  okButtonProps: { style: { display: 'none' } },
                  cancelButtonProps: { style: { display: 'none' } }
                });
              }}
            >
              添加步骤
            </Button>
          </Card>
        ) : (
          <div>
            {steps.map((step, index) => renderStepCard(step, index))}
            
            {/* 底部添加按钮 */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Tooltip title="添加新步骤">
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    modal.confirm({
                      title: '添加步骤',
                      content: (
                        <div>
                          <p>请选择要添加的步骤类型：</p>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Button 
                              block 
                              onClick={() => {
                                handleAddStep('submitter');
                                Modal.destroyAll();
                              }}
                            >
                              提交人权限
                            </Button>
                            <Button 
                              block 
                              onClick={() => {
                                handleAddStep('approver');
                                Modal.destroyAll();
                              }}
                            >
                              审批人设置
                            </Button>
                            <Button 
                              block 
                              onClick={() => {
                                handleAddStep('deduplication');
                                Modal.destroyAll();
                              }}
                            >
                              审批人去重
                            </Button>
                          </Space>
                        </div>
                      ),
                      onCancel: () => Modal.destroyAll(),
                      okButtonProps: { style: { display: 'none' } },
                      cancelButtonProps: { style: { display: 'none' } }
                    });
                  }}
                >
                  添加步骤
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {/* 编辑步骤模态框 */}
      <Modal
        title="编辑步骤"
        open={modalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setModalVisible(false);
          setEditingStep(null);
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="步骤名称"
            rules={[{ required: true, message: '请输入步骤名称' }]}
          >
            <Input placeholder="请输入步骤名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="步骤描述"
            rules={[{ required: true, message: '请输入步骤描述' }]}
          >
            <Input.TextArea 
              placeholder="请输入步骤描述" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="步骤类型"
            rules={[{ required: true, message: '请选择步骤类型' }]}
          >
            <Select placeholder="请选择步骤类型">
              <Option value="submitter">提交人权限</Option>
              <Option value="approver">审批人设置</Option>
              <Option value="deduplication">审批人去重</Option>
              <Option value="task">任务</Option>
              <Option value="approval">审批</Option>
              <Option value="decision">决策</Option>
              <Option value="notification">通知</Option>
              <Option value="automation">自动化</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StepDesignFlow;

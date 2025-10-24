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
  Form, 
  Input, 
  Select, 
  DatePicker,
  App, 
  InputNumber,
  Divider,
  Typography,
  Alert,
  Steps,
  Collapse,
  List,
  Avatar,
  Badge,
  Checkbox,
  Radio,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  CopyOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  ArrowRightOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TableOutlined,
  PictureOutlined,
  PaperClipOutlined,
  EnvironmentOutlined,
  AimOutlined,
  CreditCardOutlined,
  PhoneOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { GenericModalForm } from '../../components/generic';
import { FormItemConfig } from '../../components/generic/GenericModalForm';
import StepDesignFlow from './StepDesignFlow';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { Option } = Select;

// 工作流步骤类型定义
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'task' | 'approval' | 'decision' | 'notification' | 'automation' | 'submitter' | 'approver' | 'deduplication';
  role?: string;
  duration?: number; // 预计完成时间（小时）
  isRequired?: boolean;
  canSkip?: boolean;
  conditions?: string[];
  actions?: string[];
  order: number;
  config?: any; // 新增配置字段
}

// 工作流规则类型定义
interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  type: 'condition' | 'action' | 'timer';
  condition: string;
  action: string;
  priority: number;
}

// 工作流配置类型定义
interface WorkflowConfig {
  // 提交人权限
  submitterPermissions: {
    allowRevokeInApproval: boolean;
    allowRevokeWithinDays: boolean;
    revokeDays: number;
    allowModifyWithinDays: boolean;
    modifyDays: number;
    allowSubmitForOthers: boolean;
  };
  // 审批人设置
  approverSettings: {
    allowBatchProcessing: boolean;
    allowRecall: boolean;
    enableQuickApprovalPrompt: boolean;
    allowQuickApprovalOnCards: boolean;
  };
  // 审批人去重
  approverDeduplication: 'approveOnce' | 'consecutiveOnly' | 'noAutoApprove';
  // 审批标题设置
  approvalTitleSettings: 'systemDefault' | 'customTitle';
  // 审批摘要设置
  approvalSummarySettings: 'systemDefault' | 'customConfig';
  // 打印模板
  printTemplate: 'systemDefault' | 'customConfig';
  // 转发设置
  forwardingSettings: {
    onlyForwardToApprovalRelated: boolean;
  };
  // 效率统计
  efficiencyStatistics: {
    excludeFromStatistics: boolean;
  };
  // 审批超时配置
  approvalTimeout: {
    enableTimeoutConfig: boolean;
  };
}

// 工作流角色类型定义
interface WorkflowRole {
  id: string;
  name: string;
  description: string;
  type: 'user' | 'role' | 'department' | 'dynamic';
  assignee: string;
  backupAssignee?: string;
}

const WorkflowDesigner: React.FC = () => {
  const { modal } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [workflowRoles, setWorkflowRoles] = useState<WorkflowRole[]>([]);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({
    submitterPermissions: {
      allowRevokeInApproval: true,
      allowRevokeWithinDays: true,
      revokeDays: 31,
      allowModifyWithinDays: true,
      modifyDays: 31,
      allowSubmitForOthers: false,
    },
    approverSettings: {
      allowBatchProcessing: false,
      allowRecall: false,
      enableQuickApprovalPrompt: false,
      allowQuickApprovalOnCards: true,
    },
    approverDeduplication: 'approveOnce',
    approvalTitleSettings: 'systemDefault',
    approvalSummarySettings: 'systemDefault',
    printTemplate: 'systemDefault',
    forwardingSettings: {
      onlyForwardToApprovalRelated: false,
    },
    efficiencyStatistics: {
      excludeFromStatistics: false,
    },
    approvalTimeout: {
      enableTimeoutConfig: false,
    },
  });
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');

  // 步骤类型配置
  const stepTypeConfig = {
    task: { label: '任务', color: 'blue', icon: <CheckCircleOutlined /> },
    approval: { label: '审批', color: 'green', icon: <UserOutlined /> },
    decision: { label: '决策', color: 'orange', icon: <BranchesOutlined /> },
    notification: { label: '通知', color: 'purple', icon: <EyeOutlined /> },
    automation: { label: '自动化', color: 'cyan', icon: <SettingOutlined /> },
    submitter: { label: '提交人权限', color: 'blue', icon: <UserOutlined /> },
    approver: { label: '审批人设置', color: 'orange', icon: <TeamOutlined /> },
    deduplication: { label: '审批人去重', color: 'green', icon: <CheckCircleOutlined /> }
  };

  // 角色类型配置
  const roleTypeConfig = {
    user: { label: '指定用户', color: 'blue' },
    role: { label: '角色', color: 'green' },
    department: { label: '部门', color: 'orange' },
    dynamic: { label: '动态分配', color: 'purple' }
  };

  // 规则类型配置
  const ruleTypeConfig = {
    condition: { label: '条件规则', color: 'blue' },
    action: { label: '动作规则', color: 'green' },
    timer: { label: '定时规则', color: 'orange' }
  };

  // 步骤表单配置
  const stepFormConfig: FormItemConfig[] = [
    {
      name: 'name',
      label: '步骤名称',
      type: 'input',
      rules: [{ required: true, message: '请输入步骤名称' }],
      props: { placeholder: '请输入步骤名称' }
    },
    {
      name: 'description',
      label: '步骤描述',
      type: 'textarea',
      rules: [{ required: true, message: '请输入步骤描述' }],
      props: { placeholder: '请输入步骤描述' }
    },
    {
      name: 'type',
      label: '步骤类型',
      type: 'select',
      rules: [{ required: true, message: '请选择步骤类型' }],
      options: Object.entries(stepTypeConfig).map(([key, config]) => ({
        label: config.label,
        value: key
      })),
      props: { placeholder: '请选择步骤类型' }
    },
    {
      name: 'role',
      label: '执行角色',
      type: 'input',
      rules: [{ required: true, message: '请输入执行角色' }],
      props: { placeholder: '请输入执行角色' }
    },
    {
      name: 'duration',
      label: '预计完成时间（小时）',
      type: 'number',
      rules: [{ required: true, message: '请输入预计完成时间' }],
      props: { placeholder: '请输入预计完成时间' }
    },
    {
      name: 'isRequired',
      label: '是否必需',
      type: 'select',
      rules: [{ required: true, message: '请选择是否必需' }],
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' }
      ],
      props: { placeholder: '请选择是否必需' }
    },
    {
      name: 'canSkip',
      label: '是否可跳过',
      type: 'select',
      rules: [{ required: true, message: '请选择是否可跳过' }],
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' }
      ],
      props: { placeholder: '请选择是否可跳过' }
    }
  ];

  // 角色表单配置
  const roleFormConfig: FormItemConfig[] = [
    {
      name: 'name',
      label: '角色名称',
      type: 'input',
      rules: [{ required: true, message: '请输入角色名称' }],
      props: { placeholder: '请输入角色名称' }
    },
    {
      name: 'description',
      label: '角色描述',
      type: 'textarea',
      rules: [{ required: true, message: '请输入角色描述' }],
      props: { placeholder: '请输入角色描述' }
    },
    {
      name: 'type',
      label: '角色类型',
      type: 'select',
      rules: [{ required: true, message: '请选择角色类型' }],
      options: Object.entries(roleTypeConfig).map(([key, config]) => ({
        label: config.label,
        value: key
      })),
      props: { placeholder: '请选择角色类型' }
    },
    {
      name: 'assignee',
      label: '主要执行人',
      type: 'input',
      rules: [{ required: true, message: '请输入主要执行人' }],
      props: { placeholder: '请输入主要执行人' }
    },
    {
      name: 'backupAssignee',
      label: '备选执行人',
      type: 'input',
      props: { placeholder: '请输入备选执行人' }
    }
  ];

  // 规则表单配置
  const ruleFormConfig: FormItemConfig[] = [
    {
      name: 'name',
      label: '规则名称',
      type: 'input',
      rules: [{ required: true, message: '请输入规则名称' }],
      props: { placeholder: '请输入规则名称' }
    },
    {
      name: 'description',
      label: '规则描述',
      type: 'textarea',
      rules: [{ required: true, message: '请输入规则描述' }],
      props: { placeholder: '请输入规则描述' }
    },
    {
      name: 'type',
      label: '规则类型',
      type: 'select',
      rules: [{ required: true, message: '请选择规则类型' }],
      options: Object.entries(ruleTypeConfig).map(([key, config]) => ({
        label: config.label,
        value: key
      })),
      props: { placeholder: '请选择规则类型' }
    },
    {
      name: 'condition',
      label: '触发条件',
      type: 'textarea',
      rules: [{ required: true, message: '请输入触发条件' }],
      props: { placeholder: '请输入触发条件' }
    },
    {
      name: 'action',
      label: '执行动作',
      type: 'textarea',
      rules: [{ required: true, message: '请输入执行动作' }],
      props: { placeholder: '请输入执行动作' }
    },
    {
      name: 'priority',
      label: '优先级',
      type: 'number',
      rules: [{ required: true, message: '请输入优先级' }],
      props: { placeholder: '请输入优先级（数字越小优先级越高）' }
    }
  ];

  // 设计器步骤配置
  const designerSteps = [
    {
      title: '基本信息',
      description: '设置工作流基本信息',
      icon: <NodeIndexOutlined />
    },
    {
      title: '角色定义',
      description: '定义工作流参与角色',
      icon: <TeamOutlined />
    },
    {
      title: '步骤设计',
      description: '设计工作流步骤',
      icon: <BranchesOutlined />
    },
    {
      title: '规则配置',
      description: '配置流转规则',
      icon: <SettingOutlined />
    },
    {
      title: '预览测试',
      description: '预览和测试工作流',
      icon: <EyeOutlined />
    }
  ];

  // 事件处理函数
  const handleStepCreate = () => {
    setModalType('create');
    setCurrentItem(null);
    setStepModalVisible(true);
  };

  const handleStepEdit = (step: WorkflowStep) => {
    setModalType('edit');
    setCurrentItem(step);
    setStepModalVisible(true);
  };

  const handleStepDelete = (stepId: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这个步骤吗？',
      onOk: () => {
        setWorkflowSteps(workflowSteps.filter(s => s.id !== stepId));
        message.success('步骤删除成功');
      }
    });
  };

  const handleRoleCreate = () => {
    setModalType('create');
    setCurrentItem(null);
    setRoleModalVisible(true);
  };

  const handleRoleEdit = (role: WorkflowRole) => {
    setModalType('edit');
    setCurrentItem(role);
    setRoleModalVisible(true);
  };

  const handleRoleDelete = (roleId: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？',
      onOk: () => {
        setWorkflowRoles(workflowRoles.filter(r => r.id !== roleId));
        message.success('角色删除成功');
      }
    });
  };

  const handleRuleCreate = () => {
    setModalType('create');
    setCurrentItem(null);
    setRuleModalVisible(true);
  };

  const handleRuleEdit = (rule: WorkflowRule) => {
    setModalType('edit');
    setCurrentItem(rule);
    setRuleModalVisible(true);
  };

  const handleRuleDelete = (ruleId: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这个规则吗？',
      onOk: () => {
        setWorkflowRules(workflowRules.filter(r => r.id !== ruleId));
        message.success('规则删除成功');
      }
    });
  };

  const handleStepModalOk = (values: any) => {
    if (modalType === 'create') {
      const newStep: WorkflowStep = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        type: values.type,
        role: values.role,
        duration: values.duration,
        isRequired: values.isRequired === 'true',
        canSkip: values.canSkip === 'true',
        conditions: [],
        actions: [],
        order: workflowSteps.length + 1
      };
      setWorkflowSteps([...workflowSteps, newStep]);
      message.success('步骤创建成功');
    } else if (modalType === 'edit' && currentItem) {
      const updatedSteps = workflowSteps.map(s => 
        s.id === currentItem.id 
          ? { 
              ...s, 
              ...values,
              isRequired: values.isRequired === 'true',
              canSkip: values.canSkip === 'true'
            }
          : s
      );
      setWorkflowSteps(updatedSteps);
      message.success('步骤更新成功');
    }
    setStepModalVisible(false);
  };

  const handleRoleModalOk = (values: any) => {
    if (modalType === 'create') {
      const newRole: WorkflowRole = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        type: values.type,
        assignee: values.assignee,
        backupAssignee: values.backupAssignee
      };
      setWorkflowRoles([...workflowRoles, newRole]);
      message.success('角色创建成功');
    } else if (modalType === 'edit' && currentItem) {
      const updatedRoles = workflowRoles.map(r => 
        r.id === currentItem.id 
          ? { ...r, ...values }
          : r
      );
      setWorkflowRoles(updatedRoles);
      message.success('角色更新成功');
    }
    setRoleModalVisible(false);
  };

  const handleRuleModalOk = (values: any) => {
    if (modalType === 'create') {
      const newRule: WorkflowRule = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        type: values.type,
        condition: values.condition,
        action: values.action,
        priority: values.priority
      };
      setWorkflowRules([...workflowRules, newRule]);
      message.success('规则创建成功');
    } else if (modalType === 'edit' && currentItem) {
      const updatedRules = workflowRules.map(r => 
        r.id === currentItem.id 
          ? { ...r, ...values }
          : r
      );
      setWorkflowRules(updatedRules);
      message.success('规则更新成功');
    }
    setRuleModalVisible(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="工作流基本信息">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Form layout="vertical" style={{ maxWidth: '600px', width: '100%' }}>
              {/* 图标选择 */}
              <Form.Item 
                label={
                  <span>
                    图标 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                required
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar
                    size={48}
                    style={{ 
                      backgroundColor: '#eb2f96',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    icon={<UserOutlined style={{ fontSize: '24px', color: 'white' }} />}
                  />
                  <Button type="link" style={{ padding: 0 }}>
                    修改
                  </Button>
                </div>
                  </Form.Item>

              {/* 名称 */}
              <Form.Item 
                label={
                  <span>
                    名称 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                required
              >
                <Input placeholder="请输入名称" size="large" />
                  </Form.Item>

              {/* 说明 */}
              <Form.Item label="说明">
                <Input placeholder="说明" size="large" />
              </Form.Item>

              {/* 分组 */}
              <Form.Item 
                label={
                  <span>
                    分组 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                required
              >
                <Select 
                  placeholder="请选择分组" 
                  size="large"
                  defaultValue="财务"
                  style={{ width: '100%' }}
                >
                  <Option value="人事">人事</Option>
                  <Option value="考勤">考勤</Option>
                  <Option value="财务">财务</Option>
                  <Option value="行政">行政</Option>
                  <Option value="其他服务商提供">其他服务商提供</Option>
                    </Select>
                  </Form.Item>

              {/* 谁可以提交该审批 */}
              <Form.Item 
                label={
                  <span>
                    谁可以提交该审批 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                required
              >
                <Select 
                  placeholder="请选择提交权限" 
                  size="large"
                  defaultValue="全员"
                  style={{ width: '100%' }}
                >
                  <Option value="全员">全员</Option>
                  <Option value="指定部门">指定部门</Option>
                  <Option value="指定角色">指定角色</Option>
                  <Option value="指定用户">指定用户</Option>
                </Select>
                  </Form.Item>

              {/* 是否将该审批展示在工作台 */}
              <Form.Item label="是否将该审批展示在工作台">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Checkbox />
                  <span>展示在工作台</span>
                  <Tooltip title="在工作台显示该审批流程，方便用户快速访问">
                    <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                  </Tooltip>
                </div>
                  </Form.Item>

              {/* 禁止管理员管理流程与数据 */}
              <Form.Item label="禁止企业管理员/审批应用管理员/子管理员 管理流程与数据">
                <Checkbox />
              </Form.Item>

              {/* 流程管理员 */}
              <Form.Item 
                label={
                  <span>
                    流程管理员 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                required
              >
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="dashed"
                    size="large"
                    icon={<PlusOutlined />}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '2px dashed #ff4d4f',
                      backgroundColor: '#fff2f0'
                    }}
                  />
                  <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '8px' }}>
                    负责人为空,请添加负责人
                  </div>
                </div>
              </Form.Item>
            </Form>
            </div>
          </Card>
        );
      
      case 1:
        return (
          <div style={{ display: 'flex', gap: '16px', height: '600px' }}>
            {/* 左侧控件面板 */}
          <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Tabs 
                    defaultActiveKey="controls" 
                    size="small" 
                    style={{ margin: 0 }}
                    tabBarStyle={{ margin: 0 }}
                  >
                    <Tabs.TabPane tab="控件" key="controls" />
                    <Tabs.TabPane tab="控件组" key="controlGroups" />
                  </Tabs>
                </div>
              }
              style={{ width: '300px', flexShrink: 0 }}
              bodyStyle={{ padding: '12px', height: '500px', overflowY: 'auto' }}
            >
              {/* 云文档 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  云文档
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<FileTextOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    文档
                    </Button>
                </div>
              </div>

              {/* 文本控件 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  文本
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>A</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    单行文本
                  </Button>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>AΞ</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    多行文本
                  </Button>
                  <Button 
                    size="small" 
                    icon={<InfoCircleOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    说明
                  </Button>
                </div>
              </div>

              {/* 数值控件 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  数值
                </div>
                <div style={{ display: 'flex', 'flexWrap': 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>123</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    数字
                  </Button>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>¥</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    金额
                  </Button>
                </div>
              </div>

              {/* 计算公式 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  计算公式
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '16px' }}>%</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    计算公式
                  </Button>
                </div>
              </div>

              {/* 选项控件 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  选项
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '12px' }}>○</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    单选
                  </Button>
                  <Button 
                    size="small" 
                    icon={<span style={{ fontSize: '12px' }}>☐</span>}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    多选
                  </Button>
                </div>
              </div>

              {/* 日期控件 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  日期
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<CalendarOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    日期
                  </Button>
                  <Button 
                    size="small" 
                    icon={<CalendarOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    日期区间
                  </Button>
                </div>
              </div>

              {/* 其他控件 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c',
                  marginBottom: '8px',
                  padding: '0 4px'
                }}>
                  其他
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button 
                    size="small" 
                    icon={<TableOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    明细/表格
                  </Button>
                  <Button 
                    size="small" 
                    icon={<TableOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    引用多维表格 NEW
                  </Button>
                  <Button 
                    size="small" 
                    icon={<PictureOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    图片/视频
                  </Button>
                  <Button 
                    size="small" 
                    icon={<PaperClipOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    附件
                  </Button>
                  <Button 
                    size="small" 
                    icon={<TeamOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    部门
                  </Button>
                  <Button 
                    size="small" 
                    icon={<UserOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    联系人
                  </Button>
                  <Button 
                    size="small" 
                    icon={<FileTextOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    关联审批
                  </Button>
                  <Button 
                    size="small" 
                    icon={<EnvironmentOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    地址
                  </Button>
                  <Button 
                    size="small" 
                    icon={<AimOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    定位
                  </Button>
                  <Button 
                    size="small" 
                    icon={<CreditCardOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    收款账户
                  </Button>
                  <Button 
                    size="small" 
                    icon={<PhoneOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    电话
                  </Button>
                  <Button 
                    size="small" 
                    icon={<OrderedListOutlined />}
                    style={{ 
                      height: '32px', 
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    流水号
                  </Button>
                </div>
              </div>
            </Card>

            {/* 右侧设计画布 */}
            <Card 
              title="未命名审批" 
              style={{ flex: 1 }}
              extra={
                      <Space>
                  <Button icon={<SettingOutlined />} size="small">
                    配置
                  </Button>
                  <Button icon={<EyeOutlined />} size="small">
                    预览
                  </Button>
                      </Space>
                    }
            >
              <div style={{ 
                height: '500px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                border: '2px dashed #ff4d4f'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '48px', 
                    color: '#ff4d4f',
                    marginBottom: '16px'
                  }}>
                    <PlusOutlined />
                        </div>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#8c8c8c',
                    marginBottom: '8px'
                  }}>
                    点击或拖拽左侧控件至此处
                      </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#bfbfbf'
                  }}>
                    拖拽控件到画布中进行配置
                  </div>
                </div>
              </div>
          </Card>
          </div>
        );
      
      case 2:
        return (
          <Card title="步骤设计">
            <StepDesignFlow 
              steps={workflowSteps}
              onStepsChange={setWorkflowSteps}
            />
          </Card>
        );
      
      case 3:
        return (
          <div>
            {/* 提交人权限 */}
            <Card title="提交人权限" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: 16 }}>
                    <Checkbox 
                      checked={workflowConfig.submitterPermissions.allowRevokeInApproval}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        submitterPermissions: {
                          ...workflowConfig.submitterPermissions,
                          allowRevokeInApproval: e.target.checked
                        }
                      })}
                    >
                      允许撤销审批中的申请
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      第一个审批节点通过后,提交人仍可撤销申请(配置前已发起的申请不生效)
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Checkbox 
                        checked={workflowConfig.submitterPermissions.allowRevokeWithinDays}
                        onChange={(e) => setWorkflowConfig({
                          ...workflowConfig,
                          submitterPermissions: {
                            ...workflowConfig.submitterPermissions,
                            allowRevokeWithinDays: e.target.checked
                          }
                        })}
                      >
                        允许撤销
                      </Checkbox>
                      <InputNumber
                        min={1}
                        max={365}
                        value={workflowConfig.submitterPermissions.revokeDays}
                        onChange={(value) => setWorkflowConfig({
                          ...workflowConfig,
                          submitterPermissions: {
                            ...workflowConfig.submitterPermissions,
                            revokeDays: value || 31
                          }
                        })}
                        style={{ width: 80 }}
                      />
                      <span>天内通过的审批</span>
                    </Space>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      员工可申请撤销已通过的审批(配置前已通过的审批不可撤销)
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Checkbox 
                        checked={workflowConfig.submitterPermissions.allowModifyWithinDays}
                        onChange={(e) => setWorkflowConfig({
                          ...workflowConfig,
                          submitterPermissions: {
                            ...workflowConfig.submitterPermissions,
                            allowModifyWithinDays: e.target.checked
                          }
                        })}
                      >
                        允许修改
                      </Checkbox>
                      <InputNumber
                        min={1}
                        max={365}
                        value={workflowConfig.submitterPermissions.modifyDays}
                        onChange={(value) => setWorkflowConfig({
                          ...workflowConfig,
                          submitterPermissions: {
                            ...workflowConfig.submitterPermissions,
                            modifyDays: value || 31
                          }
                        })}
                        style={{ width: 80 }}
                      />
                      <span>天内通过的审批</span>
                      <Tooltip title="更多信息">
                        <QuestionCircleOutlined style={{ color: '#999' }} />
                      </Tooltip>
                    </Space>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      提交人可申请修改已通过的审批,用于销假等场景(仅可修改一次,配置前已发起的审批不可修改)
                    </div>
                  </div>
                  
                  <div>
                    <Checkbox 
                      checked={workflowConfig.submitterPermissions.allowSubmitForOthers}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        submitterPermissions: {
                          ...workflowConfig.submitterPermissions,
                          allowSubmitForOthers: e.target.checked
                        }
                      })}
                    >
                      允许代他人提交
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      代提人和实际提交人都需在该审批的发起范围内,提交后将共享审批单后续状态
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 审批人设置 */}
            <Card title="审批人设置" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: 16 }}>
                    <Checkbox 
                      checked={workflowConfig.approverSettings.allowBatchProcessing}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        approverSettings: {
                          ...workflowConfig.approverSettings,
                          allowBatchProcessing: e.target.checked
                        }
                      })}
                    >
                      允许审批人批量处理
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      勾选后,审批人在处理此流程的任务时,可一次批量处理多个任务
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Checkbox 
                      checked={workflowConfig.approverSettings.allowRecall}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        approverSettings: {
                          ...workflowConfig.approverSettings,
                          allowRecall: e.target.checked
                        }
                      })}
                    >
                      允许审批人撤回
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      勾选后,若审批同意且后续审批人尚未审批,可撤回"已同意"的审批结果,重新进行审批
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Checkbox 
                      checked={workflowConfig.approverSettings.enableQuickApprovalPrompt}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        approverSettings: {
                          ...workflowConfig.approverSettings,
                          enableQuickApprovalPrompt: e.target.checked
                        }
                      })}
                    >
                      开启秒批提示
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      若审批人浏览单据小于3秒或通过快捷审批处理,系统会在审批记录中进行标记
                    </div>
                  </div>
                  
                  <div>
                    <Checkbox 
                      checked={workflowConfig.approverSettings.allowQuickApprovalOnCards}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        approverSettings: {
                          ...workflowConfig.approverSettings,
                          allowQuickApprovalOnCards: e.target.checked
                        }
                      })}
                    >
                      可在审批卡片上进行快捷审批
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      可在审批bot的消息卡片、移动端列表卡片上进行快捷操作,无需进入具体详情页操作
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 审批人去重 */}
            <Card title="审批人去重" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>同一审批人在流程中重复出现时:</Text>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Radio.Group
                      value={workflowConfig.approverDeduplication}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        approverDeduplication: e.target.value
                      })}
                    >
                      <Space direction="vertical">
                        <Radio value="approveOnce">
                          <Space>
                            <span>仅审批一次,后续重复的审批节点均自动同意</span>
                            <Tooltip title="更多信息">
                              <QuestionCircleOutlined style={{ color: '#999' }} />
                            </Tooltip>
                          </Space>
                        </Radio>
                        <Radio value="consecutiveOnly">
                          <Space>
                            <span>仅针对连续审批的节点自动同意</span>
                            <Tooltip title="更多信息">
                              <QuestionCircleOutlined style={{ color: '#999' }} />
                            </Tooltip>
                          </Space>
                        </Radio>
                        <Radio value="noAutoApprove">
                          不自动同意,每个节点都需要审批
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    若流程中出现审批单内容与查看范围变更、审批流程被退回等情况,则去重规则失效,详见去重规则说明
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 审批标题设置 */}
            <Card title="审批标题设置" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Radio.Group
                    value={workflowConfig.approvalTitleSettings}
                    onChange={(e) => setWorkflowConfig({
                      ...workflowConfig,
                      approvalTitleSettings: e.target.value
                    })}
                  >
                    <Space direction="vertical">
                      <Radio value="systemDefault">系统默认 展示表单名称</Radio>
                      <Radio value="customTitle">
                        <Space>
                          <span>新增自定义标题</span>
                          <Tooltip title="更多信息">
                            <QuestionCircleOutlined style={{ color: '#999' }} />
                          </Tooltip>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Col>
              </Row>
            </Card>

            {/* 审批摘要设置 */}
            <Card title="审批摘要设置" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Radio.Group
                    value={workflowConfig.approvalSummarySettings}
                    onChange={(e) => setWorkflowConfig({
                      ...workflowConfig,
                      approvalSummarySettings: e.target.value
                    })}
                  >
                    <Space direction="vertical">
                      <Radio value="systemDefault">系统默认 展示表单前3个字段</Radio>
                      <Radio value="customConfig">
                        <Space>
                          <span>自定义配置</span>
                          <Tooltip title="更多信息">
                            <QuestionCircleOutlined style={{ color: '#999' }} />
                          </Tooltip>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Col>
              </Row>
            </Card>

            {/* 打印模板 */}
            <Card title="打印模板" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Radio.Group
                    value={workflowConfig.printTemplate}
                    onChange={(e) => setWorkflowConfig({
                      ...workflowConfig,
                      printTemplate: e.target.value
                    })}
                  >
                    <Space direction="vertical">
                      <Radio value="systemDefault">系统默认 <a href="#">示例</a></Radio>
                      <Radio value="customConfig">自定义配置 <a href="#">示例</a></Radio>
                    </Space>
                  </Radio.Group>
                </Col>
              </Row>
            </Card>

            {/* 转发设置 */}
            <Card title="转发设置" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div>
                    <Checkbox 
                      checked={workflowConfig.forwardingSettings.onlyForwardToApprovalRelated}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        forwardingSettings: {
                          ...workflowConfig.forwardingSettings,
                          onlyForwardToApprovalRelated: e.target.checked
                        }
                      })}
                    >
                      仅可转发给审批相关人员
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      审批单仅可被转发给申请人、审批人、抄送人,不能被转发给其他人
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 效率统计 */}
            <Card title="效率统计" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div>
                    <Checkbox 
                      checked={workflowConfig.efficiencyStatistics.excludeFromStatistics}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        efficiencyStatistics: {
                          ...workflowConfig.efficiencyStatistics,
                          excludeFromStatistics: e.target.checked
                        }
                      })}
                    >
                      该流程数据不纳入效率统计
                    </Checkbox>
                    <div style={{ marginLeft: 24, color: '#666', fontSize: '12px' }}>
                      在效率诊断(包括团队、个人、管理员看板)中排除该流程的审批耗时数据
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 审批超时配置 */}
            <Card title="审批超时配置" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div>
                    <Checkbox 
                      checked={workflowConfig.approvalTimeout.enableTimeoutConfig}
                      onChange={(e) => setWorkflowConfig({
                        ...workflowConfig,
                        approvalTimeout: {
                          ...workflowConfig.approvalTimeout,
                          enableTimeoutConfig: e.target.checked
                        }
                      })}
                    >
                      流程开启超时配置
                    </Checkbox>
                    <a href="#" style={{ marginLeft: 8 }}>了解详情</a>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        );
      
      case 4:
        return (
          <Card title="工作流预览">
            <Alert
              message="工作流设计完成"
              description="您可以预览工作流的整体结构，并进行测试验证。"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={16}>
              <Col span={12}>
                <Card title="基本信息" size="small">
                  <p><strong>名称:</strong> 员工报销流程</p>
                  <p><strong>类型:</strong> 审批型</p>
                  <p><strong>步骤数:</strong> {workflowSteps.length}</p>
                  <p><strong>角色数:</strong> {workflowRoles.length}</p>
                  <p><strong>规则数:</strong> {workflowRules.length}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="统计信息" size="small">
                  <p><strong>总预计时间:</strong> {workflowSteps.reduce((sum, s) => sum + (s.duration || 0), 0)}小时</p>
                  <p><strong>必需步骤:</strong> {workflowSteps.filter(s => s.isRequired).length}个</p>
                  <p><strong>可跳过步骤:</strong> {workflowSteps.filter(s => s.canSkip).length}个</p>
                  <p><strong>平均优先级:</strong> {workflowRules.length > 0 ? (workflowRules.reduce((sum, r) => sum + r.priority, 0) / workflowRules.length).toFixed(1) : 0}</p>
                </Card>
              </Col>
            </Row>
            <Divider />
            <Card title="流程预览" size="small">
              <Steps direction="vertical" current={-1}>
                {workflowSteps.map((step, index) => (
                  <Step
                    key={step.id}
                    title={step.name}
                    description={`${step.role} | ${step.duration}小时`}
                    icon={stepTypeConfig[step.type].icon}
                  />
                ))}
              </Steps>
            </Card>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>工作流设计器</Title>
        <Text type="secondary">
          通过可视化界面设计工作流，定义步骤、角色、规则等核心要素
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Steps current={currentStep} onChange={setCurrentStep}>
          {designerSteps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </Card>

      <Card style={{ marginTop: 16 }}>
        {renderStepContent()}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Space>
          <Button 
            disabled={currentStep === 0} 
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            上一步
          </Button>
          <Button 
            type="primary" 
            disabled={currentStep === designerSteps.length - 1}
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            下一步
          </Button>
          {currentStep === designerSteps.length - 1 && (
            <Button type="primary" icon={<SaveOutlined />}>
              保存工作流
            </Button>
          )}
        </Space>
      </Card>

      {/* 步骤表单模态框 */}
      <GenericModalForm
        visible={stepModalVisible}
        title={modalType === 'create' ? '添加步骤' : '编辑步骤'}
        formItems={stepFormConfig}
        initialValues={currentItem || {}}
        onSubmit={handleStepModalOk}
        onCancel={() => setStepModalVisible(false)}
      />

      {/* 角色表单模态框 */}
      <GenericModalForm
        visible={roleModalVisible}
        title={modalType === 'create' ? '添加角色' : '编辑角色'}
        formItems={roleFormConfig}
        initialValues={currentItem || {}}
        onSubmit={handleRoleModalOk}
        onCancel={() => setRoleModalVisible(false)}
      />

      {/* 规则表单模态框 */}
      <GenericModalForm
        visible={ruleModalVisible}
        title={modalType === 'create' ? '添加规则' : '编辑规则'}
        formItems={ruleFormConfig}
        initialValues={currentItem || {}}
        onSubmit={handleRuleModalOk}
        onCancel={() => setRuleModalVisible(false)}
      />
    </div>
  );
};

export default WorkflowDesigner;

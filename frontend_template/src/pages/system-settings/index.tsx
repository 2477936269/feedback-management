import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, InputNumber, Space, Tag, message, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, KeyOutlined } from '@ant-design/icons';
import GenericModalForm from '../../components/generic/GenericModalForm';
import { FormItemConfig } from '../../components/generic/GenericModalForm';
import UserList from '../user-list'; // 导入用户列表组件

const { TabPane } = Tabs;

// 反馈类型数据
interface FeedbackType {
  id: string;
  name: string;
  createdAt: string;
}

// API密钥数据
interface ApiKey {
  id: string;
  key: string;
  status: boolean;
  createdAt: string;
  externalSystemId: string;
  externalSystemName: string;
}

// 外部系统数据
interface ExternalSystem {
  id: string;
  name: string;
  description: string;
  status: boolean;
  permissions: string[];
  rateLimit: number;
  createdAt: string;
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users'); // 默认显示用户管理标签页
  
  // 反馈类型相关状态
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<FeedbackType | null>(null);
  
  // 上传限制相关状态
  const [uploadConfig] = useState({
    maxFiles: 5,
    maxFileSize: 10,
  });
  
  // API密钥相关状态
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [newKey, setNewKey] = useState<string>('');
  
  // 外部系统相关状态
  const [externalSystems, setExternalSystems] = useState<ExternalSystem[]>([]);
  const [systemModalVisible, setSystemModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState<ExternalSystem | null>(null);

  // 模拟数据
  const mockFeedbackTypes: FeedbackType[] = React.useMemo(() => [
    { id: '1', name: '功能异常', createdAt: '2025-01-01' },
    { id: '2', name: '体验建议', createdAt: '2025-01-01' },
    { id: '3', name: '新功能需求', createdAt: '2025-01-01' },
    { id: '4', name: '其他', createdAt: '2025-01-01' },
  ], []);

  const mockApiKeys: ApiKey[] = React.useMemo(() => [
    { 
      id: '1', 
      key: 'sk-****abcd1234', 
      status: true, 
      createdAt: '2025-01-01',
      externalSystemId: 'sys-1',
      externalSystemName: '移动端APP'
    },
    { 
      id: '2', 
      key: 'sk-****efgh5678', 
      status: false, 
      createdAt: '2025-01-02',
      externalSystemId: 'sys-2',
      externalSystemName: 'Web管理系统'
    },
  ], []);

  const mockExternalSystems: ExternalSystem[] = React.useMemo(() => [
    {
      id: 'sys-1',
      name: '移动端APP',
      description: 'iOS和Android移动应用',
      status: true,
      permissions: ['feedback:submit', 'feedback:query'],
      rateLimit: 100,
      createdAt: '2025-01-01',
    },
    {
      id: 'sys-2',
      name: 'Web管理系统',
      description: '内部Web管理平台',
      status: true,
      permissions: ['feedback:submit', 'feedback:query', 'stats:view'],
      rateLimit: 200,
      createdAt: '2025-01-02',
    },
  ], []);

  // 初始化数据
  useEffect(() => {
    setFeedbackTypes(mockFeedbackTypes);
    setApiKeys(mockApiKeys);
    setExternalSystems(mockExternalSystems);
  }, [mockFeedbackTypes, mockApiKeys, mockExternalSystems]);

  // 反馈类型相关操作
  const handleAddType = () => {
    setEditingType(null);
    setTypeModalVisible(true);
  };

  const handleEditType = (record: FeedbackType) => {
    setEditingType(record);
    setTypeModalVisible(true);
  };

  const handleDeleteType = (id: string) => {
    setFeedbackTypes(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const handleTypeSubmit = (values: any) => {
    if (editingType) {
      // 编辑
      setFeedbackTypes(prev => 
        prev.map(item => 
          item.id === editingType.id 
            ? { ...item, name: values.name }
            : item
        )
      );
      message.success('编辑成功');
    } else {
      // 新增
      const newType: FeedbackType = {
        id: Date.now().toString(),
        name: values.name,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setFeedbackTypes(prev => [...prev, newType]);
      message.success('添加成功');
    }
    setTypeModalVisible(false);
  };

  // 上传限制相关操作
  const handleSaveUploadConfig = () => {
    message.success('配置已更新');
  };

  // API密钥相关操作
  const handleGenerateKey = () => {
    const newKeyValue = 'sk-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    setNewKey(newKeyValue);
    setKeyModalVisible(true);
  };

  const handleToggleKeyStatus = (id: string) => {
    setApiKeys(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: !item.status }
          : item
      )
    );
    message.success('状态更新成功');
  };

  const handleResetKey = (id: string) => {
    const newKeyValue = 'sk-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    setApiKeys(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, key: newKeyValue }
          : item
      )
    );
    message.success('密钥重置成功');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    message.success('密钥已复制到剪贴板');
  };

  // 外部系统相关操作
  const handleAddSystem = () => {
    setEditingSystem(null);
    setSystemModalVisible(true);
  };

  const handleEditSystem = (record: ExternalSystem) => {
    setEditingSystem(record);
    setSystemModalVisible(true);
  };

  const handleDeleteSystem = (id: string) => {
    setExternalSystems(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  // 反馈类型表单配置
  const typeFormItems: FormItemConfig[] = [
    {
      name: 'name',
      label: '类型名称',
      type: 'input',
      props: { placeholder: '请输入反馈类型名称' },
      rules: [
        { required: true, message: '请输入类型名称' },
        { max: 20, message: '类型名称不能超过20个字符' },
      ],
    },
  ];

  // 外部系统表单配置
  const systemFormItems: FormItemConfig[] = [
    {
      name: 'name',
      label: '系统名称',
      type: 'input',
      props: { placeholder: '请输入系统名称' },
      rules: [{ required: true, message: '请输入系统名称' }],
    },
    {
      name: 'description',
      label: '系统描述',
      type: 'textarea',
      props: { placeholder: '请输入系统描述' },
    },
    {
      name: 'rateLimit',
      label: '调用频率限制',
      type: 'number',
      props: { placeholder: '每秒最大调用次数', min: 1 },
      rules: [{ required: true, message: '请输入调用频率限制' }],
    },
  ];

  // 反馈类型表格列
  const typeColumns = [
    {
      title: '类型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: FeedbackType) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditType(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该类型？"
            description="关联的反馈将保留类型值"
            onConfirm={() => handleDeleteType(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // API密钥表格列
  const keyColumns = [
    {
      title: '密钥',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => (
        <Space>
          <span style={{ fontFamily: 'monospace' }}>{text}</span>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyKey(text)}
          >
            复制
          </Button>
        </Space>
      ),
    },
    {
      title: '外部系统',
      dataIndex: 'externalSystemName',
      key: 'externalSystemName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: ApiKey) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleKeyStatus(record.id)}
          >
            {record.status ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title="确定重置该密钥？"
            description="重置后将生成新的密钥"
            onConfirm={() => handleResetKey(record.id)}
          >
            <Button type="link" size="small" icon={<KeyOutlined />}>
              重置
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 外部系统表格列
  const systemColumns = [
    {
      title: '系统名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '调用限制',
      dataIndex: 'rateLimit',
      key: 'rateLimit',
      render: (limit: number) => `${limit}/秒`,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: ExternalSystem) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSystem(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该系统？"
            onConfirm={() => handleDeleteSystem(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="system-settings">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 反馈管理 */}
        <TabPane tab="反馈管理" key="users">
          <UserList />
        </TabPane>

        {/* 反馈类型配置 */}
        <TabPane tab="反馈类型配置" key="types">
          <Card
            title="反馈类型管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddType}>
                新增类型
              </Button>
            }
          >
            <Table
              dataSource={feedbackTypes}
              columns={typeColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>

        {/* 上传限制配置 */}
        <TabPane tab="上传限制配置" key="upload">
          <Card title="上传限制配置">
            <Form layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} initialValues={uploadConfig}>
              <Form.Item
                label="最大文件数"
                name="maxFiles"
                rules={[
                  { required: true, message: '请输入最大文件数' },
                  { type: 'number', min: 1, message: '最小值为1' },
                ]}
              >
                <InputNumber min={1} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item
                label="单个文件大小限制 (MB)"
                name="maxFileSize"
                rules={[
                  { required: true, message: '请输入文件大小限制' },
                  { type: 'number', min: 1, message: '最小值为1' },
                ]}
              >
                <InputNumber min={1} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleSaveUploadConfig}>
                  保存配置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* API密钥管理 */}
        <TabPane tab="API密钥管理" key="keys">
          <Card
            title="API密钥管理"
            extra={
              <Button type="primary" icon={<KeyOutlined />} onClick={handleGenerateKey}>
                生成新密钥
              </Button>
            }
          >
            <Table
              dataSource={apiKeys}
              columns={keyColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>

        {/* 外部系统管理 */}
        <TabPane tab="外部系统管理" key="systems">
          <Card
            title="外部系统管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSystem}>
                新增系统
              </Button>
            }
          >
            <Table
              dataSource={externalSystems}
              columns={systemColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 反馈类型表单模态框 */}
      <GenericModalForm
        visible={typeModalVisible}
        title={editingType ? '编辑反馈类型' : '新增反馈类型'}
        formItems={typeFormItems}
        initialValues={editingType ? { name: editingType.name } : {}}
        onCancel={() => setTypeModalVisible(false)}
        onSubmit={handleTypeSubmit}
        width={500}
      />

      {/* 外部系统表单模态框 */}
      <GenericModalForm
        visible={systemModalVisible}
        title={editingSystem ? '编辑外部系统' : '新增外部系统'}
        formItems={systemFormItems}
        initialValues={editingSystem ? {
          name: editingSystem.name,
          description: editingSystem.description,
          rateLimit: editingSystem.rateLimit,
        } : {}}
        onCancel={() => setSystemModalVisible(false)}
        onSubmit={(values) => {
          if (editingSystem) {
            // 编辑逻辑
            setExternalSystems(prev => 
              prev.map(item => 
                item.id === editingSystem.id 
                  ? { ...item, ...values }
                  : item
              )
            );
            message.success('编辑成功');
          } else {
            // 新增逻辑
            const newSystem: ExternalSystem = {
              id: 'sys-' + Date.now(),
              name: values.name,
              description: values.description || '',
              status: true,
              permissions: ['feedback:submit', 'feedback:query'],
              rateLimit: values.rateLimit,
              createdAt: new Date().toISOString().split('T')[0],
            };
            setExternalSystems(prev => [...prev, newSystem]);
            message.success('添加成功');
          }
          setSystemModalVisible(false);
        }}
        width={600}
      />

      {/* 新密钥展示模态框 */}
      <Modal
        title="新生成的API密钥"
        open={keyModalVisible}
        onCancel={() => setKeyModalVisible(false)}
        footer={[
          <Button key="copy" type="primary" onClick={() => handleCopyKey(newKey)}>
            复制密钥
          </Button>,
          <Button key="close" onClick={() => setKeyModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: '#666', marginBottom: 16 }}>
            请妥善保存此密钥，仅显示一次：
          </p>
          <div
            style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all',
            }}
          >
            {newKey}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemSettings;

import React from 'react';
import { Card, Form, Input, Button, Skeleton, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

interface ProfileBasicInfoProps {
  loading: boolean;
  editMode: boolean;
  form: FormInstance;
  saveLoading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileBasicInfo: React.FC<ProfileBasicInfoProps> = ({
  loading,
  editMode,
  form,
  saveLoading,
  onEdit,
  onSave,
  onCancel
}) => {
  return (
    <Card
      title="基本信息"
      extra={
        !editMode ? (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            编辑
          </Button>
        ) : (
          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={onSave}
              loading={saveLoading}
            >
              保存
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        )
      }
      style={{ height: '100%' }}
    >
      <Skeleton loading={loading} active>
        <Form
          form={form}
          layout="horizontal"  // 改为水平布局
          labelCol={{ span: 6 }}  // 标签占6格
          wrapperCol={{ span: 18 }}  // 输入框占18格
          disabled={!editMode}
          style={{ height: '100%', overflowY: 'auto' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '用户名不能为空' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '邮箱不能为空' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="真实姓名"
          >
            <Input placeholder="真实姓名" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号码"
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号码" />
          </Form.Item>
          
          <Form.Item
            name="department"
            label="部门"
          >
            <Input placeholder="部门" />
          </Form.Item>
          
          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="职位" />
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
};

export default ProfileBasicInfo;
import React, { useState } from 'react';
import { Modal, Form, Input, Button, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { resetUserPassword } from '../service/userService';

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 获取当前用户信息
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        message.error('未找到用户信息，请重新登录');
        return;
      }

      const userData = JSON.parse(currentUser);
      const userId = userData.id || userData.userId;

      if (!userId) {
        message.error('无法获取用户ID');
        return;
      }

      // 验证两次输入的密码是否一致
      if (values.newPassword !== values.confirmPassword) {
        form.setFields([
          {
            name: 'confirmPassword',
            errors: ['两次输入的密码不一致'],
          },
        ]);
        return;
      }

      setLoading(true);

      try {
        await resetUserPassword(userId, values.newPassword);
        message.success('密码修改成功');
        form.resetFields();
        onCancel();
        onSuccess?.();
      } catch (error) {
        console.error('修改密码失败:', error);
        message.error('修改密码失败，请重试');
      }
    } catch (validationError) {
      console.error('表单验证失败:', validationError);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LockOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          修改密码
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          确认修改
        </Button>,
      ]}
      width={400}
      destroyOnClose
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }}
      >
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[
            { required: true, message: '请输入当前密码' },
            { min: 6, message: '密码长度不能少于6个字符' }
          ]}
        >
          <Input.Password
            placeholder="请输入当前密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度不能少于8个字符' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: '密码必须包含至少一个大写字母、小写字母和数字'
            }
          ]}
        >
          <Input.Password
            placeholder="请输入新密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="请再次输入新密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;

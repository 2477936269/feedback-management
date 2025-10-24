import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './style.css'; // 复用登录页面的样式

// 在组件外部定义接口
interface FormValidationError {
  errorFields: {
    name: (string | number)[];
    errors: string[];
  }[];
  values: Record<string, any>;
  outOfDate?: boolean;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // 改进验证函数，显示详细错误信息
  const validateFields = async () => {
    console.log('开始验证表单字段');
    try {
      const values = await form.validateFields();
      console.log('表单验证成功:', values);
      return values;
    } catch (error: unknown) {
      const errorInfo = error as FormValidationError;
      console.error('表单验证失败:', errorInfo);
      
      // 提取并显示错误信息
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        // 获取所有错误信息
        const errorMessages = errorInfo.errorFields.map(field => {
          console.log(`字段 ${field.name.join('.')} 验证失败: ${field.errors.join(', ')}`);
          return field.errors[0];
        });
        
        // 显示第一个错误信息给用户
        message.error(errorMessages[0] || '表单验证失败，请检查输入');
        
        // 也可以选择显示所有错误（如果需要）
        // errorMessages.forEach(err => message.error(err));
      } else {
        message.error('表单验证失败，请检查您的输入');
      }
      
      return null;
    }
  };

  const handleRegister = async (values: any) => {
    console.log('handleRegister 被调用，表单值:', values);
    setLoading(true);
    
    try {
      // 确认密码匹配
      if (values.password !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        setLoading(false);
        return;
      }
  
      // 确认至少有一项联系方式
      if ((!values.email || values.email.trim() === '') && 
          (!values.phoneNumber || values.phoneNumber.trim() === '')) {
        message.error('电子邮箱和手机号至少填写一项');
        setLoading(false);
        return;
      }
  
      // 构造注册数据
      const registerData = {
        username: values.username,
        password: values.password,
        email: values.email || '', // 如果没有填写，传空字符串
        phoneNumber: values.phoneNumber || '' // 如果没有填写，传空字符串
      };

      console.log('提交的注册数据:', registerData);

      // 模拟API调用
      console.log('开始模拟注册API调用');
      setTimeout(() => {
        console.log('模拟API调用完成，设置注册成功状态');
        setRegistrationSuccess(true);
        message.success('注册成功！');
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('注册处理过程中发生错误:', error);
      message.error('注册失败，请检查您的信息或稍后重试');
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    console.log('注册按钮被点击');
    validateFields().then(values => {
      if (values) {
        handleRegister(values);
      } else {
        console.log('表单验证失败，不执行提交');
      }
    });
  };

  const handleReturnToLogin = () => {
    console.log('返回登录按钮被点击');
    navigate('/login');
  };

  return (
    <div className="login-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col style={{ width: '400px' }}>
          <Card title="用户注册" className="login-card">
            {registrationSuccess ? (
              <Alert
                message="注册成功"
                description={
                  <div>
                    <p>恭喜您，账号注册成功！现在您可以使用新账号登录系统。</p>
                    <Button type="primary" onClick={handleReturnToLogin}>
                      返回登录
                    </Button>
                  </div>
                }
                type="success"
                showIcon
              />
            ) : (
              <Form
                form={form}
                name="register"
                onFinish={handleRegister}
                layout="vertical"
                scrollToFirstError
                onFinishFailed={(errorInfo) => {
                  console.error('表单提交失败:', errorInfo);
                  // 提取并显示错误信息
                  if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
                    const firstError = errorInfo.errorFields[0];
                    console.log(`字段 ${firstError.name.join('.')} 验证失败: ${firstError.errors.join(', ')}`);
                    message.error(firstError.errors[0] || '表单验证失败');
                  }
                }}
              >
                <Form.Item
                  name="username"
                  required
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                </Form.Item>

                <Form.Item
                  name="email"
                  dependencies={['phoneNumber']}
                  rules={[
                    { 
                      validator: (_, value) => {
                        const phone = form.getFieldValue('phoneNumber');
                        if ((!value || value.trim() === '') && (!phone || phone.trim() === '')) {
                          return Promise.reject('电子邮箱和手机号至少填写一项');
                        }
                        if (value && value.trim() !== '') {
                          // 验证邮箱格式
                          const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                          if (!emailPattern.test(value)) {
                            return Promise.reject('请输入有效的电子邮箱');
                          }
                        }
                        return Promise.resolve();
                      },
                    }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="电子邮箱（必选一）" size="large" />
                </Form.Item>
                
                <Form.Item
                  name="phoneNumber"
                  dependencies={['email']}
                  rules={[
                    { 
                      validator: (_, value) => {
                        const email = form.getFieldValue('email');
                        if ((!value || value.trim() === '') && (!email || email.trim() === '')) {
                          return Promise.reject('电子邮箱和手机号至少填写一项');
                        }
                        if (value && value.trim() !== '') {
                          // 验证手机号格式
                          const phonePattern = /^1\d{10}$/;
                          if (!phonePattern.test(value)) {
                            return Promise.reject('请输入有效的手机号');
                          }
                        }
                        return Promise.resolve();
                      },
                    }
                  ]}
                >
                  <Input prefix={<MobileOutlined />} placeholder="手机号（必选一）" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<SafetyOutlined />}
                    placeholder="确认密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit" // 改回submit类型，利用表单内置验证
                    loading={loading}
                    block
                    size="large"
                  >
                    注册
                  </Button>
                </Form.Item>

                <Form.Item>
                  <Row justify="center">
                    <Col>
                      已有账号？ <a onClick={handleReturnToLogin}>返回登录</a>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
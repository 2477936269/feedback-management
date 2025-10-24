import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import "./style.css";

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 简化登录处理函数
  const handleLogin = (values: any) => {
    console.log("🔑 开始简化登录，输入值：", values);
    setLoading(true);

    // 模拟登录成功，设置一个虚拟token
    const mockToken = "mock-token-" + Date.now();
    localStorage.setItem("token", mockToken);
    console.log("💾 虚拟token已设置：", mockToken);

    message.success("登录成功，即将进入系统...");

    setTimeout(() => {
      console.log("🚀 即将跳转到 /dashboard");
      window.location.href = "/dashboard";
    }, 1500);

    setLoading(false);
  };

  return (
    <div className="login-container">
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col style={{ width: "400px" }}>
          <Card title="反馈管理系统" className="login-card">
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              initialValues={{
                username: "admin",
                password: "123456",
                remember: true,
              }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>

                <a
                  className="login-form-forgot"
                  style={{ float: "right" }}
                  href="#forgot"
                >
                  忘记密码
                </a>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={loading}
                  block
                  size="large"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;

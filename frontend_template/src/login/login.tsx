import React, { useState } from "react";
import { Form, Input, Button, Card, message, Row, Col, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { login, LoginData } from "./service";
import "./style.css";

const { Title } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 登录处理函数
  const handleLogin = async (values: any) => {
    console.log("🔑 开始登录，输入值：", values);
    setLoading(true);

    try {
      // 构建登录数据
      const loginData: LoginData = {
        username: values.username,
        password: values.password,
        rememberMe: values.remember,
      };

      // 调用授权服务进行登录
      const response = await login(loginData);

      if (response.success) {
        message.success("登录成功，即将进入系统...");

        setTimeout(() => {
          console.log("🚀 即将跳转到 /dashboard");
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        message.error(response.message || "登录失败");
      }
    } catch (error) {
      console.error("登录过程中发生错误:", error);
      message.error("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col xs={24} sm={22} md={18} lg={14} xl={10}>
          <Card className="login-card">
            <div className="login-header">
              <Title
                level={2}
                style={{ textAlign: "center", marginBottom: 24 }}
              >
                反馈管理系统
              </Title>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
              style={{ padding: "0 20px" }}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "请输入用户名" },
                  { min: 3, max: 20, message: "用户名长度在3-20个字符之间" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "请输入密码" },
                  { min: 6, message: "密码长度至少6个字符" },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label>
                    <input type="checkbox" /> 记住我
                  </label>
                  <Link to="/register" style={{ color: "#1890ff" }}>
                    注册账号
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: "100%" }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="login-footer">
              <p style={{ textAlign: "center", color: "#666" }}>
                默认账号：admin / admin123
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import { Row, Col, Form, message, Modal, Button, Input } from "antd";
import {
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  resetUserPassword,
} from "../../service/userService";
import type { UploadFile } from "antd/es/upload/interface";
import type { FormInstance } from "antd/es/form";

// 导入组件
import ProfileAvatar from "./ProfileAvatar";
import ProfileBasicInfo from "./ProfileBasicInfo";
import ProfileSecurity from "./ProfileSecurity";

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [passwordModalVisible, setPasswordModalVisible] =
    useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    // 获取当前用户数据
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    let localUserLoaded = false;

    try {
      // 1. 尝试从本地存储获取用户数据
      try {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData && userData.id) {
            console.log("从localStorage获取到用户数据:", userData.username);
            setUser(userData);
            updateFormValues(userData);
            localUserLoaded = true;
          }
        }

        if (!localUserLoaded) {
          const sessionUserStr = sessionStorage.getItem("currentUser");
          if (sessionUserStr) {
            const userData = JSON.parse(sessionUserStr);
            if (userData && userData.id) {
              console.log("从sessionStorage获取到用户数据:", userData.username);
              setUser(userData);
              updateFormValues(userData);
              localUserLoaded = true;
            }
          }
        }
      } catch (e) {
        console.warn("从本地存储获取用户数据失败:", e);
      }

      // 2. 请求最新的用户数据
      try {
        console.log("正在请求API获取最新用户数据...");
        const response = await getCurrentUser();

        if (response && response.data) {
          const userData = response.data.data || response.data;
          console.log("API获取用户数据成功:", userData.username);
          setUser(userData);
          updateFormValues(userData);

          // 更新本地存储
          localStorage.setItem("currentUser", JSON.stringify(response.data));
        } else {
          console.warn("API返回了空的用户数据");
          if (!localUserLoaded) {
            message.warning("获取用户数据失败，请检查网络连接");
          }
        }
      } catch (apiError) {
        console.error("API获取用户信息失败:", apiError);
        if (!localUserLoaded) {
          // 如果本地也没数据，显示错误
          message.error("获取用户信息失败，请重新登录");
          // 可以考虑在这里触发重定向到登录页面
          // history.push('/login');
        } else {
          message.warning("无法从服务器获取最新信息，显示本地缓存数据");
        }
      }
    } catch (error) {
      console.error("获取用户信息流程失败:", error);
      message.error("获取用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  // 提取更新表单值的逻辑为单独函数
  const updateFormValues = (userInfo: any) => {
    if (!userInfo) return;

    form.setFieldsValue({
      username: userInfo.username,
      email: userInfo.email,
      phone: userInfo.phone || userInfo.phoneNumber,
      name: userInfo.name || userInfo.realName,
      department: userInfo.department,
      position: userInfo.position,
    });

    if (userInfo.avatar) {
      setAvatarUrl(userInfo.avatar);
    }
  };

  // 头像相关处理函数
  const handleAvatarChange = async (info: any) => {
    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.status === "done") {
      setAvatarUrl(info.file.response.url);
      message.success("头像上传成功");
    } else if (info.file.status === "error") {
      message.error("头像上传失败");
    }

    setFileList(info.fileList);
  };

  const customUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const userId = user?.id || user?.userId;
      if (!userId) {
        message.error("无法获取用户ID");
        if (onError) onError(new Error("无法获取用户ID"));
        return;
      }

      const response = await updateUserAvatar(userId, file);
      if (response && response.data) {
        const responseData = response.data.data || response.data;
        if (responseData.avatar) {
          const updatedUser = { ...user, avatar: responseData.avatar };
          setUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }

        if (onSuccess) onSuccess(responseData);
      } else {
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      console.error("上传头像失败:", error);
      if (onError) onError(error);
    }
  };

  // 基本信息相关处理函数
  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setSaveLoading(true);

      const userId = user?.id || user?.userId;
      if (!userId) {
        message.error("无法获取用户ID");
        setSaveLoading(false);
        return;
      }

      try {
        const response = await updateUser(userId, values);
        if (response && response.data) {
          setUser(response.data);
          message.success("个人信息更新成功");

          try {
            localStorage.setItem("currentUser", JSON.stringify(response.data));
          } catch (e) {
            console.warn("更新本地存储中的用户数据失败:", e);
          }
        }

        setEditMode(false);
      } catch (error) {
        console.error("更新个人信息失败:", error);
        message.error("更新个人信息失败");
      }
    } catch (validationError) {
      console.error("表单验证失败:", validationError);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    form.setFieldsValue({
      username: user?.username,
      email: user?.email,
      phone: user?.phone || user?.phoneNumber,
      name: user?.name || user?.realName,
      department: user?.department,
      position: user?.position,
    });
    setEditMode(false);
  };

  // 安全设置相关处理函数
  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();

      const userId = user?.id || user?.userId;
      if (!userId) {
        message.error("无法获取用户ID");
        return;
      }

      if (values.newPassword !== values.confirmPassword) {
        passwordForm.setFields([
          {
            name: "confirmPassword",
            errors: ["两次输入的密码不一致"],
          },
        ]);
        return;
      }

      try {
        await resetUserPassword(userId, values.newPassword);
        message.success("密码修改成功");
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } catch (error) {
        console.error("修改密码失败:", error);
        message.error("修改密码失败");
      }
    } catch (validationError) {
      console.error("表单验证失败:", validationError);
    }
  };

  // Mock 数据 - 最近登录记录
  const recentLogins = [
    {
      id: 1,
      time: "2025-03-22 13:45:30",
      ip: "192.168.1.1",
      location: "北京",
      device: "Chrome / Windows",
    },
    {
      id: 2,
      time: "2025-03-20 09:22:15",
      ip: "10.0.0.1",
      location: "上海",
      device: "Safari / macOS",
    },
    {
      id: 3,
      time: "2025-03-18 16:10:05",
      ip: "172.16.0.1",
      location: "广州",
      device: "Firefox / Ubuntu",
    },
  ];

  // 渲染UI - 使用组件
  return (
    <div style={{ padding: "0" }}>
      <Row
        gutter={[16, 16]}
        style={{ height: "calc(100vh - 180px)", overflowY: "auto" }}
      >
        {/* 头像面板 - 使用组件 */}
        <Col xs={24} md={6} lg={6}>
          <ProfileAvatar
            loading={loading}
            user={user}
            avatarUrl={avatarUrl}
            fileList={fileList}
            onAvatarChange={handleAvatarChange}
            onAvatarUpload={customUpload}
          />
        </Col>

        {/* 基本信息面板 - 使用组件 */}
        <Col xs={24} md={9} lg={9}>
          <ProfileBasicInfo
            loading={loading}
            editMode={editMode}
            form={form}
            saveLoading={saveLoading}
            onEdit={handleEditProfile}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        </Col>

        {/* 安全设置面板 - 使用组件 */}
        <Col xs={24} md={9} lg={9}>
          <ProfileSecurity
            loading={loading}
            recentLogins={recentLogins}
            onChangePassword={handleChangePassword}
          />
        </Col>
      </Row>

      {/* 修改密码模态框 - 不变 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPasswordModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handlePasswordSubmit}>
            确认修改
          </Button>,
        ]}
      >
        <Form form={passwordForm} layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 8, message: "密码长度不能少于8个字符" },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;

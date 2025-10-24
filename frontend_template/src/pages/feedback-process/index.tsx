import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Space, Tag, message, Modal, Descriptions, Image, App, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, DownloadOutlined, EyeOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FeedbackData } from '../feedback-list';

const { TextArea } = Input;
const { Option } = Select;

// 状态选项
const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已解决', value: 'SOLVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

// 状态颜色映射
const statusColorMap = {
  PENDING: 'default',
  PROCESSING: 'processing',
  SOLVED: 'success',
  REJECTED: 'error',
};

// 状态文字映射
const statusTextMap = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  SOLVED: '已解决',
  REJECTED: '已拒绝',
};

// 优先级颜色映射
const priorityColorMap = {
  low: 'default',
  medium: 'processing',
  high: 'warning',
  urgent: 'error',
};

// 优先级文字映射
const priorityTextMap = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

// 模拟附件数据
const mockAttachments = [
  {
    id: '1',
    fileName: '截图.jpg',
    fileUrl: 'https://via.placeholder.com/300x200/87CEEB/000000?text=截图',
    fileType: 'image/jpeg',
    fileSize: 1024000,
  },
  {
    id: '2',
    fileName: '问题录屏.mp4',
    fileUrl: 'https://via.placeholder.com/300x200/98FB98/000000?text=视频',
    fileType: 'video/mp4',
    fileSize: 5242880,
  },
];

const FeedbackProcess: React.FC = () => {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [attachments, setAttachments] = useState(mockAttachments);
  const [error, setError] = useState<string | null>(null);

  // 从路由状态获取反馈数据
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setPageLoading(true);
        setError(null);
        
        if (location.state?.feedback) {
          // 从路由状态获取数据
          setFeedback(location.state.feedback);
          form.setFieldsValue({
            status: location.state.feedback.status,
            reply: location.state.feedback.reply || '',
            internalNote: '',
          });
        } else {
          // 如果没有路由状态，模拟获取数据
          await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载延迟
          
          const mockFeedback: FeedbackData = {
            id: id || '1',
            feedbackNo: `FB${id || '001'}`,
            type: '功能异常',
            title: '登录按钮点击无反应',
            content: '登录按钮点击无反应，无法正常登录系统。用户点击登录按钮后，页面没有任何响应，也没有错误提示。这个问题在Chrome浏览器中经常出现，特别是在网络较慢的情况下。\n\n复现步骤：\n1. 打开登录页面\n2. 输入用户名和密码\n3. 点击登录按钮\n4. 页面无任何响应\n\n期望结果：\n- 应该显示登录成功或失败提示\n- 或者跳转到相应的页面',
            priority: 'high',
            status: 'PENDING',
            contact: 'user@example.com',
            attachments: '2个文件',
            createdAt: '2025-01-15 10:30:00',
            updatedAt: '2025-01-15 10:30:00',
            reply: '',
            externalSystem: {
              id: 'sys001',
              name: '用户管理系统'
            }
          };
          
          setFeedback(mockFeedback);
          form.setFieldsValue({
            status: mockFeedback.status,
            reply: mockFeedback.reply || '',
            internalNote: '',
          });
        }
      } catch (err) {
        console.error('加载反馈数据失败:', err);
        setError('加载反馈数据失败，请重试');
      } finally {
        setPageLoading(false);
      }
    };

    loadFeedback();
  }, [id, location.state, form]);

  // 保存处理结果
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新本地数据
      if (feedback) {
        const updatedFeedback = {
          ...feedback,
          status: values.status,
          reply: values.reply,
          updatedAt: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\//g, '/'),
        };
        setFeedback(updatedFeedback);
        
        // 更新本地存储中的反馈列表数据
        const persisted = localStorage.getItem('feedback_list_data');
        if (persisted) {
          const feedbackList: FeedbackData[] = JSON.parse(persisted);
          const updatedList = feedbackList.map(item => 
            item.id === feedback.id ? updatedFeedback : item
          );
          localStorage.setItem('feedback_list_data', JSON.stringify(updatedList));
        }
      }
      
      message.success('处理成功');
      setTimeout(() => {
        navigate('/feedback/list');
      }, 1500);
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    modal.confirm({
      title: '确认操作',
      content: '确定放弃当前修改？',
      onOk: () => {
        navigate('/feedback/list');
      },
    });
  };

  // 查看操作日志
  const handleViewLogs = () => {
    modal.info({
      title: '操作日志',
      width: 600,
      content: (
        <div>
          <p><strong>2025-01-15 10:30:00</strong> - 用户提交反馈</p>
          <p><strong>2025-01-15 11:15:00</strong> - 管理员查看反馈</p>
          <p><strong>2025-01-15 14:20:00</strong> - 状态从待处理改为处理中</p>
          <p><strong>2025-01-15 16:45:00</strong> - 添加处理回复</p>
        </div>
      ),
    });
  };

  // 预览附件
  const handlePreview = (file: any) => {
    if (file.fileType.startsWith('image/')) {
      modal.info({
        title: file.fileName,
        width: 800,
        content: (
          <div style={{ textAlign: 'center' }}>
            <Image
              src={file.fileUrl}
              alt={file.fileName}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          </div>
        ),
      });
    } else {
      modal.info({
        title: file.fileName,
        content: '视频文件预览功能开发中',
      });
    }
  };

  // 下载附件
  const handleDownload = (file: any) => {
    message.success(`开始下载 ${file.fileName}`);
    // 实际项目中这里会调用下载API
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 加载状态
  if (pageLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载反馈详情中...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  // 数据为空
  if (!feedback) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="反馈不存在"
          description="未找到指定的反馈信息，可能已被删除或ID不正确。"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/feedback/list')}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="feedback-process" style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
          <Button icon={<ClockCircleOutlined />} onClick={handleViewLogs}>
            查看操作日志
          </Button>
        </Space>
      </Card>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧：反馈信息 */}
        <div style={{ flex: 1 }}>
          <Card title="反馈信息" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="反馈ID" span={1}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {feedback.feedbackNo}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间" span={1}>
                <Space>
                  <CalendarOutlined />
                  {feedback.createdAt}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="反馈类型" span={1}>
                {feedback.type}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态" span={1}>
                <Tag color={statusColorMap[feedback.status]}>
                  {statusTextMap[feedback.status]}
                </Tag>
              </Descriptions.Item>
              {feedback.priority && (
                <Descriptions.Item label="优先级" span={1}>
                  <Tag color={priorityColorMap[feedback.priority]}>
                    {priorityTextMap[feedback.priority]}
                  </Tag>
                </Descriptions.Item>
              )}
              {feedback.contact && (
                <Descriptions.Item label="联系方式" span={1}>
                  <Space>
                    <UserOutlined />
                    {feedback.contact}
                  </Space>
                </Descriptions.Item>
              )}
              {feedback.title && (
                <Descriptions.Item label="反馈标题" span={2}>
                  <strong>{feedback.title}</strong>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="反馈内容" span={2}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {feedback.content}
                </div>
              </Descriptions.Item>
              {feedback.externalSystem && (
                <Descriptions.Item label="关联系统" span={2}>
                  {feedback.externalSystem.name}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* 附件列表 */}
          <Card title="附件列表">
            {attachments.length > 0 ? (
              <div>
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div>
                      <div>{file.fileName}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {file.fileType} • {formatFileSize(file.fileSize)}
                      </div>
                    </div>
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(file)}
                      >
                        预览
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(file)}
                      >
                        下载
                      </Button>
                    </Space>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                无附件
              </div>
            )}
          </Card>
        </div>

        {/* 右侧：处理表单 */}
        <div style={{ flex: 1 }}>
          <Card title="处理反馈">
            <Form
              form={form}
              layout="horizontal"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              onFinish={handleSave}
            >
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select
                  placeholder="请选择状态"
                  onChange={(value) => {
                    // 当状态变为已解决或已拒绝时，回复内容变为必填
                    if (value === 'SOLVED' || value === 'REJECTED') {
                      form.setFieldsValue({ reply: '' });
                    }
                  }}
                >
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="回复内容"
                name="reply"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const status = getFieldValue('status');
                      if ((status === 'SOLVED' || status === 'REJECTED') && !value) {
                        return Promise.reject(new Error('请填写回复内容'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="请输入处理结果或回复内容"
                  maxLength={2000}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="内部备注"
                name="internalNote"
                extra="仅管理员可见的备注信息"
              >
                <TextArea
                  rows={4}
                  placeholder="请输入内部备注信息（可选）"
                  maxLength={1000}
                  showCount
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    保存处理结果
                  </Button>
                  <Button onClick={handleBack}>
                    返回列表
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackProcess;

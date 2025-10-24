import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Upload, message, Space, Tag, Divider, Typography } from 'antd';
import { UploadOutlined, SendOutlined, SearchOutlined } from '@ant-design/icons';
import { createExternalFeedbackService, ExternalFeedbackData } from '../../service/externalFeedbackService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const ExternalApiDemo: React.FC = () => {
  const [configForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [feedbackService, setFeedbackService] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  // 初始化API服务
  const initService = () => {
    const baseUrl = configForm.getFieldValue('baseUrl') || 'http://localhost:50008';
    const apiKey = configForm.getFieldValue('apiKey');
    
    if (!apiKey) {
      message.error('请输入API密钥');
      return;
    }
    
    const service = createExternalFeedbackService(baseUrl, apiKey);
    setFeedbackService(service);
    message.success('API服务初始化成功');
  };

  // 提交反馈
  const handleSubmit = async () => {
    if (!feedbackService) {
      message.error('请先初始化API服务');
      return;
    }

    try {
      setLoading(true);
      const values = await feedbackForm.validateFields();
      
      // 处理附件
      const attachments = await Promise.all(
        fileList.map(async (file) => {
          if (file.originFileObj) {
            return await feedbackService.createAttachmentWithContent(file.originFileObj);
          }
          return {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: file.url
          };
        })
      );

      const feedbackData: ExternalFeedbackData = {
        title: values.title,
        content: values.content,
        type: values.type,
        priority: values.priority,
        contact: values.contact,
        attachments: attachments.length > 0 ? attachments : undefined,
        externalId: values.externalId,
        externalData: values.externalData ? JSON.parse(values.externalData) : undefined,
        createdAt: new Date().toISOString()
      };

      const response = await feedbackService.submitFeedback(feedbackData);
      setResult(response);
      message.success('反馈提交成功');
    } catch (error: any) {
      message.error(`提交失败: ${error.message}`);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 查询反馈状态
  const handleQueryStatus = async () => {
    if (!feedbackService) {
      message.error('请先初始化API服务');
      return;
    }

    const feedbackNo = queryForm.getFieldValue('queryFeedbackNo');
    if (!feedbackNo) {
      message.error('请输入反馈编号');
      return;
    }

    try {
      setLoading(true);
      const response = await feedbackService.getFeedbackStatus(feedbackNo);
      setResult(response);
      message.success('查询成功');
    } catch (error: any) {
      message.error(`查询失败: ${error.message}`);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 文件上传处理
  const handleFileUpload = (info: any) => {
    setFileList(info.fileList);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>外部反馈API演示</Title>
      <Paragraph>
        这个页面演示如何使用外部反馈API接口提交和查询反馈信息。
      </Paragraph>

      <Card title="API配置" style={{ marginBottom: '24px' }}>
        <Form form={configForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item
            name="baseUrl"
            label="API地址"
            initialValue="http://localhost:50008"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="http://localhost:50008" />
          </Form.Item>
          
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
          
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Button type="primary" onClick={initService}>
              初始化API服务
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="提交反馈" style={{ marginBottom: '24px' }}>
        <Form form={feedbackForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item
            name="title"
            label="反馈标题"
            rules={[{ max: 200, message: '标题不能超过200个字符' }]}
          >
            <Input placeholder="请输入反馈标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="反馈内容"
            rules={[{ required: true, message: '请输入反馈内容' }, { max: 5000, message: '内容不能超过5000个字符' }]}
          >
            <TextArea rows={4} placeholder="请详细描述问题或建议" />
          </Form.Item>

          <Form.Item
            name="type"
            label="反馈类型"
            initialValue="外部反馈"
          >
            <Input placeholder="反馈类型" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            initialValue="medium"
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="contact"
            label="联系方式"
            rules={[{ max: 100, message: '联系方式不能超过100个字符' }]}
          >
            <Input placeholder="请输入联系方式" />
          </Form.Item>

          <Form.Item
            name="externalId"
            label="外部ID"
          >
            <Input placeholder="外部系统的反馈ID（可选）" />
          </Form.Item>

          <Form.Item
            name="externalData"
            label="外部数据"
          >
            <TextArea 
              rows={3} 
              placeholder='外部系统的额外数据，JSON格式（可选）
例如：{"userId": "123", "sessionId": "abc"}' 
            />
          </Form.Item>

          <Form.Item
            name="attachments"
            label="附件上传"
            extra="支持图片、视频、音频、文档等格式"
          >
            <Upload
              fileList={fileList}
              onChange={handleFileUpload}
              beforeUpload={() => false}
              multiple
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm,.mp3,.wav,.aac,.m4a,.ogg,.flac,.pdf,.doc,.docx,.txt,.zip,.rar"
            >
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              loading={loading}
              onClick={handleSubmit}
            >
              提交反馈
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="查询反馈状态" style={{ marginBottom: '24px' }}>
        <Form form={queryForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item
            name="queryFeedbackNo"
            label="反馈编号"
            rules={[{ required: true, message: '请输入反馈编号' }]}
          >
            <Input placeholder="请输入反馈编号，如：ABC123" />
          </Form.Item>
          
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Button 
              type="default" 
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleQueryStatus}
            >
              查询状态
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
        <Card title="API响应结果">
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </Card>
      )}

      <Divider />

      <Card title="使用说明">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={4}>1. API配置</Title>
            <Paragraph>
              首先需要配置API地址和API密钥。API密钥需要从系统管理员处获取。
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>2. 提交反馈</Title>
            <Paragraph>
              填写反馈信息并上传附件（可选）。系统会自动检测媒体类型。
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>3. 查询状态</Title>
            <Paragraph>
              使用返回的反馈编号查询处理状态和回复信息。
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>4. 响应格式</Title>
            <Paragraph>
              所有API响应都包含success字段表示是否成功，data字段包含具体数据。
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ExternalApiDemo;

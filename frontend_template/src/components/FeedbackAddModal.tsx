import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, Button, App, Upload, Space, Tag } from 'antd';
import { PlusOutlined, UploadOutlined, PictureOutlined, VideoCameraOutlined, AudioOutlined, LinkOutlined } from '@ant-design/icons';

import { categoryService, Category } from '../service/categoryService';

const { Option } = Select;
const { TextArea } = Input;

interface FeedbackAddModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (data?: any) => void;
}

const FeedbackAddModal: React.FC<FeedbackAddModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [detectedMediaTypes, setDetectedMediaTypes] = useState<string[]>([]);
  const { message } = App.useApp();

  // 分类数据
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 加载分类数据
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const categoriesData = await categoryService.getActiveCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('加载分类数据失败:', error);
      // 使用默认分类作为后备
      setCategories([
        { id: '1', name: '功能异常', description: '功能异常相关反馈', color: '#ff4d4f', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
        { id: '2', name: '体验建议', description: '用户体验建议', color: '#1890ff', isActive: true, sortOrder: 2, createdAt: '', updatedAt: '' },
        { id: '3', name: '新功能需求', description: '新功能需求', color: '#52c41a', isActive: true, sortOrder: 3, createdAt: '', updatedAt: '' },
        { id: '4', name: '其他', description: '其他类型反馈', color: '#fa8c16', isActive: true, sortOrder: 4, createdAt: '', updatedAt: '' },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 生成ID与反馈编号
      const id = Date.now().toString();
      const feedbackNo = 'FB' + Date.now().toString().slice(-6);
      
      // 根据上传的文件自动检测媒体类型
      const mediaTypes = detectedMediaTypes.length > 0 ? detectedMediaTypes : ['TEXT'];
      
      const feedbackData = {
        id,
        feedbackNo,
        type: values.category, // 将category映射到type字段
        mediaType: mediaTypes.join(','), // 多个媒体类型用逗号分隔
        title: values.title,
        content: values.content,
        priority: values.priority,
        status: 'PENDING',
        contact: values.contact,
        attachments: fileList.map(file => ({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: file.url || URL.createObjectURL(file.originFileObj)
        })),
        createdAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '/'),
        updatedAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '/')
      };

      console.log('新增反馈数据:', feedbackData);
      
      message.success('反馈提交成功');
      form.resetFields();
      onCancel();
      onSuccess?.(feedbackData);
    } catch (validationError) {
      console.error('表单验证失败:', validationError);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setDetectedMediaTypes([]);
    onCancel();
  };

  // 根据文件类型检测媒体类型
  const detectMediaType = (file: any): string => {
    const fileName = file.name || '';
    const fileType = file.type || '';
    
    // 图片类型检测
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
      return 'IMAGE';
    }
    
    // 视频类型检测
    if (fileType.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(fileName)) {
      return 'VIDEO';
    }
    
    // 音频类型检测
    if (fileType.startsWith('audio/') || /\.(mp3|wav|aac|m4a|ogg|flac)$/i.test(fileName)) {
      return 'VOICE';
    }
    
    // 链接类型检测（如果是URL）
    if (/^https?:\/\//.test(fileName) || fileType === 'text/uri-list') {
      return 'LINK';
    }
    
    // 默认为文本类型
    return 'TEXT';
  };

  // 检测所有文件的媒体类型并返回唯一类型列表
  const detectAllMediaTypes = (files: any[]): string[] => {
    const types = files.map(file => detectMediaType(file));
    return [...new Set(types)]; // 去重
  };

  // 获取媒体类型的友好名称
  const getMediaTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'TEXT': '文本',
      'IMAGE': '图片',
      'VIDEO': '视频',
      'VOICE': '语音',
      'LINK': '链接'
    };
    return typeMap[type] || '文本';
  };

  // 文件上传处理
  const handleFileUpload = (info: any) => {
    const { file, fileList: newFileList } = info;
    
    if (file.status === 'done') {
      message.success(`${file.name} 上传成功`);
    } else if (file.status === 'error') {
      message.error(`${file.name} 上传失败`);
    }
    
    setFileList(newFileList);
    
    // 检测所有文件的媒体类型
    if (newFileList.length > 0) {
      const mediaTypes = detectAllMediaTypes(newFileList);
      setDetectedMediaTypes(mediaTypes);
    } else {
      setDetectedMediaTypes([]);
    }
  };



  // 获取上传配置
  const getUploadConfig = () => {
    return {
      accept: '.jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm,.mp3,.wav,.aac,.m4a,.ogg,.flac,.pdf,.doc,.docx,.txt,.zip,.rar',
      maxSize: 100 * 1024 * 1024, // 100MB
      maxCount: 5,
      listType: 'text' as const,
      icon: <UploadOutlined />
    };
  };

  // 初始化分类数据
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible, loadCategories]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PlusOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          新增反馈
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
          提交反馈
        </Button>,
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          category: '功能异常',
          priority: 'medium'
        }}
      >
        <Form.Item
          name="category"
          label="反馈分类"
          rules={[
            { required: true, message: '请选择反馈分类' }
          ]}
        >
          <Select 
            placeholder="请选择反馈分类"
            loading={categoriesLoading}
            disabled={categoriesLoading}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.name}>
                <Tag color={category.color} style={{ marginRight: 8 }}>
                  {category.name}
                </Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>



        <Form.Item
          name="priority"
          label="优先级"
          rules={[
            { required: true, message: '请选择优先级' }
          ]}
        >
          <Select placeholder="请选择优先级">
            <Option value="low">低</Option>
            <Option value="medium">中</Option>
            <Option value="high">高</Option>
            <Option value="urgent">紧急</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="反馈标题"
          rules={[
            { required: true, message: '请输入反馈标题' },
            { max: 100, message: '标题不能超过100个字符' }
          ]}
        >
          <Input placeholder="请简要描述反馈内容" />
        </Form.Item>

        <Form.Item
          name="content"
          label="详细描述"
          rules={[
            { required: true, message: '请输入详细描述' }
          ]}
        >
          <TextArea
            rows={8}
            placeholder="请详细描述您遇到的问题或建议，包括：&#10;1. 问题发生的具体步骤&#10;2. 期望的结果&#10;3. 实际的结果&#10;4. 其他相关信息"
          />
        </Form.Item>

        <Form.Item
          name="contact"
          label="联系方式"
          rules={[
            { required: true, message: '请输入联系方式' },
            { 
              pattern: /^1[3-9]\d{9}$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: '请输入正确的手机号或邮箱'
            }
          ]}
        >
          <Input placeholder="请输入手机号或邮箱，方便我们联系您" />
        </Form.Item>

        <Form.Item
          name="attachments"
          label="附件上传"
          extra="上传文件后会自动识别媒体类型，支持图片、视频、音频、文档等格式"
        >
          <Upload
            fileList={fileList}
            onChange={handleFileUpload}
            beforeUpload={() => false} // 阻止自动上传，仅用于文件选择
            multiple
            {...getUploadConfig()}
          >
            {fileList.length < getUploadConfig().maxCount && (
              <div style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '6px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
              >
                {getUploadConfig().icon}
                <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>上传文件</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* 检测到的媒体类型显示 */}
        {detectedMediaTypes.length > 0 && (
          <Form.Item label="媒体类型">
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>检测到：</span>
              <Space wrap>
                {detectedMediaTypes.map((type, index) => (
                  <Tag
                    key={index}
                    color="green"
                    icon={
                      type === 'IMAGE' ? <PictureOutlined /> :
                      type === 'VIDEO' ? <VideoCameraOutlined /> :
                      type === 'VOICE' ? <AudioOutlined /> :
                      type === 'LINK' ? <LinkOutlined /> :
                      <span>📝</span>
                    }
                  >
                    {getMediaTypeName(type)}
                  </Tag>
                ))}
              </Space>
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default FeedbackAddModal;

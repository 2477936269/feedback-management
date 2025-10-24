import React from 'react';
import { Modal, Descriptions, Tag, Space, Divider, Typography, Card, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  StopOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { FeedbackData } from '../pages/feedback-list';

const { Title, Paragraph } = Typography;

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FeedbackDetailModalProps {
  visible: boolean;
  feedback: FeedbackData | null;
  onCancel: () => void;
}

// 状态标签颜色映射
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

// 状态图标映射
const statusIconMap = {
  PENDING: <ClockCircleOutlined />,
  PROCESSING: <ExclamationCircleOutlined />,
  SOLVED: <CheckCircleOutlined />,
  REJECTED: <StopOutlined />,
};

const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  visible,
  feedback,
  onCancel,
}) => {
  if (!feedback) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>反馈详情</span>
          <Tag 
            color={statusColorMap[feedback.status]} 
            icon={statusIconMap[feedback.status]}
          >
            {statusTextMap[feedback.status]}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      styles={{
        header: { borderBottom: '1px solid #f0f0f0' },
        body: { padding: '24px' },
      }}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* 基本信息 */}
        <Card 
          title={
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <span>基本信息</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="反馈ID" span={2}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#1890ff'
              }}>
                {feedback.feedbackNo}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="反馈标题" span={2}>
              <Title level={5} style={{ margin: 0 }}>
                {feedback.title || '无标题'}
              </Title>
            </Descriptions.Item>
            <Descriptions.Item label="反馈类型" span={1}>
              <Tag color="blue">{feedback.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="媒体类型" span={1}>
              <Tag color={feedback.mediaType === 'TEXT' ? 'default' : 
                          feedback.mediaType === 'IMAGE' ? 'blue' :
                          feedback.mediaType === 'VIDEO' ? 'purple' :
                          feedback.mediaType === 'VOICE' ? 'green' :
                          feedback.mediaType === 'LINK' ? 'orange' : 'default'}>
                {feedback.mediaType === 'TEXT' ? '文本' :
                 feedback.mediaType === 'IMAGE' ? '图片' :
                 feedback.mediaType === 'VIDEO' ? '视频' :
                 feedback.mediaType === 'VOICE' ? '语音' :
                 feedback.mediaType === 'LINK' ? '链接' : '文本'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级" span={2}>
              <Tag color={priorityColorMap[feedback.priority || 'low']}>
                {priorityTextMap[feedback.priority || 'low']}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="联系方式" span={2}>
              <Space>
                <UserOutlined style={{ color: '#8c8c8c' }} />
                <span>{feedback.contact || '未提供'}</span>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 反馈内容 */}
        <Card 
          title={
            <Space>
              <FileTextOutlined style={{ color: '#52c41a' }} />
              <span>反馈内容</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Paragraph style={{ 
            margin: 0, 
            padding: '12px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}>
            {feedback.content}
          </Paragraph>
        </Card>

        {/* 回复信息 */}
        {feedback.reply && (
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>回复信息</span>
              </Space>
            }
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <Paragraph style={{ 
              margin: 0, 
              padding: '12px',
              backgroundColor: '#f6ffed',
              borderRadius: '6px',
              border: '1px solid #b7eb8f',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6'
            }}>
              {feedback.reply}
            </Paragraph>
          </Card>
        )}

        {/* 附件信息 */}
        {feedback.attachments && (
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: '#fa8c16' }} />
                <span>附件信息</span>
              </Space>
            }
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <div style={{ 
              padding: '12px',
              backgroundColor: '#fff7e6',
              borderRadius: '6px',
              border: '1px solid #ffd591'
            }}>
              {Array.isArray(feedback.attachments) ? (
                <div>
                  {feedback.attachments.map((attachment, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold' }}>{attachment.fileName}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {attachment.fileType} • {formatFileSize(attachment.fileSize)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span>{feedback.attachments}</span>
              )}
            </div>
          </Card>
        )}

        {/* 时间信息 */}
        <Card 
          title={
            <Space>
              <CalendarOutlined style={{ color: '#722ed1' }} />
              <span>时间信息</span>
            </Space>
          }
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ 
                padding: '12px',
                backgroundColor: '#f9f0ff',
                borderRadius: '6px',
                border: '1px solid #d3adf7',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  提交时间
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#722ed1' }}>
                  {feedback.createdAt}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                padding: '12px',
                backgroundColor: '#f6ffed',
                borderRadius: '6px',
                border: '1px solid #b7eb8f',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  更新时间
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#52c41a' }}>
                  {feedback.updatedAt}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 外部系统信息 */}
        {feedback.externalSystem && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <Card 
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                  <span>外部系统信息</span>
                </Space>
              }
              size="small"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="系统ID" span={1}>
                  <span style={{ fontFamily: 'monospace' }}>
                    {feedback.externalSystem.id}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="系统名称" span={1}>
                  <Tag color="orange">{feedback.externalSystem.name}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </div>
    </Modal>
  );
};

export default FeedbackDetailModal;

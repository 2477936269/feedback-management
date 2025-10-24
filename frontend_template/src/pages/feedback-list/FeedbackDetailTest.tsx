import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FeedbackData } from './index';

const { Title, Paragraph } = Typography;

const FeedbackDetailTest: React.FC = () => {
  const navigate = useNavigate();

  // 模拟反馈数据
  const mockFeedback: FeedbackData = {
    id: 'test001',
    feedbackNo: 'FB001',
    type: '功能异常',
    title: '登录按钮点击无反应',
    content: '登录按钮点击无反应，无法正常登录系统。用户点击登录按钮后，页面没有任何响应，也没有错误提示。这个问题在Chrome浏览器中经常出现。',
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

  const handleTestDetail = () => {
    // 通过路由状态传递数据
    navigate(`/feedback/process/${mockFeedback.id}`, { 
      state: { feedback: mockFeedback } 
    });
  };

  const handleTestDetailWithoutState = () => {
    // 不传递路由状态，测试页面是否能正常加载
    navigate(`/feedback/process/${mockFeedback.id}`);
  };

  const handleTestInvalidId = () => {
    // 测试无效ID的情况
    navigate('/feedback/process/invalid-id');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>反馈详情功能测试</Title>
        <Paragraph>
          这个页面用于测试反馈详情功能是否正常工作。点击不同的按钮测试不同的场景。
        </Paragraph>
      </Card>

      <Card title="测试场景" style={{ marginTop: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            size="large" 
            block
            onClick={handleTestDetail}
          >
            测试1：正常详情页面（带数据）
          </Button>
          
          <Button 
            size="large" 
            block
            onClick={handleTestDetailWithoutState}
          >
            测试2：详情页面（无数据，模拟加载）
          </Button>
          
          <Button 
            size="large" 
            block
            onClick={handleTestInvalidId}
          >
            测试3：无效ID（测试错误处理）
          </Button>
        </Space>
      </Card>

      <Card title="测试数据" style={{ marginTop: '16px' }}>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(mockFeedback, null, 2)}
        </pre>
      </Card>

      <Card title="说明" style={{ marginTop: '16px' }}>
        <Paragraph>
          <strong>测试1：</strong> 通过路由状态传递完整的反馈数据，页面应该立即显示内容。
        </Paragraph>
        <Paragraph>
          <strong>测试2：</strong> 不传递路由状态，页面会模拟加载过程，然后显示模拟数据。
        </Paragraph>
        <Paragraph>
          <strong>测试3：</strong> 使用无效ID，测试错误处理机制。
        </Paragraph>
      </Card>
    </div>
  );
};

export default FeedbackDetailTest;

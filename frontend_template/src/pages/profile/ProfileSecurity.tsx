import React from 'react';
import { Card, Button, Skeleton, List, Avatar, Divider, Typography, Tag, Space } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, BellOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProfileSecurityProps {
  loading: boolean;
  recentLogins: any[];
  onChangePassword: () => void;
}

const ProfileSecurity: React.FC<ProfileSecurityProps> = ({
  loading,
  recentLogins,
  onChangePassword
}) => {
  return (
    <Card
      title="安全设置"
      extra={
        <Button 
          type="primary"
          icon={<LockOutlined />}
          onClick={onChangePassword}
        >
          修改密码
        </Button>
      }
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <Skeleton loading={loading} active>
        <div>
          <List>
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<SafetyCertificateOutlined />} />}
                title="登录密码"
                description="定期修改密码可以保护您的账户安全"
              />
            </List.Item>
            
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<BellOutlined />} />}
                title="账户通知"
                description="接收账户安全相关的通知"
              />
              <Space>
                <Tag color="green">邮件</Tag>
                <Tag color="blue">站内信</Tag>
              </Space>
            </List.Item>
          </List>
          
          <Divider />
          
          <Title level={4}>最近登录记录</Title>
          <List
            dataSource={recentLogins}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<HistoryOutlined />} />}
                  title={`登录时间: ${item.time}`}
                  description={`IP: ${item.ip} · 位置: ${item.location} · 设备: ${item.device}`}
                />
              </List.Item>
            )}
          />
        </div>
      </Skeleton>
    </Card>
  );
};

export default ProfileSecurity;
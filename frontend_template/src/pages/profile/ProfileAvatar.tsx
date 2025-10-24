import React from 'react';
import { Card, Avatar, Typography, Button, Skeleton, Space, Tag, Upload } from 'antd';
import { UserOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

interface ProfileAvatarProps {
  loading: boolean;
  user: any;
  avatarUrl: string;
  fileList: UploadFile[];
  onAvatarChange: (info: any) => void;
  onAvatarUpload: (options: any) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  loading,
  user,
  avatarUrl,
  fileList,
  onAvatarChange,
  onAvatarUpload
}) => {
  return (
    <Card
      title="个人资料"
      extra={
        <Button 
          type="text" 
          icon={<PictureOutlined />}
          onClick={() => {
            const uploadButton = document.querySelector('.avatar-upload button');
            if (uploadButton) {
              (uploadButton as HTMLElement).click();
            }
          }}
        >
          更换头像
        </Button>
      }
      style={{ height: '100%' }}
    >
      <Skeleton loading={loading} avatar active>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0'
        }}>
          <Upload
            name="avatar"
            showUploadList={false}
            customRequest={onAvatarUpload}
            onChange={onAvatarChange}
            fileList={fileList}
            className="avatar-upload"
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar 
                size={120} 
                src={avatarUrl} 
                icon={<UserOutlined />} 
                style={{ cursor: 'pointer' }}
              />
              <div 
                style={{ 
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#1890ff',
                  borderRadius: '50%',
                  padding: '4px',
                  cursor: 'pointer'
                }}
              >
                <UploadOutlined style={{ color: '#fff' }} />
              </div>
            </div>
          </Upload>
          
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
            {user?.name || user?.realName || user?.username || '用户'}
          </Title>
          
          <Space direction="vertical" size="small" align="center" style={{ marginTop: 8 }}>
            <Text type="secondary">{user?.email || '未设置邮箱'}</Text>
            <Text type="secondary">{user?.department || '未设置部门'} {user?.position ? `/ ${user.position}` : ''}</Text>
            <Text type="secondary">用户ID: {user?.id || user?.userId || '未知'}</Text>
          </Space>
          
          <Space style={{ marginTop: 16 }}>
            {user?.roles?.map((role: any) => (
              <Tag color="blue" key={role.id || role.name || role.code}>
                {role.name || role.code}
              </Tag>
            ))}
          </Space>
        </div>
      </Skeleton>
    </Card>
  );
};

export default ProfileAvatar;
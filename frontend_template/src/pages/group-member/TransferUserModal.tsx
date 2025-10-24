import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import GenericModalTransfer, { TransferItemData } from '../../components/generic/GenericModalTransfer';
import { addUserGroupMembers, removeUserGroupMember } from '../../service/userGroupService';

interface TransferUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  groupId?: string;
  groupName?: string;
  currentMembers: TransferItemData[];
  allUsers: TransferItemData[];
  loading?: boolean;
}

const TransferUserModal: React.FC<TransferUserModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  groupId,
  groupName,
  currentMembers: initialMembers,
  allUsers: initialAllUsers,
  loading = false,
}) => {
  const [currentMembers, setCurrentMembers] = useState<TransferItemData[]>([]);
  const [allUsers, setAllUsers] = useState<TransferItemData[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  // 初始化数据
  useEffect(() => {
    if (visible) {
      setCurrentMembers(initialMembers);
      setAllUsers(initialAllUsers);
    }
  }, [visible, initialMembers, initialAllUsers]);

  // 处理成员变更
  const handleMemberChange = (targetData: TransferItemData[]) => {
    console.log('转移后的组成员数据:', targetData);
    setCurrentMembers(targetData);
  };

  // 保存成员变更
  const handleSaveMembers = async (targetData: TransferItemData[]) => {
    if (!groupId) {
      message.warning('请先选择用户组');
      return;
    }
  
    try {
      setSaveLoading(true);
      
      // 计算新增和删除的成员
      const originalMemberIds = initialMembers.map(member => member.id);
      const currentMemberIds = targetData.map(member => member.id);
      
      const addedMemberIds = currentMemberIds.filter(id => !originalMemberIds.includes(id));
      const removedMemberIds = originalMemberIds.filter(id => !currentMemberIds.includes(id));
      
      // 处理添加操作
      if (addedMemberIds.length > 0) {
        await addUserGroupMembers(groupId, { userIds: addedMemberIds });
      }
      
      // 处理移除操作
      for (const userId of removedMemberIds) {
        await removeUserGroupMember(groupId, userId);
      }
      
      if (addedMemberIds.length > 0 || removedMemberIds.length > 0) {
        message.success('用户组成员已更新');
        onSuccess();
      } else {
        message.info('没有成员变更');
        onCancel();
      }
    } catch (error) {
      console.error('保存用户组成员失败:', error);
      message.error('保存用户组成员失败');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <GenericModalTransfer
      visible={visible}
      title={groupName ? `管理组成员: ${groupName}` : '管理组成员'}
      onCancel={onCancel}
      width={900}
      okText="保存"
      cancelText="取消"
      sourceTitle="可选用户"
      targetTitle="组成员"
      sourceData={allUsers}
      targetData={currentMembers}
      loading={loading}
      saveLoading={saveLoading}
      onChange={handleMemberChange}
      onSave={handleSaveMembers}
      disabled={!groupId}
      height={400}
    />
  );
};

export default TransferUserModal;
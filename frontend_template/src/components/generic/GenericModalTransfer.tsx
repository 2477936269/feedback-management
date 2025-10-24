import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Empty, List, Checkbox, Typography, Modal } from 'antd';
import { SearchOutlined, LeftOutlined, RightOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 转移项数据接口
export interface TransferItemData {
  id: string;
  title: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;  // 允许其他自定义属性
}

// 组件属性接口
export interface GenericModalTransferProps {
  // 模态框属性
  visible: boolean;
  title?: string;
  width?: number | string;
  onCancel: () => void;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  okButtonProps?: any;
  cancelButtonProps?: any;
  
  // 穿梭框属性
  sourceTitle?: string; // 源列表标题
  targetTitle?: string; // 目标列表标题
  sourceData: TransferItemData[]; // 源数据列表
  targetData: TransferItemData[]; // 已选数据列表
  loading?: boolean;
  saveLoading?: boolean;  // 保存按钮加载状态
  showSearch?: boolean;
  height?: number | string;
  
  // 回调函数
  onChange?: (targetData: TransferItemData[]) => void; // 数据变更时回调
  onSave?: (targetData: TransferItemData[]) => void; // 保存按钮点击回调
  onRefresh?: () => void;
  disabled?: boolean; // 是否禁用
}

/**
 * 通用穿梭框模态框组件
 */
const GenericModalTransfer: React.FC<GenericModalTransferProps> = ({
  // 模态框属性
  visible = false,
  title = '选择数据',
  width = 900,
  onCancel,
  onOk,
  okText = '确定',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  
  // 穿梭框属性
  sourceTitle = '可选列表',
  targetTitle = '已选列表',
  sourceData = [],
  targetData = [],
  loading = false,
  saveLoading = false,
  showSearch = true,
  height = 500,
  
  // 回调函数
  onChange,
  onSave,
  onRefresh,
  disabled = false,
}) => {
  // 状态定义
  const [leftSearchValue, setLeftSearchValue] = useState<string>('');
  const [rightSearchValue, setRightSearchValue] = useState<string>('');
  const [filteredSourceData, setFilteredSourceData] = useState<TransferItemData[]>(sourceData);
  const [filteredTargetData, setFilteredTargetData] = useState<TransferItemData[]>(targetData);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [internalTargetData, setInternalTargetData] = useState<TransferItemData[]>(targetData);

  // 当源数据变化时，更新过滤后的源数据
  useEffect(() => {
    filterSourceData(leftSearchValue);
  }, [sourceData, internalTargetData]);

  // 当目标数据变化时，更新过滤后的目标数据
  useEffect(() => {
    filterTargetData(rightSearchValue);
  }, [internalTargetData]);
  
  // 当外部传入的目标数据变化时，更新内部目标数据
  useEffect(() => {
    setInternalTargetData(targetData);
  }, [targetData]);

  // 处理左侧搜索
  const handleLeftSearch = (value: string) => {
    setLeftSearchValue(value);
    filterSourceData(value);
  };

  // 处理右侧搜索
  const handleRightSearch = (value: string) => {
    setRightSearchValue(value);
    filterTargetData(value);
  };

  // 过滤源数据
  const filterSourceData = (value: string) => {
    // 排除已在目标列表中的项
    const targetIds = internalTargetData.map(item => item.id);
    const availableSourceData = sourceData.filter(item => !targetIds.includes(item.id));
    
    if (!value) {
      setFilteredSourceData(availableSourceData);
      return;
    }
    
    const filtered = availableSourceData.filter(item => 
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(value.toLowerCase()))
    );
    
    setFilteredSourceData(filtered);
  };

  // 过滤目标数据
  const filterTargetData = (value: string) => {
    if (!value) {
      setFilteredTargetData(internalTargetData);
      return;
    }
    
    const filtered = internalTargetData.filter(item => 
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(value.toLowerCase()))
    );
    
    setFilteredTargetData(filtered);
  };

  // 处理向右传送（从源到目标）
  const handleMoveToRight = () => {
    if (selectedSourceIds.length === 0 || disabled) return;
    
    // 找到选中的源项
    const selectedItems = sourceData.filter(item => selectedSourceIds.includes(item.id));
    
    // 更新内部目标数据
    const newTargetData = [...internalTargetData, ...selectedItems];
    setInternalTargetData(newTargetData);
    
    // 清除源选择
    setSelectedSourceIds([]);
    
    // 触发回调
    if (onChange) {
      onChange(newTargetData);
    }
  };

  // 处理向左传送（从目标到源）
  const handleMoveToLeft = () => {
    if (selectedTargetIds.length === 0 || disabled) return;
    
    // 更新内部目标数据，移除选中项
    const newTargetData = internalTargetData.filter(item => !selectedTargetIds.includes(item.id));
    setInternalTargetData(newTargetData);
    
    // 清除目标选择
    setSelectedTargetIds([]);
    
    // 触发回调
    if (onChange) {
      onChange(newTargetData);
    }
  };

  // 处理源项选择
  const handleSourceSelect = (itemId: string, checked: boolean) => {
    if (disabled) return;
    
    if (checked) {
      setSelectedSourceIds(prev => [...prev, itemId]);
    } else {
      setSelectedSourceIds(prev => prev.filter(id => id !== itemId));
    }
  };

  // 处理目标项选择
  const handleTargetSelect = (itemId: string, checked: boolean) => {
    if (disabled) return;
    
    if (checked) {
      setSelectedTargetIds(prev => [...prev, itemId]);
    } else {
      setSelectedTargetIds(prev => prev.filter(id => id !== itemId));
    }
  };

  // 处理保存按钮点击
  const handleSave = () => {
    if (onSave) {
      onSave(internalTargetData);
    } else if (onOk) {
      onOk();
    }
  };

  // 渲染列表项
  const renderListItem = (item: TransferItemData, isSource: boolean) => {
    const selected = isSource 
      ? selectedSourceIds.includes(item.id) 
      : selectedTargetIds.includes(item.id);
    
    return (
      <List.Item
        key={item.id}
        style={{
          padding: '8px 0',
          cursor: disabled ? 'not-allowed' : 'default',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <Checkbox
          checked={selected}
          disabled={disabled || item.disabled}
          onChange={(e) => {
            if (isSource) {
              handleSourceSelect(item.id, e.target.checked);
            } else {
              handleTargetSelect(item.id, e.target.checked);
            }
          }}
          style={{ marginRight: 8 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{item.title}</div>
          {item.description && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {item.description}
            </div>
          )}
        </div>
      </List.Item>
    );
  };

  // 定义模态框底部按钮
  const modalFooter = [
    <Button 
      key="cancel" 
      onClick={onCancel}
      {...cancelButtonProps}
    >
      {cancelText}
    </Button>,
    <Button
      key="save"
      type="primary"
      icon={<SaveOutlined />}
      loading={saveLoading}
      onClick={handleSave}
      disabled={disabled}
      {...okButtonProps}
    >
      {okText}
    </Button>,
  ];

   // 修改内容部分的宽度布局
  
  // 在 return 语句中，修改最外层容器的样式
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      width={width}
      footer={modalFooter}
      destroyOnClose
      maskClosable={false}
      styles={{ body: { 
        padding: '20px', 
        overflow: 'auto'  // 确保内容过长时可以滚动
      } }}
    >
      <div 
        style={{ 
          display: 'flex', 
          height: typeof height === 'number' ? `${height}px` : height,
          width: '100%',
          justifyContent: 'center'  // 水平居中内容
        }}
      >
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '800px'  // 限制内容最大宽度
        }}>
          {/* 左侧列表（源） */}
          <div style={{ flex: 7, display: 'flex', flexDirection: 'column', marginRight: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>{sourceTitle}</div>
            {showSearch && (
              <Search
                placeholder="搜索..."
                allowClear
                value={leftSearchValue}
                onChange={e => handleLeftSearch(e.target.value)}
                style={{ marginBottom: 8 }}
                disabled={disabled}
              />
            )}
            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 4, padding: '0 8px' }}>
              {filteredSourceData.length > 0 ? (
                <List
                  dataSource={filteredSourceData}
                  renderItem={item => renderListItem(item, true)}
                  size="small"
                />
              ) : (
                <Empty description="暂无数据" style={{ margin: '40px 0' }} />
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {`${selectedSourceIds.length} 项已选 / 共 ${filteredSourceData.length} 项`}
              </Text>
            </div>
          </div>
  
          {/* 中间操作按钮 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12px', width: '50px' }}>
            <Button
              type="primary"
              icon={<RightOutlined />}
              disabled={selectedSourceIds.length === 0 || disabled}
              onClick={handleMoveToRight}
              style={{ marginBottom: 12 }}
            />
            <Button
              type="primary"
              icon={<LeftOutlined />}
              disabled={selectedTargetIds.length === 0 || disabled}
              onClick={handleMoveToLeft}
            />
          </div>
  
          {/* 右侧列表（目标） */}
          <div style={{ flex: 7, display: 'flex', flexDirection: 'column', marginLeft: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>{targetTitle}</div>
            {showSearch && (
              <Search
                placeholder="搜索..."
                allowClear
                value={rightSearchValue}
                onChange={e => handleRightSearch(e.target.value)}
                style={{ marginBottom: 8 }}
                disabled={disabled}
              />
            )}
            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 4, padding: '0 8px' }}>
              {filteredTargetData.length > 0 ? (
                <List
                  dataSource={filteredTargetData}
                  renderItem={item => renderListItem(item, false)}
                  size="small"
                />
              ) : (
                <Empty description="暂无数据" style={{ margin: '40px 0' }} />
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {`${selectedTargetIds.length} 项已选 / 共 ${filteredTargetData.length} 项`}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GenericModalTransfer;
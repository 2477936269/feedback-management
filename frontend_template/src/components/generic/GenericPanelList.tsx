import React, { useState, useEffect } from 'react';
import { Card, Input, List, Space, Button, Empty, Tag, Dropdown, Menu } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, EllipsisOutlined } from '@ant-design/icons';

const { Search } = Input;

// 列表项数据接口
export interface ListItemData {
  id: string;
  leftContent: string;  // 左侧内容（岗位名称）
  rightContent: React.ReactNode;  // 右侧内容（岗位人数）
  [key: string]: any;  // 允许其他自定义属性
}

// 组件属性接口
export interface GenericPanelListProps {
  title?: string;
  listData: ListItemData[];
  loading?: boolean;
  buttons?: React.ReactNode[];
  onSelect?: (item: ListItemData) => void;
  onAddClick?: () => void;
  onRefresh?: () => void;
  height?: number | string;
  showSearch?: boolean;
  selectedId?: string;  // 当前选中项的ID
  menuItems?: { key: string; label: string }[];  // 添加菜单项配置
  onMenuClick?: (item: ListItemData, action: string) => void;  // 菜单点击回调
}

/**
 * 通用列表面板组件
 */
const GenericPanelList: React.FC<GenericPanelListProps> = ({
  title = '数据列表',
  listData = [],
  loading = false,
  buttons = [],
  onSelect,
  onAddClick,
  onRefresh,
  height = 400,
  showSearch = true,
  selectedId,
  menuItems = [],  // 默认为空数组
  onMenuClick,
}) => {
  // 状态定义
  const [searchValue, setSearchValue] = useState<string>('');
  const [filteredListData, setFilteredListData] = useState<ListItemData[]>(listData);

  // 当原始列表数据变化时，更新过滤后的列表数据
  useEffect(() => {
    if (searchValue) {
      filterList(searchValue);
    } else {
      setFilteredListData(listData);
    }
  }, [listData]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      filterList(value);
    } else {
      setFilteredListData(listData);
    }
  };

  // 过滤列表数据
  const filterList = (value: string) => {
    const filtered = listData.filter(item => 
      item.leftContent.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredListData(filtered);
  };

  // 构建默认按钮
  const defaultButtons = [];
  
  // 添加刷新按钮
  if (onRefresh) {
    defaultButtons.push(
      <Button 
        key="refresh"
        type="link"
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        style={{
          fontSize: '14px',
          padding: '0 8px',
        }}
      >
        刷新
      </Button>
    );
  }
  
  // 添加新增按钮
  if (onAddClick) {
    defaultButtons.push(
      <Button 
        key="add"
        type="link"
        icon={<PlusOutlined />}
        onClick={onAddClick}
        style={{
          fontSize: '14px',
          padding: '0 8px',
        }}
      >
        添加
      </Button>
    );
  }

  // 合并默认按钮和自定义按钮
  const allButtons = [...defaultButtons, ...buttons];

  // 从标签或其他React元素中提取数字
  const extractNumberFromContent = (content: React.ReactNode): string => {
    // 如果已经是数字或字符串，直接返回
    if (typeof content === 'number') return content.toString();
    if (typeof content === 'string') return content;
    
    // 处理React元素
    if (React.isValidElement(content)) {
      // 如果是Tag组件，尝试从children中提取
      const children = content.props.children;
      
      if (children) {
        // 如果children是字符串，提取数字部分
        if (typeof children === 'string') {
          const match = children.match(/(\d+)/);
          return match ? match[1] : '0';
        }
        
        // 如果children是数字
        if (typeof children === 'number') {
          return children.toString();
        }
      }
    }
    
    // 默认返回0
    return '0';
  };

  // 渲染菜单图标及下拉菜单
  const renderItemMenu = (item: ListItemData) => {
    const menu = (
      <Menu onClick={({ key }) => onMenuClick && onMenuClick(item, key as string)}>
        {menuItems.map(menuItem => (
          <Menu.Item key={menuItem.key}>{menuItem.label}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button
          type="text"
          icon={<EllipsisOutlined />}
          size="small"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            marginLeft: 'auto', 
            padding: '0 5px',
            color: '#bfbfbf'
          }}
          className="list-item-menu-button"
        />
      </Dropdown>
    );
  };
  
  return (
    <Card
      title={title}
      extra={
        <Space>
          {allButtons.map((button, index) => (
            React.cloneElement(button as React.ReactElement, { key: index })
          ))}
        </Space>
      }
      className="list-panel"
      loading={loading}
      styles={{
        body: { 
          padding: showSearch ? '12px 24px' : '0 24px', 
          height: typeof height === 'number' ? `${height}px` : height, 
          overflow: 'auto' 
        }
      }}
    >
      {showSearch && (
        <Search
          placeholder="搜索..."
          allowClear
          onChange={e => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {filteredListData.length > 0 ? (
        <List
          className="position-list"
          dataSource={filteredListData}
          renderItem={item => (
            <List.Item
              key={item.id}
              onClick={() => onSelect && onSelect(item)}
              style={{
                cursor: onSelect ? 'pointer' : 'default',
                backgroundColor: selectedId === item.id ? '#f0f7ff' : 'transparent',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
              className="list-item"
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                alignItems: 'center' 
              }}>
                {/* 左侧区域：文字+数字标记 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: selectedId === item.id ? 500 : 400 
                }}>
                  {/* 左侧内容 */}
                  <span style={{ marginRight: '8px' }}>
                    {item.leftContent}
                  </span>
                  
                  {/* 圆形数字标记 */}
                  {item.rightContent && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(24, 144, 255, 0.7)',  // 修改为带透明度的颜色
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      fontWeight: 'normal',
                      lineHeight: '20px',
                      textAlign: 'center'
                    }}>
                      {extractNumberFromContent(item.rightContent)}
                    </div>
                  )}
                </div>
                
                {/* 右侧：省略号菜单 */}
                {onMenuClick && menuItems.length > 0 && renderItemMenu(item)}
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无数据" />
      )}
    </Card>
  );
};

export default GenericPanelList;
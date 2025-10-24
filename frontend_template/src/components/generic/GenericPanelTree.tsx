import React, { useState, useEffect } from 'react';
import { Tree, Input, Card, Space, Button, Typography, Empty, Dropdown, Menu } from 'antd';
import { SearchOutlined, EllipsisOutlined, ReloadOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/lib/tree';

const { Search } = Input;
const { Text } = Typography;

// 修改全局样式，添加调整间距的CSS
// 修改全局样式，调整箭头方向
const globalStyles = `
  .tree-panel .ant-tree .ant-tree-list .ant-tree-list-holder .ant-tree-treenode {
    width: 100% !important;
  }
  
  .tree-panel .ant-tree .ant-tree-list .ant-tree-list-holder .ant-tree-node-content-wrapper {
    width: 100% !important;
    display: flex !important;
    padding: 0 4px !important;
  }
  
  .tree-panel .ant-tree .ant-tree-list .ant-tree-list-holder .ant-tree-title {
    display: flex !important;
    width: 100% !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  
  .tree-panel .ant-tree-switcher .anticon {
    color: #bfbfbf !important;
  }
  
  .tree-panel .ant-tree-switcher {
    padding: 0 2px !important;
    width: 18px !important;
  }
  
  .tree-panel .tree-node-add-button {
    color: #bfbfbf !important;
  }
  
  .tree-panel .tree-node-add-button:hover {
    color: #1890ff !important;
  }
  
  .compact-tree .ant-tree-treenode {
    padding: 0 !important;
  }
`;

// 树节点数据接口
export interface TreeNodeData {
  key: string;
  title: string;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  [key: string]: any;
}

// 组件属性接口 - 添加 selectedKeys 属性
export interface GenericPanelTreeProps {
  title?: string;
  treeData: TreeNodeData[];
  loading?: boolean;
  buttons?: React.ReactNode[];
  onSelect?: (selectedKeys: React.Key[], info: any) => void;
  onMenuClick?: (node: TreeNodeData, action: string) => void;
  onRefresh?: () => void;
  height?: number | string;
  showSearch?: boolean;
  showLine?: boolean | { showLeafIcon: boolean };
  showIcon?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: string[];
  defaultSelectedKeys?: string[];
  menuItems?: { key: string; label: string }[];
  switcherIcon?: React.ReactNode;
  // 添加新属性
  selectedKeys?: React.Key[]; // 支持从外部控制选中状态
}

/**
 * 通用树面板组件
 */
const GenericPanelTree: React.FC<GenericPanelTreeProps> = ({
  title = '数据树',
  treeData = [],
  loading = false,
  buttons = [],
  onSelect,
  onMenuClick,
  onRefresh,
  height = 400,
  showSearch = true,
  showLine = true,
  showIcon = false,
  defaultExpandAll = true,
  defaultExpandedKeys = [],
  defaultSelectedKeys = [],
  menuItems = [],
  switcherIcon,
  // 添加到参数列表
  selectedKeys,
}) => {
  // 状态定义
  const [searchValue, setSearchValue] = useState<string>(''); 
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(defaultExpandedKeys); 
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true); 
  const [filteredTreeData, setFilteredTreeData] = useState<TreeNodeData[]>(treeData); 

  // 当原始树数据变化时，更新过滤后的树数据
  useEffect(() => {
    if (searchValue) {
      filterTree(searchValue);
    } else {
      setFilteredTreeData(treeData);
    }
  }, [treeData]);
  
  // 添加这个新的 useEffect 以处理 defaultExpandAll
  useEffect(() => {
    if (defaultExpandAll && treeData.length > 0) {
      // 收集所有节点的 key
      const getAllKeys = (nodes: TreeNodeData[]): React.Key[] => {
        let keys: React.Key[] = [];
        nodes.forEach(node => {
          keys.push(node.key);
          if (node.children && node.children.length > 0) {
            keys = [...keys, ...getAllKeys(node.children)];
          }
        });
        return keys;
      };
      
      const allKeys = getAllKeys(treeData);
      setExpandedKeys(allKeys);
      setAutoExpandParent(true);
    }
  }, [treeData, defaultExpandAll]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      filterTree(value);
    } else {
      setFilteredTreeData(treeData);
      setExpandedKeys(defaultExpandedKeys);
    }
  };

  // 过滤树数据
  const filterTree = (value: string) => {
    const expandKeys: React.Key[] = [];
    
    // 递归查找匹配节点及其父节点
    const filterData = (data: TreeNodeData[]): TreeNodeData[] => {
      return data
        .map(node => {
          const matchNode = node.title.toLowerCase().includes(value.toLowerCase());
          
          // 处理子节点
          const children = node.children ? filterData(node.children) : [];
          const matchChildren = children.length > 0;
          
          // 如果自身匹配或有匹配的子节点，则保留节点
          if (matchNode || matchChildren) {
            expandKeys.push(node.key);
            return {
              ...node,
              children: children.length > 0 ? children : undefined,
            };
          }
          return null;
        })
        .filter(node => node !== null) as TreeNodeData[];
    };
    
    const filtered = filterData(treeData);
    setFilteredTreeData(filtered);
    setExpandedKeys(expandKeys);
    setAutoExpandParent(true);
  };

  // 处理展开/折叠
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  // 渲染树节点标题，包括菜单按钮
  const renderNodeTitle = (node: TreeNodeData) => {
    const menu = (
      <Menu onClick={({ key }) => onMenuClick && onMenuClick(node, key as string)}>
        {menuItems.map(item => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%' 
      }}>
        <Text ellipsis style={{ maxWidth: 'calc(100% - 24px)' }}>{node.title}</Text>
        {onMenuClick && menuItems && menuItems.length > 0 && (
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
              className="tree-node-add-button"
            />
          </Dropdown>
        )}
      </div>
    );
  };

  // 添加自定义标题到树数据
  const addCustomTitleToData = (data: TreeNodeData[]): DataNode[] => {
    return data.map(node => {
      const newNode: DataNode = {
        ...node,
        title: renderNodeTitle(node),
      };
      
      if (node.children) {
        newNode.children = addCustomTitleToData(node.children);
      }
      
      return newNode;
    });
  };

  // 带自定义标题的树数据
  const treeDataWithCustomTitle = addCustomTitleToData(filteredTreeData);

  // 构建默认右上角刷新按钮
  const defaultButtons = onRefresh ? [
    <Button 
      key="refresh"
      type="link"
      icon={<ReloadOutlined />}
      onClick={onRefresh}
      style={{
        fontSize: '14px',
        padding: '0 8px',
        color: '#bfbfbf'
      }}
    >
      刷新
    </Button>
  ] : [];
  
  // 增强 switcherIconFunc 函数
  const switcherIconFunc = (props: any) => {
    const expanded = !!props.expanded;
    
    // 添加内联样式，确保不会被其他样式覆盖
    const iconStyle = { 
      color: '#bfbfbf', 
      transform: 'none !important',
      transition: 'none !important',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
    
    if (expanded) {
      // 向下箭头 - 使用内置图标
      return <CaretDownOutlined style={iconStyle} />;
    } else {
      // 向右箭头 - 使用内置图标
      return <CaretRightOutlined style={iconStyle} />;
    }
  };
  
  // 合并默认按钮和自定义按钮
  const allButtons = [...defaultButtons, ...buttons];

  return (
    <>
      <style>{globalStyles}</style>
      
      <Card
        title={title}
        extra={
          <Space>
            {allButtons.map((button, index) => (
              React.cloneElement(button as React.ReactElement, { key: index })
            ))}
          </Space>
        }
        className="tree-panel"
        loading={loading}
        styles={{
          body: { 
            padding: '12px 24px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {showSearch && (
          <div className="tree-search-container">
            <Search
              placeholder="搜索..."
              allowClear
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        )}
        
        {filteredTreeData.length > 0 ? (
          <div className="tree-container">
            <Tree
              className="full-width-tree compact-tree"
              showLine={false}
              showIcon={showIcon}
              onExpand={handleExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onSelect={onSelect}
              defaultSelectedKeys={defaultSelectedKeys}
              selectedKeys={selectedKeys}
              defaultExpandAll={defaultExpandAll}
              treeData={treeDataWithCustomTitle as DataNode[]}
              switcherIcon={switcherIconFunc}
              style={{ 
                width: '100%',
                fontSize: '14px'
              }}
            />
          </div>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>
    </>
  );
};

export default GenericPanelTree;
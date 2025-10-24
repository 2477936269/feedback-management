import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tooltip, Popover, Checkbox, Divider } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { 
  TablePaginationConfig, 
  TableProps,
  ColumnType
} from 'antd/es/table';
import type { SorterResult, FilterValue } from 'antd/es/table/interface';
import { Resizable } from 'react-resizable';

import 'react-resizable/css/styles.css';
import './GenericPanelTable.css';

// 在组件顶部添加配置常量
const MIN_COLUMN_WIDTH = 60; // 最小列宽
const MAX_COLUMN_WIDTH = 600; // 最大列宽

// 手动定义 TableCurrentDataSource 类型
interface TableCurrentDataSource<RecordType> {
  currentDataSource: RecordType[];
  action: 'paginate' | 'sort' | 'filter';
}

// 手动定义需要的类型
type CheckboxValueType = string | number | boolean;

// 添加ResizableTitle组件
const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
      // 添加最小最大宽度限制
      minConstraints={[MIN_COLUMN_WIDTH, 0]}
      maxConstraints={[MAX_COLUMN_WIDTH, 0]}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'col-resize',
            zIndex: 100
          }}
        />
      }
    >
      <th {...restProps} style={{ ...restProps.style, position: 'relative' }} />
    </Resizable>
  );
};

// 定义表格操作按钮
export interface TableButtonConfig {
  key: string;
  text?: string;
  icon?: React.ReactNode;
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  ghost?: boolean;
  danger?: boolean;
  onClick: (selectedRows: any[], refreshData: () => void) => void;
  disabled?: boolean | ((selectedRows: any[]) => boolean);
  hidden?: boolean | ((selectedRows: any[]) => boolean);
}

// 定义容器属性
export interface GenericPanelTableProps<T> {
  title?: string | React.ReactNode;
  buttons?: TableButtonConfig[];
  tableProps: TableProps<T>;
  loading?: boolean;
  refreshData?: () => void;
  showSelection?: boolean;
  cardProps?: React.ComponentProps<typeof Card>;
  extra?: React.ReactNode;
  
  // 分页相关属性
  pagination?: TablePaginationConfig;
  onPaginationChange?: (pagination: TablePaginationConfig) => void;
  defaultPageSize?: number;
  
  // 列显示控制相关属性
  showColumnSetting?: boolean;
  storageKey?: string;

  // 列宽调整相关属性
  resizableColumns?: boolean; // 是否启用列宽调整
  saveColumnWidths?: boolean; // 是否保存列宽到本地存储
}

/**
 * 通用表格面板组件
 * 包含标题、按钮、表格和分页
 */
function GenericPanelTable<T extends object = any>({
  title,
  buttons = [],
  tableProps,
  loading = false,
  refreshData = () => {},
  showSelection = false,
  cardProps = {},
  extra,
  pagination,
  onPaginationChange,
  defaultPageSize = 10,
  showColumnSetting = true,
  storageKey,
  resizableColumns = false,
  saveColumnWidths = true
}: GenericPanelTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [popoverVisible, setPopoverVisible] = useState(false);
  
  // 内部分页状态（当没有传入分页时使用）
  const [internalPagination, setInternalPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });
  
  // 添加列宽状态
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // 列可见性状态
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // 使用外部传入的分页或内部分页
  const currentPagination = pagination || internalPagination;
  
  // 获取表格所有列
  const allColumns = tableProps.columns || [];

  // 存储键，优先使用传入值，否则使用标题（转为字符串）或默认值
  const actualStorageKey = storageKey || 
    (typeof title === 'string' ? `table_columns_${title}` : 'table_columns_default');
  
  // 为每列生成唯一标识
  const getColumnKey = (column: ColumnType<T>): string => {
    return (column.dataIndex || column.key || column.title)?.toString() || '';
  };
  
  // 过滤显示的列 - 只定义一次
  const visibleColumns = allColumns.filter(column => {
    const key = getColumnKey(column);
    return !key || columnVisibility[key] !== false;
  });

  // 初始化列宽
  useEffect(() => {
    if (resizableColumns && saveColumnWidths) {
      try {
        const savedWidths = localStorage.getItem(`${actualStorageKey}_widths`);
        if (savedWidths) {
          setColumnWidths(JSON.parse(savedWidths));
        }
      } catch (error) {
        console.error('加载列宽配置失败:', error);
      }
    }
  }, [resizableColumns, saveColumnWidths, actualStorageKey]);

  // 保存列宽到本地存储
  useEffect(() => {
    if (resizableColumns && saveColumnWidths && Object.keys(columnWidths).length > 0) {
      try {
        localStorage.setItem(`${actualStorageKey}_widths`, JSON.stringify(columnWidths));
      } catch (error) {
        console.error('保存列宽配置失败:', error);
      }
    }
  }, [columnWidths, resizableColumns, saveColumnWidths, actualStorageKey]);
  
  // 处理列宽调整
  const handleResize = (index: number) => (e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
    const newColumnWidths = { ...columnWidths };
    const column = visibleColumns[index];
    const key = getColumnKey(column);
    
    if (key) {
      // 添加额外的宽度限制逻辑
      let newWidth = size.width;
      
      // 确保宽度在允许的范围内
      if (newWidth < MIN_COLUMN_WIDTH) newWidth = MIN_COLUMN_WIDTH;
      if (newWidth > MAX_COLUMN_WIDTH) newWidth = MAX_COLUMN_WIDTH;
      
      newColumnWidths[key] = newWidth;
      setColumnWidths(newColumnWidths);
    }
  };
  
  // 处理表格组件
  const components = resizableColumns ? {
    header: {
      cell: ResizableTitle,
    },
  } : undefined;
  
  // 添加列宽重置函数
  const resetColumnWidths = () => {
    setColumnWidths({});
    try {
      localStorage.removeItem(`${actualStorageKey}_widths`);
    } catch (error) {
      console.error('移除列宽配置失败:', error);
    }
    setPopoverVisible(false);
    // 强制刷新以确保重置生效
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // 设置列宽和处理函数
  const resizedColumns = visibleColumns.map((col, index) => {
    const key = getColumnKey(col);
    // 修改此处逻辑，避免默认宽度过大
    const savedWidth = key && columnWidths[key] ? columnWidths[key] : undefined;
    // 仅当有保存的宽度时才使用，否则使用列自身的宽度或默认最小宽度
    const width = savedWidth || col.width || MIN_COLUMN_WIDTH;
    
    return {
      ...col,
      width,
      onHeaderCell: (column: ColumnType<T>) => ({
        width,
        onResize: handleResize(index),
      }),
    };
  });
  
  // 初始化列可见性
  useEffect(() => {
    // 尝试从本地存储加载配置
    try {
      const savedConfig = localStorage.getItem(actualStorageKey);
      
      if (savedConfig) {
        // 解析保存的配置
        const parsedConfig = JSON.parse(savedConfig);
        setColumnVisibility(parsedConfig);
      } else {
        // 没有保存的配置，初始化为全部可见
        const initialVisibility: Record<string, boolean> = {};
        allColumns.forEach(column => {
          const key = getColumnKey(column);
          if (key) {
            initialVisibility[key] = true;
          }
        });
        setColumnVisibility(initialVisibility);
      }
    } catch (error) {
      console.error('加载列配置失败:', error);
      // 出错时，默认所有列可见
      const defaultVisibility: Record<string, boolean> = {};
      allColumns.forEach(column => {
        const key = getColumnKey(column);
        if (key) {
          defaultVisibility[key] = true;
        }
      });
      setColumnVisibility(defaultVisibility);
    }
  }, [actualStorageKey, allColumns]);
  
  // 保存列可见性到本地存储
  useEffect(() => {
    // 仅当columnVisibility不为空对象时保存
    if (Object.keys(columnVisibility).length > 0) {
      try {
        localStorage.setItem(actualStorageKey, JSON.stringify(columnVisibility));
      } catch (error) {
        console.error('保存列配置失败:', error);
      }
    }
  }, [columnVisibility, actualStorageKey]);
  
  // 处理列可见性变化
  const handleColumnVisibilityChange = (checkedValues: CheckboxValueType[]) => {
    const newVisibility: Record<string, boolean> = {};
    
    // 先将所有列设为不可见
    allColumns.forEach(column => {
      const key = getColumnKey(column);
      if (key) {
        newVisibility[key] = false;
      }
    });
    
    // 再将选中的列设为可见
    checkedValues.forEach(value => {
      newVisibility[value as string] = true;
    });
    
    setColumnVisibility(newVisibility);
  };
  
  // 重置列可见性，恢复所有列显示
  const resetColumnVisibility = () => {
    const resetVisibility: Record<string, boolean> = {};
    allColumns.forEach(column => {
      const key = getColumnKey(column);
      if (key) {
        resetVisibility[key] = true;
      }
    });
    setColumnVisibility(resetVisibility);
    setPopoverVisible(false);
  };
  
  // 处理表格选择变化
  const handleSelectionChange = (newSelectedRowKeys: React.Key[], newSelectedRows: T[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  // 处理表格变化
  const handleTableChange = (
    newPagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
    extra: TableCurrentDataSource<T>
  ) => {
    // 如果有外部传入的回调，则调用
    if (onPaginationChange) {
      onPaginationChange(newPagination);
    } else {
      // 否则使用内部状态
      setInternalPagination(newPagination);
    }
    
    // 确保传递所有参数
    if (tableProps.onChange) {
      tableProps.onChange(newPagination, filters, sorter, extra);
    }
  };
  
  // 列设置弹窗内容
  const columnSettingContent = (
    <div style={{ maxWidth: 300 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontWeight: 'bold' }}>显示的列</span>
      <Space>
        <Button 
          type="link" 
          size="small" 
          onClick={resetColumnVisibility}
          title="重置列显示"
        >
          重置显示
        </Button>
        <Button 
          type="link" 
          size="small" 
          onClick={resetColumnWidths}
          title="重置列宽"
          danger
        >
          重置宽度
        </Button>
      </Space>
    </div>
      <Divider style={{ margin: '8px 0' }} />
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        value={Object.entries(columnVisibility)
          .filter(([_, visible]) => visible)
          .map(([key]) => key)}
        onChange={handleColumnVisibilityChange}
      >
        {allColumns.map(column => {
          const key = getColumnKey(column);
          if (!key) return null;
          
          const title = typeof column.title === 'string' ? column.title : `列 ${key}`;
          return (
            <Checkbox key={key} value={key}>
              {title}
            </Checkbox>
          );
        })}
      </Checkbox.Group>
    </div>
  );
  
  // 渲染按钮
  const renderButtons = () => (
    <Space>
      {buttons.map(button => {
        // 检查按钮是否应该隐藏
        const isHidden = typeof button.hidden === 'function' 
          ? button.hidden(selectedRows)
          : button.hidden;
          
        if (isHidden) return null;
        
        // 检查按钮是否应该禁用
        const isDisabled = typeof button.disabled === 'function' 
          ? button.disabled(selectedRows)
          : button.disabled;
        
        return (
          <Button
            key={button.key}
            type={button.type}
            ghost={button.ghost}
            danger={button.danger}
            icon={button.icon}
            disabled={isDisabled}
            size="middle"  // 使用默认大小
            onClick={() => button.onClick(selectedRows, refreshData)}
          >
            {button.text}
          </Button>
        );
      })}
    </Space>
  );

  // 修改 titleWithSettings 组件中的 Popover 配置
  const titleWithSettings = (
    <Space>
      {title}
      {showColumnSetting && (
        <Tooltip title="列设置">
          <Popover
            content={columnSettingContent}
            title={null}
            trigger="click"
            open={popoverVisible}
            onOpenChange={setPopoverVisible}
            placement="rightTop" // 修改为 rightTop，使弹出框出现在右侧
            overlayStyle={{ minWidth: '60px' }}
          >
            <Button 
              icon={<SettingOutlined />}
              type="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverVisible(!popoverVisible);
              }}
            />
          </Popover>
        </Tooltip>
      )}
    </Space>
  );

  // 创建组合的extra内容，不再包含列设置按钮
  const combinedExtra = (
    <Space>
      {renderButtons()}
      {extra}
    </Space>
  );

  // 构建最终的表格属性
  const finalTableProps: TableProps<T> = {
    ...tableProps,
    rowSelection: showSelection ? {
      selectedRowKeys,
      onChange: handleSelectionChange,
      ...(tableProps.rowSelection || {})
    } : undefined,
    loading,
    pagination: currentPagination,
    onChange: handleTableChange,
    // 根据resizableColumns参数选择列配置
    columns: resizableColumns ? (resizedColumns as ColumnType<T>[]) : visibleColumns,
    components
  };

  return (
    <Card
      title={titleWithSettings} // 使用集成了列设置按钮的标题
      extra={combinedExtra}
      {...cardProps}
    >
      <Table<T> {...finalTableProps} />
    </Card>
  );
}

export default GenericPanelTable;
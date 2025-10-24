import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, Tag, App, Popconfirm, Row, Col, Select, DatePicker, Modal, Descriptions, Divider, Input } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  DownOutlined,
  SearchOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import GenericModalForm from '../../components/generic/GenericModalForm';
import GenericPanelTable from '../../components/generic/GenericPanelTable';
import { FormItemConfig } from '../../components/generic/GenericModalForm';
import { TableButtonConfig } from '../../components/generic/GenericPanelTable';
import { categoryService } from '../../service/categoryService';

// 分类数据接口
interface FeedbackCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'enabled' | 'disabled';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const FeedbackCategory: React.FC = () => {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<FeedbackCategory[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeedbackCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<FeedbackCategory | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();
  
  // 搜索条件
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [searchType, setSearchType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [showMoreConditions, setShowMoreConditions] = useState(false);

  // 模拟数据 - 与图片中的数据一致
  const mockCategories: FeedbackCategory[] = React.useMemo(() => [
    {
      id: '1',
      name: '测试分类',
      description: '测试描述',
      color: '#1890ff',
      status: 'enabled',
      sortOrder: 1,
      createdAt: '2025/08/15 15:01',
      updatedAt: '2025/08/19 15:40'
    },
    {
      id: '2',
      name: '界面设计',
      description: '界面设计相关的反馈',
      color: '#95de64',
      status: 'enabled',
      sortOrder: 1,
      createdAt: '2025/08/19 09:25',
      updatedAt: '2025/08/19 09:25'
    },
    {
      id: '3',
      name: '系统崩溃',
      description: '系统完全无法运行或崩溃',
      color: '#ff7875',
      status: 'enabled',
      sortOrder: 2,
      createdAt: '2025/08/19 09:25',
      updatedAt: '2025/08/19 09:25'
    },
    {
      id: '4',
      name: '功能异常',
      description: '系统功能出现异常或错误',
      color: '#ff4d4f',
      status: 'enabled',
      sortOrder: 2,
      createdAt: '2025/08/19 09:25',
      updatedAt: '2025/08/19 09:25'
    },
    {
      id: '5',
      name: '功能缺失',
      description: '某些功能无法正常使用',
      color: '#ffa39e',
      status: 'enabled',
      sortOrder: 1,
      createdAt: '2025/08/19 09:25',
      updatedAt: '2025/08/19 09:25'
    },
    {
      id: '6',
      name: '操作流程',
      description: '用户操作流程优化建议',
      color: '#b7eb8f',
      status: 'enabled',
      sortOrder: 1,
      createdAt: '2025/08/19 09:25',
      updatedAt: '2025/08/19 09:25'
    }
  ], []);

  // 加载分类数据
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ limit: 100 });
      const categoriesData = response.data.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        color: item.color || '#1890ff',
        status: (item.isActive ? 'enabled' : 'disabled') as 'enabled' | 'disabled',
        sortOrder: item.sortOrder,
        createdAt: new Date(item.createdAt).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '/'),
        updatedAt: new Date(item.updatedAt).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '/')
      }));
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('加载分类数据失败:', error);
      message.error('加载分类数据失败');
      // 使用模拟数据作为后备
      setCategories(mockCategories);
      setFilteredCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 初始化数据
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // 搜索过滤
  useEffect(() => {
    let filtered = categories;
    
    if (searchName) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    if (searchDescription) {
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchDescription.toLowerCase())
      );
    }
    
    if (searchStatus !== 'all') {
      filtered = filtered.filter(item => item.status === searchStatus);
    }
    
    if (searchType !== 'all') {
      filtered = filtered.filter(item => item.name.includes(searchType));
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= dateRange[0].startOf('day') && itemDate <= dateRange[1].endOf('day');
      });
    }
    
    setFilteredCategories(filtered);
  }, [categories, searchName, searchDescription, searchStatus, searchType, dateRange]);

  // 重置搜索
  const handleReset = () => {
    setSearchName('');
    setSearchDescription('');
    setSearchStatus('all');
    setSearchType('all');
    setDateRange(null);
    setShowMoreConditions(false);
    message.success('搜索条件已重置');
  };

  // 执行搜索
  const handleSearch = () => {
    // 触发搜索逻辑（通过useEffect自动执行）
    message.success('搜索完成');
  };

  // 切换更多条件显示
  const handleToggleMoreConditions = () => {
    setShowMoreConditions(!showMoreConditions);
  };

  // 新增分类
  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  // 编辑分类
  const handleEdit = (record: FeedbackCategory) => {
    setEditingCategory(record);
    setModalVisible(true);
  };

  // 查看详情
  const handleView = (record: FeedbackCategory) => {
    setViewingCategory(record);
    setDetailModalVisible(true);
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(item => item.id !== id));
      setFilteredCategories(prev => prev.filter(item => item.id !== id));
      message.success('删除成功');
    } catch (error: any) {
      console.error('删除分类失败:', error);
      message.error(error.message || '删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的分类');
      return;
    }
    
    try {
      // 并行删除所有选中的分类
      await Promise.all(selectedRowKeys.map(id => categoryService.deleteCategory(id as string)));
      setCategories(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
      setFilteredCategories(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
      setSelectedRowKeys([]);
      message.success(`成功删除 ${selectedRowKeys.length} 个分类`);
    } catch (error: any) {
      console.error('批量删除分类失败:', error);
      message.error('批量删除失败，请重试');
    }
  };

  // 导出数据
  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  // 刷新数据
  const handleRefresh = () => {
    loadCategories();
  };

  // 表格按钮配置
  const tableButtons: TableButtonConfig[] = [
    {
      key: 'add',
      text: '新增分类',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: (selectedRows, refreshData) => handleAdd()
    },
    {
      key: 'export',
      text: '导出数据',
      icon: <DownloadOutlined />,
      onClick: (selectedRows, refreshData) => handleExport()
    },
    {
      key: 'refresh',
      text: '刷新',
      icon: <ReloadOutlined />,
      onClick: (selectedRows, refreshData) => handleRefresh()
    },
    {
      key: 'batch-delete',
      text: '批量删除',
      danger: true,
      onClick: (selectedRows, refreshData) => handleBatchDelete(),
      disabled: (selectedRows) => selectedRows.length === 0,
      hidden: (selectedRows) => selectedRows.length === 0
    }
  ];

  // 表单提交
  const handleSubmit = async (values: any): Promise<boolean> => {
    try {
      if (editingCategory) {
        // 编辑
        await categoryService.updateCategory(editingCategory.id, {
          name: values.name,
          description: values.description,
          color: values.color,
          isActive: values.status === 'enabled',
          sortOrder: values.sortOrder
        });
        
        setCategories(prev => 
          prev.map(item => 
            item.id === editingCategory.id 
              ? { 
                  ...item, 
                  ...values, 
                  updatedAt: new Date().toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).replace(/\//g, '/')
                }
              : item
          )
        );
        message.success('编辑成功');
      } else {
        // 新增
        const response = await categoryService.createCategory({
          name: values.name,
          description: values.description,
          color: values.color || '#1890ff',
          isActive: values.status !== 'disabled',
          sortOrder: values.sortOrder || 1
        });
        
        const newCategory: FeedbackCategory = {
          id: response.data.id,
          name: values.name,
          description: values.description,
          color: values.color || '#1890ff',
          status: values.status || 'enabled',
          sortOrder: values.sortOrder || 1,
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
        setCategories(prev => [...prev, newCategory]);
        message.success('添加成功');
      }
      setModalVisible(false);
      return true;
    } catch (error: any) {
      console.error('保存分类失败:', error);
      message.error(error.message || '保存失败');
      return false;
    }
  };

  // 表单配置
  const formItems: FormItemConfig[] = [
    {
      name: 'name',
      label: '分类名称',
      type: 'input',
      props: { placeholder: '请输入分类名称' },
      rules: [
        { required: true, message: '请输入分类名称' },
        { max: 20, message: '分类名称不能超过20个字符' },
      ],
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      props: { placeholder: '请输入分类描述' },
    },
    {
      name: 'color',
      label: '颜色',
      type: 'input',
      props: { 
        placeholder: '#1890ff',
        type: 'color'
      },
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: 'enabled' },
          { label: '禁用', value: 'disabled' }
        ]
      },
    },
    {
      name: 'sortOrder',
      label: '排序',
      type: 'number',
      props: { 
        placeholder: '请输入排序值',
        min: 1
      },
    },
  ];

  // 表格列定义
  const columns = [
    {
      title: '',
      dataIndex: 'selection',
      key: 'selection',
      width: 50,
      render: () => null,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: FeedbackCategory, b: FeedbackCategory) => a.name.localeCompare(b.name),
      render: (text: string) => text,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      sorter: (a: FeedbackCategory, b: FeedbackCategory) => a.description.localeCompare(b.description),
      render: (text: string) => text,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Space>
          <div style={{ 
            width: 16, 
            height: 16, 
            backgroundColor: color, 
            borderRadius: 2,
            display: 'inline-block'
          }} />
          <span>{color}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '启用', value: 'enabled' },
        { text: '禁用', value: 'disabled' }
      ],
      sorter: (a: FeedbackCategory, b: FeedbackCategory) => a.status.localeCompare(b.status),
      render: (status: string) => (
        <Tag color={status === 'enabled' ? 'blue' : 'default'}>
          {status === 'enabled' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      sorter: (a: FeedbackCategory, b: FeedbackCategory) => a.sortOrder - b.sortOrder,
      render: (sortOrder: number) => sortOrder,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: FeedbackCategory, b: FeedbackCategory) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text: string) => text,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a: FeedbackCategory, b: FeedbackCategory) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (text: string) => text,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: FeedbackCategory) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该分类？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];



  return (
    <div className="feedback-category" style={{ padding: '32px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e8e8e8'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#262626',
          lineHeight: '1.4'
        }}>
          反馈管理
        </h1>
      </div>
      
      {/* 搜索条件 */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontWeight: 'bold', 
            fontSize: '16px', 
            color: '#262626' 
          }}>搜索条件</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              type="link" 
              icon={<DownOutlined style={{ 
                transform: showMoreConditions ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />} 
              onClick={handleToggleMoreConditions}
              style={{ 
                color: '#1890ff',
                padding: '4px 8px',
                height: 'auto',
                fontSize: '14px'
              }}
            >
              更多
            </Button>
            <Button 
              onClick={handleReset}
              icon={<ReloadOutlined />}
              style={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#d9d9d9',
                color: '#595959',
                borderRadius: '6px',
                height: '32px',
                padding: '4px 15px'
              }}
            >
              重置
            </Button>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ 
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '6px',
                height: '32px',
                padding: '4px 15px'
              }}
            >
              搜索
            </Button>
          </div>
        </div>
        
        <Row gutter={[24, 16]} align="middle">
          <Col span={8}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#262626',
                fontWeight: 500,
                minWidth: '60px'
              }}>状态:</div>
              <Select
                placeholder="请选择状态"
                value={searchStatus}
                onChange={setSearchStatus}
                style={{ flex: 1 }}
                suffixIcon={<DownOutlined style={{ color: '#bfbfbf' }} />}
                size="middle"
              >
                <Option value="all">全部</Option>
                <Option value="enabled">启用</Option>
                <Option value="disabled">禁用</Option>
              </Select>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#262626',
                fontWeight: 500,
                minWidth: '80px'
              }}>反馈类型:</div>
              <Select
                placeholder="请选择类型"
                value={searchType}
                onChange={setSearchType}
                style={{ flex: 1 }}
                suffixIcon={<DownOutlined style={{ color: '#bfbfbf' }} />}
                size="middle"
              >
                <Option value="all">全部</Option>
                <Option value="测试">测试分类</Option>
                <Option value="界面">界面设计</Option>
                <Option value="系统">系统崩溃</Option>
                <Option value="功能">功能异常</Option>
              </Select>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#262626',
                fontWeight: 500,
                minWidth: '80px'
              }}>时间范围:</div>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={dateRange}
                onChange={setDateRange}
                style={{ flex: 1 }}
                suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                size="middle"
              />
            </div>
          </Col>
        </Row>
        
        {/* 更多搜索条件 */}
        {showMoreConditions && (
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: '1px solid #f0f0f0' 
          }}>
            <Row gutter={[24, 16]} align="middle">
              <Col span={8}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#262626',
                    fontWeight: 500,
                    minWidth: '60px'
                  }}>分类名称:</div>
                  <Input
                    placeholder="请输入分类名称"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{ flex: 1 }}
                    size="middle"
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#262626',
                    fontWeight: 500,
                    minWidth: '60px'
                  }}>描述:</div>
                  <Input
                    placeholder="请输入描述"
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    style={{ flex: 1 }}
                    size="middle"
                  />
                </div>
              </Col>
              <Col span={8}>
                {/* 可以添加更多搜索条件 */}
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* 分类列表 */}
      <GenericPanelTable<FeedbackCategory>
        title={
          <Space>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#262626' }}>分类列表</span>
            <span style={{ color: '#595959', fontSize: '14px' }}>总计: {filteredCategories.length}</span>
          </Space>
        }
        buttons={tableButtons}
        tableProps={{
          dataSource: filteredCategories,
          columns: columns,
          rowKey: "id",
          loading: loading,
          pagination: {
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          },
          size: "middle"
        }}
        showSelection={true}
        showColumnSetting={true}
        storageKey="feedback-category-table"
        resizableColumns={true}
        cardProps={{
          style: {
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0'
          },
          styles: { body: { padding: '24px' } }
        }}
      />

      {/* 分类表单模态框 */}
      <GenericModalForm
        visible={modalVisible}
        title={editingCategory ? '编辑分类' : '新增分类'}
        formItems={formItems}
        initialValues={editingCategory ? {
          name: editingCategory.name,
          description: editingCategory.description,
          color: editingCategory.color,
          status: editingCategory.status,
          sortOrder: editingCategory.sortOrder,
        } : {}}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        width={600}
      />

             {/* 详情模态框 */}
       <Modal
         title={
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span>分类详情</span>
             {viewingCategory && (
               <Tag color={viewingCategory.status === 'enabled' ? 'blue' : 'default'}>
                 {viewingCategory.status === 'enabled' ? '启用' : '禁用'}
               </Tag>
             )}
           </div>
         }
         open={detailModalVisible}
         onCancel={() => setDetailModalVisible(false)}
         footer={
           <Space>
             <Button onClick={() => setDetailModalVisible(false)}>
               关闭
             </Button>
             {viewingCategory && (
               <Button 
                 type="primary" 
                 icon={<EditOutlined />}
                 onClick={() => {
                   setDetailModalVisible(false);
                   setEditingCategory(viewingCategory);
                   setModalVisible(true);
                 }}
               >
                 编辑
               </Button>
             )}
           </Space>
         }
         width={700}
         styles={{
           header: { borderBottom: '1px solid #f0f0f0' },
           body: { padding: '24px' },
           footer: { borderTop: '1px solid #f0f0f0', padding: '16px 24px' }
         }}
       >
         {viewingCategory && (
           <div>
             {/* 基本信息 */}
             <div style={{ marginBottom: '24px' }}>
               <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                 基本信息
               </h3>
               <Descriptions bordered column={2} size="small">
                 <Descriptions.Item label="分类名称" span={2}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{ 
                       width: 16, 
                       height: 16, 
                       backgroundColor: viewingCategory.color, 
                       borderRadius: 3,
                       display: 'inline-block'
                     }} />
                     <span style={{ fontWeight: '500' }}>{viewingCategory.name}</span>
                   </div>
                 </Descriptions.Item>
                 <Descriptions.Item label="描述" span={2}>
                   {viewingCategory.description || '暂无描述'}
                 </Descriptions.Item>
                 <Descriptions.Item label="颜色" span={1}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{ 
                       width: 20, 
                       height: 20, 
                       backgroundColor: viewingCategory.color, 
                       borderRadius: 4,
                       display: 'inline-block',
                       border: '1px solid #d9d9d9'
                     }} />
                     <span style={{ fontFamily: 'monospace' }}>{viewingCategory.color}</span>
                   </div>
                 </Descriptions.Item>
                 <Descriptions.Item label="排序" span={1}>
                   <Tag color="blue">{viewingCategory.sortOrder}</Tag>
                 </Descriptions.Item>
               </Descriptions>
             </div>

             <Divider style={{ margin: '24px 0' }} />

             {/* 时间信息 */}
             <div>
               <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                 时间信息
               </h3>
               <Descriptions bordered column={2} size="small">
                 <Descriptions.Item label="创建时间" span={1}>
                   <span style={{ color: '#595959' }}>{viewingCategory.createdAt}</span>
                 </Descriptions.Item>
                 <Descriptions.Item label="更新时间" span={1}>
                   <span style={{ color: '#595959' }}>{viewingCategory.updatedAt}</span>
                 </Descriptions.Item>
               </Descriptions>
             </div>

             {/* 统计信息 */}
             <Divider style={{ margin: '24px 0' }} />
             
             <div>
               <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                 统计信息
               </h3>
               <Row gutter={16}>
                 <Col span={8}>
                   <Card size="small" style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>0</div>
                     <div style={{ fontSize: '12px', color: '#8c8c8c' }}>子分类</div>
                   </Card>
                 </Col>
                 <Col span={8}>
                   <Card size="small" style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>0</div>
                     <div style={{ fontSize: '12px', color: '#8c8c8c' }}>关联反馈</div>
                   </Card>
                 </Col>
                 <Col span={8}>
                   <Card size="small" style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>0</div>
                     <div style={{ fontSize: '12px', color: '#8c8c8c' }}>使用次数</div>
                   </Card>
                 </Col>
               </Row>
             </div>
           </div>
         )}
       </Modal>
    </div>
  );
};

export default FeedbackCategory;

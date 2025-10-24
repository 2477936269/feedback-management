import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

// 搜索项配置接口
export interface SearchItemConfig {
  name: string; // 表单项名称
  label: string; // 表单项标签
  type: "input" | "select" | "date" | "dateRange" | "number" | "inputNumber"; // 添加 inputNumber 类型
  options?: Array<{ value: string | number; label: string }>; // 下拉选项
  props?: any; // 传递给控件的其他属性
  colSpan?: number; // 该项占用的列数
}

// 搜索面板配置接口
export interface GenericPanelSearchProps {
  title?: string; // 面板标题
  searchItems: SearchItemConfig[]; // 搜索项配置
  columns?: number; // 每行显示的列数，默认为3
  onSearch: (values: any) => void; // 搜索回调
  extraButtons?: React.ReactNode[]; // 右侧额外的按钮
  collapsible?: boolean; // 是否可折叠
  defaultCollapsed?: boolean; // 默认是否折叠
  labelWidth?: number | string; // 标签宽度，可以是数字(像素)或字符串(如'120px'或'30%')
  collapseThreshold?: number; // 添加此属性
}

/**
 * 通用搜索面板组件
 */
const GenericPanelSearch: React.FC<GenericPanelSearchProps> = ({
  // 定义通用搜索面板组件
  title = "搜索条件", // 设置默认标题
  searchItems = [], // 设置默认搜索项为空数组
  columns = 3, // 设置默认列数为3
  onSearch, // 设置搜索回调
  extraButtons = [], // 设置默认额外按钮为空数组
  collapsible = true, // 默认可折叠
  defaultCollapsed = true, // 默认不折叠
  labelWidth = 100, // 默认标签宽度为100px
}) => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // 处理搜索
  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  // 切换折叠状态
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // 计算每个表单项占用的列数
  const getColSpan = (item: SearchItemConfig) => {
    if (item.colSpan) return item.colSpan;
    return 24 / columns;
  };

  // 根据折叠状态确定显示的项目
  const visibleItems =
    collapsed && collapsible ? searchItems.slice(0, columns) : searchItems;

  // 渲染搜索控件
  const renderFormItem = (item: SearchItemConfig) => {
    const { type, options, props = {} } = item;

    switch (type) {
      case "input":
        return <Input allowClear {...props} />;
      case "select":
        return (
          <Select allowClear {...props}>
            {options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );
      case "date":
        return <DatePicker style={{ width: "100%" }} {...props} />;
      case "dateRange":
        return <RangePicker style={{ width: "100%" }} {...props} />;
      case "number":
        return <Input type="number" allowClear {...props} />;
      case "inputNumber": // 添加这个 case
        return <InputNumber style={{ width: "100%" }} {...props} />;
      default:
        return <Input allowClear {...props} />;
    }
  };

  // 构建所有操作按钮
  const actionButtons = (
    <Space>
      {/* 左侧：折叠/展开按钮 */}
      {collapsible && searchItems.length > columns && (
        <Button
          type="link"
          onClick={toggleCollapse}
          icon={collapsed ? <DownOutlined /> : <UpOutlined />}
        >
          {collapsed ? "更多" : "收拢"}
        </Button>
      )}

      {/* 中间：搜索和重置按钮 */}
      <Button icon={<ReloadOutlined />} size="middle" onClick={handleReset}>
        重置
      </Button>
      <Button
        type="primary"
        size="middle"
        icon={<SearchOutlined />}
        onClick={handleSearch}
      >
        搜索
      </Button>
    </Space>
  );

  // 计算标签宽度的样式
  const labelColStyle = {
    width: typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth,
    textAlign: "right" as const,
  };

  return (
    <Card title={title} extra={actionButtons} className="search-panel">
      <Form form={form} layout="horizontal">
        <Row gutter={16}>
          {visibleItems.map((item) => (
            <Col
              key={item.name}
              span={getColSpan(item)}
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name={item.name}
                label={item.label}
                style={{ marginBottom: 0 }}
                // 应用固定宽度到标签
                labelCol={{ style: labelColStyle }}
              >
                {renderFormItem(item)}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Card>
  );
};

export default GenericPanelSearch;

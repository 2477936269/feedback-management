import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, DatePicker, Radio, Divider, TreeSelect } from 'antd';
import type { Rule } from 'antd/es/form';
import type { FormProps, FormInstance } from 'antd/es/form';
import type { ModalProps } from 'antd/es/modal';

// 导入 ValidateMessages 类型
import type { ValidateMessages } from 'rc-field-form/lib/interface';

const { Option } = Select;
const { TextArea } = Input;
const { Group: RadioGroup } = Radio;

// 修改表单项配置接口，添加divider类型
export interface FormItemConfig {
  name: string;           // 表单项名称
  label: string;          // 表单项标签
  type: 'input' | 'select' | 'switch' | 'textarea' | 'number' | 'date' | 'radio' | 'divider' | 'treeSelect'; // 添加divider类型
  valuePropName?: string; // 添加这个可选属性
  rules?: any[];          // 验证规则
  options?: Array<{value: string | number, label: string}>; // 下拉选项
  props?: any;            // 传递给控件的其他属性
  colSpan?: number;       // 布局跨度，默认为24（整行）
  initialValue?: any;     // 初始值
  transform?: {           // 数据转换配置
    in?: (value: any) => any;   // 输入转换
    out?: (value: any) => any;  // 输出转换
  };
  hidden?: boolean | ((values: any) => boolean); // 是否隐藏
  dependencies?: string[]; // 依赖的其他字段
}

// 修改 Props 接口，增加布局相关属性
export interface GenericModalFormProps {
  title: string;    // 模态框标题
  visible: boolean;   // 是否可见
  width?: number;   // 模态框宽度
  formItems: FormItemConfig[];    // 表单项配置
  formRef?: (form: FormInstance) => void; // 添加此属性
  initialValues?: Record<string, any>;    // 初始值
  onCancel: () => void;
  onSubmit: (values: any) => void | Promise<boolean>;
  okText?: string;
  cancelText?: string;
  formProps?: FormProps;
  modalProps?: ModalProps;
  validateMessages?: ValidateMessages; // 添加验证消息配置
  layout?: 'horizontal' | 'vertical'; // 添加布局控制属性
  labelCol?: { span: number }; // 标签占比，适用于horizontal模式
  wrapperCol?: { span: number }; // 内容区域占比，适用于horizontal模式
}

/**
 * 通用表单模态框组件
 */
const GenericModalForm: React.FC<GenericModalFormProps> = ({
  title,
  visible,
  width = 600,
  formItems,
  formRef,
  initialValues = {},
  onCancel,
  onSubmit,
  okText = '确定',
  cancelText = '取消',
  formProps,
  modalProps,
  validateMessages,
  layout = 'horizontal', // 默认改为横向布局，名称在左输入在右
  labelCol = { span: 6 }, // 默认标签占比
  wrapperCol = { span: 18 } // 默认内容区域占比
}) => {
  const [form] = Form.useForm();
  
  // 将表单实例传递给父组件
  // 优化表单实例传递
  
  useEffect(() => {
    if (formRef && form) {
      // 添加调试日志
      console.log('传递表单实例到父组件');
      formRef(form);
    }
  }, [form, formRef]);
  
  // 当visible或initialValues变化时重置表单
  useEffect(() => {
    if (visible) {
      // 先重置表单所有字段
      form.resetFields();
      
      // 如果有初始值，设置表单值
      if (Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      } else {
        // 确保表单完全清空 - 添加正确的类型注解
        const emptyValues: Record<string, undefined> = {}; // 修改此处添加类型
        formItems.forEach(item => {
          // 确保item.name是字符串类型
          if (typeof item.name === 'string') {
            emptyValues[item.name] = undefined;
          }
        });
        form.setFieldsValue(emptyValues);
      }
      
      // 添加日志帮助调试
      console.log('GenericModalForm 表单已重置, 初始值:', initialValues);
    }
  }, [visible, initialValues, form, formItems]);
  
  // 渲染表单控件
  // 修改 renderFormItem 函数以添加对 treeSelect 类型的支持
  
  // 渲染表单控件
  const renderFormItem = (item: FormItemConfig) => {
    const { type, options, props = {} } = item;
    
    switch (type) {
      case 'input':
        return <Input {...props} />;
      case 'textarea':
        return <TextArea rows={4} {...props} />;
      case 'select':
        return (
          <Select {...props}>
            {options?.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        );
      case 'treeSelect':
        return (
          <TreeSelect
            showSearch
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="请选择"
            allowClear
            treeDefaultExpandAll
            treeNodeFilterProp="title"
            {...props}
          />
        );
      case 'switch':
        return <Switch {...props} />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} {...props} />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} {...props} />;
      case 'radio':
        return (
          <RadioGroup {...props}>
            {options?.map(opt => (
              <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
            ))}
          </RadioGroup>
        );
      default:
        return <Input {...props} />;
    }
  };

  // 根据布局模式准备表单属性
  const layoutFormProps = {
    layout,
    ...(layout === 'horizontal' ? { labelCol, wrapperCol } : {}),
  };

  return (
    <Modal
      title={title}
      open={visible}
      width={width}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            try {
              // 执行提交并等待可能的 Promise 结果
              const result = await Promise.resolve(onSubmit(values));
              
              // 关闭模态框(无论返回结果如何，除非返回明确的 false)
              if (result !== false) {
                onCancel();
              }
            } catch (error) {
              console.error('表单提交失败:', error);
            }
          })
          .catch(info => {
            console.log('表单验证失败:', info);
          });
      }}

      okText={okText}
      cancelText={cancelText}
      destroyOnClose={true}
      {...modalProps}
    >
    <Form
      form={form}
      initialValues={initialValues}
      validateMessages={validateMessages}
      autoComplete="off"
      onFinish={onSubmit}
      {...layoutFormProps}
      {...formProps}
      style={{ 
        margin: '20px 0',
        display: visible ? 'block' : 'none' 
      }}                                   // 只保留一个 style 属性
    >
      {formItems.map((item) => {
        // 处理分隔线类型
        if (item.type === 'divider') {
          return (
            <Divider key={item.name} orientation="left" style={{ marginTop: 24, marginBottom: 16 }}>
              <span style={{ fontWeight: 'bold' }}>{item.label}</span>
            </Divider>
          );
        }
        
        // 处理普通表单项
        return (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={item.rules}
            valuePropName={item.type === 'switch' ? 'checked' : 'value'}
            hidden={item.hidden === true}
            dependencies={item.dependencies}
          >
            {renderFormItem(item)}
          </Form.Item>
        );
      })}
    </Form>
    </Modal>
  );
};

export default GenericModalForm;
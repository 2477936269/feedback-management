import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';

// 组织类型接口
interface OrganizationType {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
}

// 模态框属性接口
interface OrgTypeFormModalProps {
  visible: boolean;
  currentType: OrganizationType | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const OrgTypeFormModal: React.FC<OrgTypeFormModalProps> = ({
  visible,
  currentType,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const isEdit = !!currentType;

  // 当模态框显示或编辑对象变化时重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (currentType) {
        form.setFieldsValue(currentType);
      }
    }
  }, [visible, currentType, form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  return (
    <Modal
      title={isEdit ? '编辑组织类型' : '新建组织类型'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ sortOrder: 0 }}
      >
        <Form.Item
          name="name"
          label="类型名称"
          rules={[{ required: true, message: '请输入类型名称' }]}
        >
          <Input placeholder="请输入类型名称" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="code"
          label="类型编码"
          rules={[{ required: true, message: '请输入类型编码' }]}
        >
          <Input placeholder="请输入类型编码" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label="排序"
          rules={[{ required: true, message: '请输入排序顺序' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            placeholder="请输入排序顺序" 
            min={0} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrgTypeFormModal;
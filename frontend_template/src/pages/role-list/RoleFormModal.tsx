import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { FormInstance } from 'antd/es/form';  // 添加 FormInstance 类型导入
import { createRole, updateRole } from '../../service/roleService';
import GenericModalForm, { FormItemConfig } from '../../components/generic/GenericModalForm';

interface RoleFormModalProps {
  visible: boolean;
  currentRole: any | null;
  onCancel: () => void;
  onSuccess: () => void;
  layout?: 'horizontal' | 'vertical';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
}

// 定义角色数据接口，适配后端API变更
interface RoleData {
  name: string;
  code: string; // 现在code是角色标识，格式为大写字母和连字符
  description?: string;
  status: string;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  visible,
  currentRole,
  onCancel,
  onSuccess,
  layout = 'horizontal',
  labelCol = { span: 6 },
  wrapperCol = { span: 16 }
}) => {
  const [loading, setLoading] = useState(false);
  // 用于强制重新创建表单实例
  const [formKey, setFormKey] = useState(Date.now());
  // 添加表单状态管理
  const [form, setForm] = useState<FormInstance | null>(null);

  // 使用 useCallback 包装 saveFormRef，确保其引用稳定
  const saveFormRef = useCallback((formInstance: FormInstance) => {
    console.log('角色表单：接收到表单实例', formInstance);
    setForm(formInstance);
  }, []); // 空依赖数组，保证函数引用稳定
  
  // 修改 useEffect，移除 form 依赖
  useEffect(() => {
    if (visible) {
      console.log('角色表单：模态框显示，重置表单');
      setFormKey(Date.now());
      
      // 延迟重置，确保表单实例已创建
      setTimeout(() => {
        if (form) {
          console.log('角色表单：重置字段');
          form.resetFields();
        }
      }, 100);
    }
  }, [visible]); // 仅依赖 visible，移除 form 依赖

  // 准备表单初始值
  const initialValues = currentRole ? {
    name: currentRole.name || '',
    code: currentRole.code || '',
    description: currentRole.description || '',
    status: currentRole.status || 'active'
  } : {
    status: 'active'
  };

  // 处理表单提交 - 适配API变更
    // 处理表单提交 - 适配API变更
  const handleFormSubmit = async (values: any): Promise<boolean> => {
    try {
      setLoading(true);
      
      // 添加更详细的日志
      console.log('原始表单数据:', JSON.stringify(values, null, 2));
      
      // 确保角色编码是大写
      const codeValue = values.code ? values.code.toUpperCase() : '';
      
      // 创建一个符合API要求的数据对象
      const roleData = {
        name: values.name,
        code: codeValue, // 使用大写的编码值
        description: values.description,
        isActive: values.status === 'active' // 将status转换为isActive布尔值
      };
      
      console.log('处理后提交给API的数据:', JSON.stringify(roleData, null, 2));
      
      if (currentRole) {
        // 更新角色 - 使用ID作为唯一标识
        console.log(`更新角色 ID: ${currentRole.id}`);
        
        try {
          await updateRole(currentRole.id, roleData);
        } catch (error: any) {
          console.error('更新角色时发生错误:', error);
          console.log('错误状态码:', error.response?.status);
          console.log('错误详情:', error.response?.data);
          throw error;
        }
      } else {
        // 创建角色 - ID由后端自动生成
        await createRole(roleData);
      }
      
      message.success(currentRole ? '角色更新成功' : '角色创建成功');
      onSuccess();
      return true;
    } catch (error: any) {
      console.error('保存角色失败:', error);
      const errorMsg = error.response?.data?.message || error.message || '操作失败';
      message.error(`保存角色失败: ${errorMsg}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 定义表单项配置 - 修改角色编码验证规则
  const formItems: FormItemConfig[] = [
    {
      name: 'name',
      label: '角色名称',
      type: 'input',
      rules: [
        { required: true, message: '请输入角色名称' }
      ],
      props: { placeholder: '请输入角色名称' }
    },
    {
      name: 'code',
      label: '角色编码',
      type: 'input',
      rules: [
        { required: true, message: '请输入角色编码' },
        { pattern: /^[A-Z-]+$/, message: '角色编码只能包含大写字母和连字符(-)' }
      ],
      props: { 
        placeholder: '请输入角色编码 (如: ADMIN、EDITOR、USER-MANAGER)',
        disabled: !!currentRole, // 编辑时不允许修改编码
        style: { textTransform: 'uppercase' } // 自动转换为大写
      }
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      props: { 
        placeholder: '请输入角色描述', 
        rows: 4,
        maxLength: 500
      }
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      props: { placeholder: '请选择状态' },
      options: [
        { value: 'active', label: '启用' }, // 对应 isActive: true
        { value: 'inactive', label: '禁用' } // 对应 isActive: false
      ]
    }
  ];

  return (
    <GenericModalForm
      key={formKey}
      title={currentRole ? '编辑角色' : '新建角色'}
      visible={visible}
      width={700}
      formItems={formItems}
      initialValues={initialValues}
      onCancel={onCancel}
      onSubmit={handleFormSubmit}
      okText={currentRole ? '保存' : '创建'}
      cancelText="取消"
      formRef={saveFormRef}
      layout="horizontal" // 直接指定为 horizontal
      labelCol={{ span: 6 }} // 直接设置标签宽度
      wrapperCol={{ span: 16 }} // 直接设置内容区域宽度
      modalProps={{
        confirmLoading: loading,
        destroyOnClose: true,
        centered: true, // 添加居中属性
        style: { top: 20 } // 调整顶部位置
      }}
      validateMessages={{
        required: '${label}不能为空',
        pattern: {
          mismatch: '${label}格式不匹配',
        },
      }}
      formProps={{
        // 删除这里的 layout、labelCol 和 wrapperCol
        // 避免覆盖顶层属性
      }}
    />
  );
};

export default RoleFormModal;
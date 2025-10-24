import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Select, message } from "antd";
import type { FormInstance } from "antd/es/form";
import GenericModalForm, {
  FormItemConfig,
} from "../../components/generic/GenericModalForm";
import {
  createPermission,
  updatePermission,
  Permission,
  getPermissionEnums,
  getOptionsByPermissionType,
  EnumOption,
} from "../../service/permissionService";

// 定义权限类型常量
export type PermissionType = "FUNCTION" | "DATA" | "UI" | "API" | "MENU";

// 用于存储类型对应的资源和操作选项
interface TypeOptions {
  resources: EnumOption[];
  actions: EnumOption[];
}

interface PermissionFormModalProps {
  visible: boolean;
  currentPermission: Permission | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
  visible,
  currentPermission,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formKey] = useState(() => Date.now());
  const [form, setForm] = useState<FormInstance | null>(null);

  // 枚举值状态
  const [systemOptions, setSystemOptions] = useState<EnumOption[]>([]);
  const [resourceOptions, setResourceOptions] = useState<EnumOption[]>([]);
  const [actionOptions, setActionOptions] = useState<EnumOption[]>([]);
  const [enumsLoading, setEnumsLoading] = useState<boolean>(false);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(false);

  // 使用 useRef 跟踪状态
  const initialized = useRef(false);

  // 保存表单引用
  const saveFormRef = (formInstance: FormInstance) => {
    setForm(formInstance);
  };

  // 获取枚举值
  const fetchEnums = async () => {
    if (systemOptions.length > 0 || enumsLoading) return;

    try {
      setEnumsLoading(true);
      const response = await getPermissionEnums();

      if (response?.data?.data) {
        const { systems } = response.data.data;
        setSystemOptions(systems || []);
      }
    } catch (error) {
      console.error("获取权限枚举值失败:", error);
      setSystemOptions([
        { key: "CORE", value: "CORE", label: "核心系统" },
        { key: "CRM", value: "CRM", label: "客户关系管理" },
        { key: "OMS", value: "OMS", label: "订单管理系统" },
      ]);
    } finally {
      setEnumsLoading(false);
    }
  };

  // 直接从 UserGroupFormModal 借鉴的类型变更处理
  const handleTypeChange = (value: string) => {
    if (!value) return;

    console.log("权限类型变更为:", value);

    // 保存当前表单所有值
    if (form) {
      const currentValues = form.getFieldsValue(true);
      console.log("当前表单值:", currentValues);

      // 获取API选项 - 但在此之前保存所有表单值
      // 这会导致闪烁，但至少不会丢失名称等字段
      loadTypeSpecificOptions(value);

      // 使用 setTimeout 确保在状态更新后恢复表单值
      setTimeout(() => {
        // 重新设置表单所有值，保留名称等字段，但使用新的类型值
        form.setFieldsValue({
          ...currentValues,
          type: value,
        });
        console.log("已恢复表单值，确保名称不丢失");
      }, 100); // 使用较长延时确保API调用完成
    } else {
      loadTypeSpecificOptions(value);
    }
  };

  // 简化的类型特定选项获取逻辑 - 保留但不再在回调中设置表单值
  const loadTypeSpecificOptions = async (typeValue: string) => {
    if (!typeValue) return;

    try {
      setOptionsLoading(true);
      console.log("获取权限类型特定选项:", typeValue);

      const response = await getOptionsByPermissionType(typeValue);

      if (response?.data?.data) {
        const { resources = [], actions = [] } = response.data.data;
        setResourceOptions(resources);
        setActionOptions(actions);

        if (form) {
          // 获取当前表单值
          const currentValues = form.getFieldsValue(true);
          const currentModule = currentValues.module;

          // 仅设置资源、操作和代码字段，不覆盖其他字段
          form.setFieldsValue({
            resource: undefined,
            action: undefined,
            code: currentModule ? `${currentModule}:` : "",
          });
        }
      }
    } catch (error) {
      console.error("获取权限类型特定选项失败:", error);
      setResourceOptions([]);
      setActionOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  // 处理字段变化
  const handleFieldChange = (fieldName: string) => (value: string) => {
    if (!form) return;

    const module =
      fieldName === "module" ? value : form.getFieldValue("module");
    const resource =
      fieldName === "resource" ? value : form.getFieldValue("resource");
    const action =
      fieldName === "action" ? value : form.getFieldValue("action");

    // 生成权限代码
    const codeValue = generatePermissionCode(module, resource, action);
    form.setFieldsValue({ code: codeValue });
  };

  // 生成权限代码
  const generatePermissionCode = (
    module?: string,
    resource?: string,
    action?: string
  ): string => {
    const parts = [];
    if (module) parts.push(module);
    if (resource) parts.push(resource);
    if (action) parts.push(action);
    return parts.join(":");
  };

  // 获取初始值
  const getInitialValues = () => {
    if (!currentPermission) {
      return { type: "FUNCTION" };
    }

    return {
      name: currentPermission.name,
      code: currentPermission.code,
      resource: currentPermission.resource,
      action: currentPermission.action,
      type: currentPermission.type || "FUNCTION",
      description: currentPermission.description || "",
      module: currentPermission.module || "",
    };
  };

  // 初始化表单
  const initForm = () => {
    if (!form) return;

    console.log("初始化表单...");
    form.resetFields();
    const initialValues = getInitialValues();
    form.setFieldsValue(initialValues);

    // 加载特定类型选项
    const typeValue = initialValues.type || "FUNCTION";
    loadTypeSpecificOptions(typeValue);

    initialized.current = true;
  };

  // 监听可见性变化
  useEffect(() => {
    if (visible) {
      fetchEnums();

      if (form && !initialized.current) {
        const timer = setTimeout(() => {
          initForm();
        }, 100);

        return () => clearTimeout(timer);
      }
    } else {
      initialized.current = false;
    }
  }, [visible, form]);

  // 修复表单提交处理逻辑
  const handleFormSubmit = async (values: any): Promise<boolean> => {
    try {
      console.log("提交表单数据:", values);
      setLoading(true);

      const permissionData: Permission = {
        id: currentPermission?.id || Date.now(),
        name: values.name,
        displayName: values.displayName || values.name,
        description: values.description || "",
        module: values.module || "",
        action: values.action,
        code: values.code,
        resource: values.resource,
        type: values.type || "FUNCTION",
      };

      // 处理 ID，确保为字符串类型
      let permissionId: string | undefined;
      if (currentPermission?.id) {
        permissionId = String(currentPermission.id);
        console.log("更新权限:", permissionId, permissionData);

        await updatePermission(permissionId, permissionData);
        message.success("权限更新成功");
      } else {
        console.log("创建权限:", permissionData);
        await createPermission(permissionData);
        message.success("权限创建成功");
      }

      // 成功时调用 onSuccess
      onSuccess();
      return true;
    } catch (error: any) {
      console.error("保存权限数据失败:", error);

      // 更详细的错误日志
      if (error.response) {
        console.error("响应状态:", error.response.status);
        console.error("响应数据:", error.response.data);
      }

      // 显示友好的错误消息
      const errorMsg =
        error.response?.data?.message || error.message || "操作失败";
      message.error(`保存失败: ${errorMsg}`);

      // 关键点：失败时返回 false，这样 GenericModalForm 不会关闭
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 表单项配置
  const formItems: FormItemConfig[] = [
    {
      name: "name",
      label: "权限名称",
      type: "input",
      rules: [{ required: true, message: "请输入权限名称" }],
      props: { placeholder: "请输入权限名称，如 创建用户" },
    },
    {
      name: "type",
      label: "权限类型",
      type: "select",
      rules: [{ required: true, message: "请选择权限类型" }],
      options: [
        { value: "FUNCTION", label: "功能权限" },
        { value: "DATA", label: "数据权限" },
        { value: "UI", label: "UI权限" },
        { value: "API", label: "API权限" },
        { value: "MENU", label: "菜单权限" },
      ],
      props: {
        placeholder: "请选择权限类型",
        onChange: handleTypeChange,
      },
    },
    {
      name: "module",
      label: "所属系统",
      type: "select",
      options: systemOptions,
      rules: [{ required: true, message: "请选择所属系统" }],
      props: {
        placeholder: "请选择所属系统",
        loading: enumsLoading,
        showSearch: true,
        optionFilterProp: "label",
        onChange: handleFieldChange("module"),
      },
    },
    {
      name: "resource",
      label: "资源",
      type: "select",
      rules: [{ required: true, message: "请选择资源" }],
      options: resourceOptions,
      props: {
        placeholder: "请选择资源",
        loading: optionsLoading,
        showSearch: true,
        optionFilterProp: "label",
        onChange: handleFieldChange("resource"),
      },
    },
    {
      name: "action",
      label: "操作",
      type: "select",
      rules: [{ required: true, message: "请选择操作类型" }],
      options: actionOptions,
      props: {
        placeholder: "请选择操作类型",
        loading: optionsLoading,
        showSearch: true,
        optionFilterProp: "label",
        onChange: handleFieldChange("action"),
      },
    },
    {
      name: "code",
      label: "权限代码",
      type: "input",
      rules: [{ required: true, message: "权限代码不能为空" }],
      props: {
        placeholder: "系统:资源:操作",
        disabled: true,
        style: {
          backgroundColor: "#f5f5f5",
          color: "#666",
        },
      },
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      props: {
        placeholder: "请输入权限描述",
        rows: 3,
        maxLength: 200,
      },
    },
  ];

  return (
    <GenericModalForm
      key={formKey}
      title={currentPermission ? "编辑权限" : "新建权限"}
      visible={visible}
      width={600}
      formItems={formItems}
      initialValues={getInitialValues()}
      onCancel={onCancel}
      onSubmit={handleFormSubmit}
      okText={currentPermission ? "保存" : "创建"}
      cancelText="取消"
      formRef={saveFormRef}
      modalProps={{
        confirmLoading: loading,
        destroyOnClose: false, // 关键修改点1：设置为false，保留表单内容
        maskClosable: false,
      }}
      formProps={{
        layout: "horizontal",
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
        preserve: true, // 关键修改点2：保留表单项值
        validateMessages: {
          // 关键修改点3：添加验证信息
          required: "${label}不能为空",
          pattern: {
            mismatch: "${label}格式不匹配",
          },
        },
      }}
    />
  );
};

export default PermissionFormModal;

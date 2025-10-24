import React, { useState, useEffect, useMemo } from "react";
import { message } from "antd";

import GenericModalForm, {
  FormItemConfig,
} from "../../components/generic/GenericModalForm"; // 引入通用表单模态框组件
import { createUser, updateUser } from "../../service/userService"; // 引入创建用户和更新用户服务
import { getRoles } from "../../service/roleService"; // 引入获取角色列表服务

// 用户接口定义
interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string; // 注意：API中是phone
  firstName?: string;
  lastName?: string;
  nickname?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  status: "active" | "inactive" | "locked";
  roleIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// 角色接口定义
interface Role {
  id: string;
  name: string;
  description?: string;
}

// 用户表单模态框Props接口
interface UserFormModalProps {
  visible: boolean;
  currentUser: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * 用户表单模态框组件
 */
const UserFormModal: React.FC<UserFormModalProps> = ({
  // 定义用户表单模态框组件
  visible,
  currentUser,
  onCancel,
  onSuccess,
}) => {
  // 角色列表状态
  const [roles, setRoles] = useState<Role[]>([]); // 角色列表状态
  const [loadingRoles, setLoadingRoles] = useState(false); // 加载状态
  const [formKey, setFormKey] = useState(0); // 表单重置标志

  // 获取角色列表
  useEffect(() => {
    if (visible) {
      // 如果模态框可见
      setFormKey((prev) => prev + 1); // 重置表单

      console.log(
        "模态框打开，currentUser:",
        currentUser,
        "表单将被初始化为:",
        currentUser ? "编辑模式" : "新建模式(空表单)"
      );
      fetchRoles(); // 获取角色列表
    }
  }, [visible, currentUser]); // 依赖项数组，visible 或 currentUser 变化时重新执行

  // 获取角色列表
  // 获取角色列表
  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await getRoles();
      console.log("角色API响应:", response);

      // 安全地提取角色数组
      let roleData: Role[] = []; // 明确指定类型
      if (response?.data?.data && Array.isArray(response.data.data)) {
        roleData = response.data.data as Role[];
        console.log("从 response.data.data 提取角色数组");
      } else if (Array.isArray(response.data)) {
        roleData = response.data as Role[];
        console.log("从 response.data 提取角色数组");
      } else if (response?.data && typeof response.data === "object") {
        // 简化角色数据访问，使用类型断言
        const responseData = (response as any).data;
        if (Array.isArray(responseData.data)) {
          roleData = responseData.data.map((role: any) => ({
            id: String(role.id),
            name: role.name,
            description: role.description || role.displayName,
          }));
          console.log("从 response.data.data 中提取角色数组");
        } else if (Array.isArray(responseData.items)) {
          roleData = responseData.items.map((role: any) => ({
            id: String(role.id),
            name: role.name,
            description: role.description || role.displayName,
          }));
          console.log("从 response.data.items 中提取角色数组");
        } else if (responseData.id) {
          roleData = [
            {
              id: String(responseData.id),
              name: responseData.name,
              description: responseData.description || responseData.displayName,
            },
          ];
          console.log("将单个角色对象转换为数组");
        } else {
          // 尝试从对象中找到可能的数组
          const possibleArrays = Object.values(responseData).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            roleData = (possibleArrays[0] as any[]).map((role: any) => ({
              id: String(role.id),
              name: role.name,
              description: role.description || role.displayName,
            }));
            console.log("从嵌套对象中提取角色数组");
          }
        }
      }

      // 确保 roleData 一定是数组
      if (!Array.isArray(roleData)) {
        console.warn("获取到的角色数据不是数组:", roleData);
        roleData = [];
      }

      console.log("处理后的角色数据:", roleData);
      setRoles(roleData);
    } catch (error) {
      console.error("获取角色列表失败:", error);
      message.error("获取角色列表失败");
      setRoles([]); // 确保出错时设置为空数组
    } finally {
      setLoadingRoles(false);
    }
  };

  // 使用 useMemo 计算表单初始值
  const initialValues = useMemo(() => {
    // 如果有当前用户数据，做映射转换
    if (currentUser) {
      return {
        ...currentUser, // 先展开当前用户数据
        phone: currentUser.phoneNumber, // 适配API字段名
      };
    }
    // 否则返回空对象
    return {};
  }, [currentUser]); // 依赖项数组，只有 currentUser 变化时才重新计算

  // 表单提交处理
  // 修改 handleFormSubmit 函数中的错误处理部分

  const handleFormSubmit = async (values: any) => {
    try {
      console.log("表单提交值:", values);

      const submissionData = { ...values };

      // 字段名适配：phoneNumber -> phone
      if (submissionData.phoneNumber) {
        submissionData.phone = submissionData.phoneNumber;
        delete submissionData.phoneNumber;
      }

      // 处理密码字段
      if (
        currentUser &&
        (!submissionData.password || submissionData.password.trim() === "")
      ) {
        delete submissionData.password;
      }

      // 电子邮箱和手机号验证
      if (
        (!submissionData.email || submissionData.email.trim() === "") &&
        (!submissionData.phone || submissionData.phone.trim() === "")
      ) {
        message.error("电子邮箱和手机号至少填写一项");
        return false;
      }

      console.log("准备提交的数据:", submissionData);

      let result;
      if (currentUser) {
        // 更新用户
        console.log(`准备更新用户ID: ${currentUser.id}`);
        result = await updateUser(currentUser.id, submissionData);
        console.log("更新用户API返回结果:", result);
        message.success("更新成功");
      } else {
        // 创建新用户
        console.log("准备创建新用户");
        result = await createUser(submissionData);
        console.log("创建用户API返回结果:", result);
        message.success("创建成功");
      }

      onSuccess();
      return true;
    } catch (error: any) {
      console.error("操作失败，错误对象:", error);

      // 改进错误处理 - 处理 409 Conflict 错误
      if (error.response && error.response.status === 409) {
        // 获取具体的冲突信息
        const conflictData = error.response.data;

        // 尝试从响应中获取更具体的信息
        const conflictField = conflictData?.field || "";
        const conflictValue = conflictData?.value || "";
        const errorMsg = conflictData?.message || "";

        // 根据冲突字段显示不同的错误消息
        if (conflictField === "username") {
          message.error(`用户名 "${conflictValue}" 已被使用，请更换其他用户名`);
        } else if (conflictField === "email") {
          message.error(`电子邮箱 "${conflictValue}" 已被使用，请更换其他邮箱`);
        } else if (
          conflictField === "phone" ||
          conflictField === "phoneNumber"
        ) {
          message.error(`手机号 "${conflictValue}" 已被使用，请更换其他手机号`);
        } else {
          // 如果没有具体字段信息，显示通用错误
          message.error(errorMsg || "保存失败：记录已存在或与现有数据冲突");
        }
      } else {
        // 其他错误处理
        const errorMsg =
          error.response?.data?.message || error.message || "操作失败";
        message.error(`操作失败: ${errorMsg}`);
      }

      return false;
    }
  };

  // 定义表单配置
  const formItems: FormItemConfig[] = [
    {
      name: "username",
      label: "用户名",
      type: "input",
      rules: [
        // 添加用户名字段验证规则
        { required: true, message: "请输入用户名" }, // 必填验证
        { min: 3, message: "用户名至少3个字符" }, // 最小长度验证
      ],
      props: {
        placeholder: "请输入用户名",
        disabled: !!currentUser, // 编辑模式下禁用用户名
      },
    },
    // 修改密码字段定义
    ...(currentUser
      ? []
      : [
          // 如果是编辑模式，不显示密码字段
          {
            name: "password",
            label: "密码",
            type: "input", // 修改为 'input' 类型
            rules: [
              { required: !currentUser, message: "请输入密码" }, // 如果是新建模式，密码必填
              { min: 6, message: "密码至少6个字符" }, // 密码最小长度验证
            ],
            props: {
              placeholder: "请输入密码", // 设置密码输入框的提示文本
              type: "password", // 在 props 中设置 input 的 type 为 password     // 设置密码输入框的类型为密码
            },
          } as FormItemConfig, // 添加正确的类型注解
        ]),
    {
      name: "firstName",
      label: "名",
      type: "input",
      props: { placeholder: "请输入名" },
    },
    {
      name: "lastName",
      label: "姓",
      type: "input",
      props: { placeholder: "请输入姓" },
    },
    {
      name: "email",
      label: "电子邮箱",
      type: "input",
      rules: [
        {
          type: "email", // 邮箱格式验证
          message: "请输入有效的电子邮箱格式", // 邮箱格式错误提示
        },
      ],
      props: { placeholder: "请输入电子邮箱 (邮箱和手机号至少填一项)" },
    },
    {
      name: "phoneNumber",
      label: "手机号",
      type: "input",
      rules: [
        {
          pattern: /^1\d{10}$/, // 手机号格式验证
          message: "请输入有效的手机号", // 手机号格式错误提示
        },
      ],
      props: { placeholder: "请输入手机号 (邮箱和手机号至少填一项)" }, // 设置手机号输入框的提示文本
    },
    {
      name: "roleIds",
      label: "用户角色",
      type: "select",
      props: {
        // 设置下拉框的属性
        placeholder: "请选择用户角色",
        mode: "multiple", // 多选模式
        loading: loadingRoles, // 加载状态
        optionFilterProp: "label", // 选项过滤属性
      },
      options: roles.map((role) => ({
        // 设置下拉框选项
        value: role.id, // 选项值
        label: `${role.name}${
          role.description ? ` (${role.description})` : ""
        }`, // 选项标签
      })),
    },
    // 仅编辑模式下显示状态字段
    ...(currentUser
      ? [
          // 如果是编辑模式，显示状态字段
          {
            name: "status",
            label: "状态",
            type: "select",
            props: { placeholder: "请选择状态" },
            options: [
              { value: "active", label: "启用" }, // 启用选项
              { value: "inactive", label: "禁用" }, // 禁用选项
              { value: "locked", label: "锁定" }, // 锁定选项
            ],
          } as FormItemConfig, // 添加正确的类型注解
        ]
      : []),
    {
      name: "avatar",
      label: "头像URL",
      type: "input",
      props: { placeholder: "请输入头像图片URL" },
    },
  ];

  // 在 UserFormModal 组件中
  // 在组件末尾的 return 语句中添加布局相关属性

  return (
    <GenericModalForm
      key={formKey}
      title={currentUser ? "编辑用户" : "新建用户"}
      visible={visible}
      width={600}
      formItems={formItems}
      initialValues={initialValues}
      onCancel={onCancel}
      onSubmit={handleFormSubmit}
      okText={currentUser ? "保存" : "创建"}
      cancelText="取消"
      // 添加布局相关属性
      layout="horizontal" // 将布局设置为水平
      labelCol={{ span: 6 }} // 标签宽度占6格
      wrapperCol={{ span: 16 }} // 输入控件占18格
      validateMessages={{
        required: "${label}不能为空",
        types: {
          email: "${label}格式无效",
        },
        pattern: {
          mismatch: "${label}格式不匹配",
        },
      }}
      modalProps={{
        classNames: {
          header: "custom-modal-header",
          body: "custom-modal-body",
          footer: "custom-modal-footer",
        },
      }}
    />
  );
};

export default UserFormModal;

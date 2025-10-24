import { FormItemConfig } from "../../components/generic/GenericModalForm";

/**
 * 获取表单项配置
 */
export const getFormItems = (isEditMode: boolean): FormItemConfig[] => [
  {
    name: "form_username",
    label: "用户名",
    type: "input",
    props: { placeholder: "请输入用户名" },
    rules: [
      { required: true, message: "请输入用户名" },
      { min: 3, max: 20, message: "用户名长度在3-20个字符之间" },
    ],
  },
  {
    name: "form_phone",
    label: "手机号",
    type: "input",
    props: { placeholder: "请输入手机号" },
    rules: [
      { required: true, message: "请输入手机号" },
      { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号格式" },
    ],
  },
  {
    name: "form_password",
    label: "密码",
    type: "input",
    props: {
      placeholder: isEditMode ? "不修改请留空" : "请输入密码",
      type: "password"
    },
    rules: isEditMode ? [] : [
      { required: true, message: "请输入密码" },
      { min: 6, message: "密码长度至少6个字符" },
    ],
  },
  {
    name: "form_confirmPassword",
    label: "确认密码",
    type: "input",
    props: {
      placeholder: isEditMode ? "不修改请留空" : "请再次输入密码",
      type: "password"
    },
    rules: isEditMode ? [] : [
      { required: true, message: "请确认密码" },
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          if (!value || getFieldValue("form_password") === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error("两次输入的密码不一致"));
        },
      }),
    ],
  },
  {
    name: "form_status",
    label: "状态",
    type: "select",
    props: { placeholder: "请选择状态" },
    options: [
      { label: "活跃", value: "active" },
      { label: "禁用", value: "inactive" },
    ],
    rules: [{ required: true, message: "请选择状态" }],
  },
];

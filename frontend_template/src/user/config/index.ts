import { SearchItemConfig } from "../../components/generic";

/**
 * 搜索项配置
 */
export const searchItems: SearchItemConfig[] = [
  {
    name: "username",
    label: "用户名",
    type: "input",
    props: { placeholder: "请输入用户名" },
  },
  {
    name: "phone",
    label: "手机号",
    type: "input",
    props: { placeholder: "请输入手机号" },
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    props: { placeholder: "请选择状态" },
    options: [
      { label: "活跃", value: "active" },
      { label: "禁用", value: "inactive" },
    ],
  },
];

/**
 * 表单布局配置
 */
export const formLayoutConfig = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * 模态框配置
 */
export const modalConfig = {
  width: 800,
  destroyOnClose: true,
};

// 导出配置
export { getStatisticCardsConfig } from './statisticCards';
export { getTableColumnsConfig } from './tableColumns';
export { getTableButtonsConfig } from './tableButtons';
export { getFormItems } from './formConfig';

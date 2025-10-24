import { TableButtonConfig } from "../../components/generic";

/**
 * 获取表格按钮配置
 */
export const getTableButtonsConfig = (handlers: {
  onAdd: () => void;
  onRefresh: () => void;
}): TableButtonConfig[] => [
  {
    key: "add",
    label: "添加用户",
    type: "primary",
    icon: "PlusOutlined",
    onClick: handlers.onAdd,
  },
  {
    key: "refresh",
    label: "刷新",
    type: "default",
    icon: "ReloadOutlined",
    onClick: handlers.onRefresh,
  },
];

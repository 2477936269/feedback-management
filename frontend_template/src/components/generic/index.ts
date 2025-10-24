// 导出所有通用组件
export { default as GenericPanelTable } from './GenericPanelTable';
export { default as GenericPanelList } from './GenericPanelList';
export { default as GenericPanelSearch } from './GenericPanelSearch';
export { default as GenericPanelTree } from './GenericPanelTree';
export { default as GenericPanelTransfer } from './GenericPanelTransfer';
export { default as GenericModalForm } from './GenericModalForm';
export { default as GenericModalTransfer } from './GenericModalTransfer';
export { default as GenericStatisticCards } from './GenericStatisticCards';

// 导出类型定义
export interface FormItemConfig {
  name: string;
  label: string;
  type: 'input' | 'select' | 'textarea' | 'date' | 'number' | 'password' | 'email';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  rules?: any[];
  disabled?: boolean;
  hidden?: boolean;
  props?: Record<string, any>;
}

export interface SearchItemConfig {
  name: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'dateRange' | 'number';
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  allowClear?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  props?: Record<string, any>;
}

export interface TableButtonConfig {
  key: string;
  label: string;
  type: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  icon?: React.ReactNode;
  onClick: (record?: any) => void;
  disabled?: boolean;
  hidden?: boolean;
  confirm?: {
    title: string;
    content: string;
  };
}

export interface StatisticCardConfig {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
  color?: string;
  icon?: React.ReactNode;
}

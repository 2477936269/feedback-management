import { ColumnType } from "antd/es/table";
import { Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export interface UserData {
  id: string;
  username: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取表格列配置
 */
export const getTableColumnsConfig = (handlers: {
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}): ColumnType<UserData>[] => [
  {
    title: "用户名",
    dataIndex: "username",
    key: "username",
    width: 120,
  },
  {
    title: "手机号",
    dataIndex: "phone",
    key: "phone",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: string) => {
      const color = status === "active" ? "green" : "default";
      const text = status === "active" ? "活跃" : "禁用";
      return <Tag color={color}>{text}</Tag>;
    },
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
    render: (date: string) => new Date(date).toLocaleString(),
  },
  {
    title: "更新时间",
    dataIndex: "updatedAt",
    key: "updatedAt",
    width: 180,
    render: (date: string) => new Date(date).toLocaleString(),
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <Space size="small">
        <EditOutlined
          style={{ color: "#1890ff", cursor: "pointer" }}
          onClick={() => handlers.onEdit(record)}
        />
        <DeleteOutlined
          style={{ color: "#ff4d4f", cursor: "pointer" }}
          onClick={() => handlers.onDelete(record)}
        />
      </Space>
    ),
  },
];

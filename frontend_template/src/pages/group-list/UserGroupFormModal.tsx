import React, { useState, useEffect } from "react";
import { message, Divider, Form } from "antd";
import type { FormInstance } from "antd/es/form";
import GenericModalForm, {
  FormItemConfig,
} from "../../components/generic/GenericModalForm";
import {
  createUserGroup,
  updateUserGroup,
  getUserGroups,
} from "../../service/userGroupService";
import moment from "moment";

// 用户组接口定义
interface UserGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;

  // 添加新的字段
  type?: "PERMANENT" | "TEMPORARY";
  validFrom?: string;
  validTo?: string;
  autoExpire?: boolean;
  permissionLevel?: number;
  dataScope?: "SELF" | "TEAM" | "BRANCH" | "ALL";
  inheritPermissions?: boolean;
  businessType?:
    | "DEPARTMENT"
    | "PROJECT"
    | "TEAM"
    | "ROLE"
    | "COMMITTEE"
    | "OTHER";
  tags?: string[];
  visibility?: "PUBLIC" | "INTERNAL" | "RESTRICTED" | "CONFIDENTIAL";
  securityLevel?: number;
}

interface UserGroupFormModalProps {
  visible: boolean;
  currentGroup: UserGroup | null;
  onCancel: () => void;
  onSuccess: () => void;
  layout?: "horizontal" | "vertical";
  labelCol?: { span: number };
  wrapperCol?: { span: number };
}

const UserGroupFormModal: React.FC<UserGroupFormModalProps> = ({
  visible,
  currentGroup,
  onCancel,
  onSuccess,
  layout = "vertical",
  labelCol = { span: 6 },
  wrapperCol = { span: 16 },
}) => {
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [form, setForm] = useState<any>(null);
  // 修改为树形结构类型
  const [parentGroups, setParentGroups] = useState<
    { title: string; value: string; key: string; children?: any[] }[]
  >([]);
  const [loadingParentGroups, setLoadingParentGroups] = useState(false);
  const [isTemporaryGroup, setIsTemporaryGroup] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // 当模态框可见状态变化时，重新生成表单实例
  // 修改 useEffect
  useEffect(() => {
    if (visible) {
      console.log("模态框显示，重置所有状态");

      // 重置表单键值，强制重新渲染
      setFormKey((prev) => prev + 1);

      // 重置表单实例
      if (form) {
        form.resetFields();
      }

      // 重置父级用户组
      setParentGroups([]);

      // 获取新的父级用户组
      fetchParentGroups();

      // 初始化临时组状态和标签
      if (currentGroup) {
        setIsTemporaryGroup(currentGroup.type === "TEMPORARY");
        setTags(currentGroup.tags || []);
      } else {
        setIsTemporaryGroup(false);
        setTags([]);
      }
    }
  }, [visible, currentGroup]);

  // 获取可用的父级用户组
  const fetchParentGroups = async () => {
    try {
      setLoadingParentGroups(true);
      console.log("开始获取父级用户组...");

      // 获取所有可用的用户组
      const response = await getUserGroups({
        isActive: true,
        pageSize: 1000, // 确保获取足够多的用户组
        current: 1,
      });

      console.log("API返回原始数据:", response);

      // 标准化提取数据逻辑
      let groups = [];
      if (response?.data) {
        // 使用类型断言简化数据访问
        const responseData = (response as any)?.data;
        if (Array.isArray(responseData?.data)) {
          groups = responseData.data;
        } else if (Array.isArray(responseData?.items)) {
          groups = responseData.items;
        } else if (Array.isArray(responseData)) {
          groups = responseData;
        } else if (typeof responseData === "object") {
          groups = [response.data];
        }
      } else if (Array.isArray(response)) {
        groups = response;
      }

      // 规范化 ID 格式 - 这是关键修改
      const normalizedGroups = groups.map((group: any) => ({
        ...group,
        id: String(group.id || ""), // 确保 ID 是字符串
        parentId: group.parentId ? String(group.parentId) : null, // 确保父 ID 是字符串或 null
      }));

      console.log("标准化后的用户组数据:", normalizedGroups);

      // 如果是编辑模式，需要过滤掉当前组及其子组，避免循环引用
      const filteredGroups = currentGroup
        ? normalizedGroups.filter(
            (group: UserGroup) => String(group.id) !== String(currentGroup.id)
          )
        : normalizedGroups;

      // 修改的树形结构构建逻辑
      const buildTreeData = (items: any[]): any[] => {
        // 创建 ID 到项目的映射
        const itemMap = new Map<string, any>();
        items.forEach((item) => {
          itemMap.set(String(item.id), { ...item });
        });

        // 构建子节点映射
        const childrenMap = new Map<string, any[]>();
        items.forEach((item) => {
          if (item.parentId) {
            const parentId = String(item.parentId);
            if (!childrenMap.has(parentId)) {
              childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId)?.push(item);
          }
        });

        // 找出所有的根节点（没有父级或父级不在当前列表中的节点）
        const rootItems = items.filter(
          (item) => !item.parentId || !itemMap.has(String(item.parentId))
        );

        // 递归构建树结构
        const buildNode = (item: any): any => {
          const id = String(item.id);
          const children = childrenMap.get(id) || [];

          return {
            title: item.name,
            value: id,
            key: id,
            // 仅当有子节点时添加 children 属性
            ...(children.length > 0
              ? {
                  children: children.map(buildNode),
                }
              : {}),
          };
        };

        // 处理每个根节点
        const treeData = rootItems.map(buildNode);

        // 添加"无父级"选项
        treeData.unshift({
          title: "无 (顶级用户组)",
          value: "",
          key: "root",
        });

        return treeData;
      };

      // 使用修改后的树形结构构建逻辑
      const treeData = buildTreeData(filteredGroups);
      console.log("构建的树形选择数据:", treeData);

      // 更新状态
      setParentGroups(treeData);
    } catch (error) {
      console.error("获取父级用户组失败:", error);
      message.error("获取父级用户组失败");

      // 即使失败也设置默认选项
      setParentGroups([
        {
          title: "无 (顶级用户组)",
          value: "",
          key: "root",
        },
      ]);
    } finally {
      setLoadingParentGroups(false);
    }
  };

  // 监控父级用户组状态更新
  useEffect(() => {
    console.log("父级用户组状态已更新:", parentGroups);
  }, [parentGroups]);

  // 准备表单初始值
  const initialValues = currentGroup
    ? {
        name: currentGroup.name,
        code: currentGroup.code,
        description: currentGroup.description || "",
        parentId: currentGroup.parentId || "",
        isActive: currentGroup.isActive,

        // 添加新字段的初始值
        type: currentGroup.type || "PERMANENT",
        validFrom: currentGroup.validFrom
          ? moment(currentGroup.validFrom)
          : undefined,
        validTo: currentGroup.validTo
          ? moment(currentGroup.validTo)
          : undefined,
        autoExpire: currentGroup.autoExpire || false,
        permissionLevel: currentGroup.permissionLevel || 10,
        dataScope: currentGroup.dataScope || "SELF",
        inheritPermissions: currentGroup.inheritPermissions || false,
        businessType: currentGroup.businessType || "DEPARTMENT",
        visibility: currentGroup.visibility || "PUBLIC",
        securityLevel: currentGroup.securityLevel || 1,
      }
    : {
        isActive: true,
        parentId: "",
        type: "PERMANENT",
        permissionLevel: 10,
        dataScope: "SELF",
        inheritPermissions: false,
        businessType: "DEPARTMENT",
        visibility: "PUBLIC",
        securityLevel: 1,
      };

  // 处理表单提交
  // 修改 handleFormSubmit 函数增强 parentId 处理

  const handleFormSubmit = async (values: any): Promise<boolean> => {
    try {
      setLoading(true);

      // 确保代码是大写
      const codeValue = values.code ? values.code.toUpperCase() : "";

      // 处理日期类型
      const validFrom = values.validFrom
        ? values.validFrom.format("YYYY-MM-DD")
        : undefined;
      const validTo = values.validTo
        ? values.validTo.format("YYYY-MM-DD")
        : undefined;

      // 改进 parentId 处理
      let parentId = null;

      // 增强 parentId 处理，确保以字符串形式传递非空值
      if (values.parentId !== undefined && values.parentId !== null) {
        if (values.parentId === "") {
          // 空字符串表示顶级用户组，设为 null
          parentId = null;
        } else {
          // 非空值，确保是字符串类型
          parentId = String(values.parentId);
        }
      }

      console.log("处理后的 parentId:", parentId);
      console.log("原始表单值:", values);

      // 创建一个符合API要求的数据对象
      const userGroupData = {
        name: values.name,
        code: codeValue,
        description: values.description,
        parentId: parentId, // 使用处理后的 parentId
        isActive: values.isActive,

        // 添加新字段
        type: values.type,
        validFrom,
        validTo,
        autoExpire: values.autoExpire,
        permissionLevel: values.permissionLevel,
        dataScope: values.dataScope,
        inheritPermissions: values.inheritPermissions,
        businessType: values.businessType,
        tags, // 使用状态中维护的标签数组
        visibility: values.visibility,
        securityLevel: values.securityLevel,
      };

      console.log("处理后提交给API的数据:", userGroupData);

      if (currentGroup) {
        // 更新用户组时，确保传递正确的 ID 格式
        const groupId = String(currentGroup.id);
        console.log(`更新用户组 ID: ${groupId}`);

        // 调用 API 前后添加日志以便调试
        console.log("更新前用户组数据:", currentGroup);
        console.log("提交的 parentId:", parentId);

        const response = await updateUserGroup(groupId, userGroupData);
        console.log("API 响应:", response);

        message.success("用户组更新成功");

        // 确保触发完整刷新
        onSuccess();
        return true;
      } else {
        // 创建用户组
        await createUserGroup(userGroupData);
        message.success("用户组创建成功");
      }

      onSuccess();
      return true;
    } catch (error: any) {
      console.error("保存用户组失败:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "操作失败";
      message.error(`保存用户组失败: ${errorMsg}`);

      // 添加详细错误日志
      if (error.response?.data) {
        console.error("API 错误详情:", error.response.data);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  // 优化组类型变化处理函数
  const handleTypeChange = (value: string) => {
    console.log("组类型变更为:", value);

    // 保存当前表单所有值
    if (form) {
      const currentValues = form.getFieldsValue(true);
      console.log("当前表单值:", currentValues);

      // 更新临时组显示状态
      setIsTemporaryGroup(value === "TEMPORARY");

      // 使用 setTimeout 确保在状态更新后恢复表单值
      setTimeout(() => {
        form.setFieldsValue(currentValues);
        console.log("已恢复表单值");
      }, 0);
    } else {
      // 如果表单实例不可用，仅更新显示状态
      setIsTemporaryGroup(value === "TEMPORARY");
    }
  };

  // 添加表单实例保存函数
  // 改进表单实例保存函数

  const saveFormRef = (formInstance: FormInstance) => {
    // 功能为保存表单引用
    console.log("接收到表单实例", formInstance); // 添加日志以确认表单实例已接收到
    setForm(formInstance); // 保存表单实例
  };

  // 构建表单项
  const formItems: FormItemConfig[] = [
    // 基础信息
    {
      name: "header_basic",
      label: "基本信息",
      type: "divider", // 使用新增的divider类型
    },
    {
      name: "name",
      label: "用户组名称",
      type: "input",
      rules: [{ required: true, message: "请输入用户组名称" }],
      props: { placeholder: "请输入用户组名称" },
    },
    {
      name: "code",
      label: "用户组编码",
      type: "input",
      rules: [
        { required: true, message: "请输入用户组编码" },
        {
          pattern: /^[A-Z0-9_]+$/,
          message: "编码只能包含大写字母、数字和下划线",
        },
      ],
      props: {
        placeholder: "请输入用户组编码 (如: FINANCE, HR_ADMIN)",
        disabled: !!currentGroup,
        style: { textTransform: "uppercase" },
      },
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      props: { placeholder: "请输入用户组描述", rows: 3, maxLength: 500 },
    },
    // 修改 formItems 中的父级用户组表单项配置
    {
      name: "parentId",
      label: "父级用户组",
      // 如果 GenericModalForm 支持 treeSelect，使用这个
      type: "treeSelect",
      props: {
        placeholder: "请选择父级用户组",
        allowClear: true,
        loading: loadingParentGroups,
        showSearch: true,
        treeNodeFilterProp: "title", // 使用节点标题进行搜索
        filterTreeNode: (inputValue: string, treeNode: any) => {
          // 自定义过滤逻辑，增强搜索体验
          const title = treeNode.title?.toString().toLowerCase() || "";
          return title.indexOf(inputValue.toLowerCase()) >= 0;
        },
        treeDefaultExpandAll: true, // 默认展开所有节点
        treeLine: true, // 显示连接线
        treeData: parentGroups, // 传递树形数据
        virtual: false, // 小数据量时禁用虚拟滚动，避免可能的渲染问题
        style: { width: "100%" },
      },
    },
    {
      name: "isActive",
      label: "状态",
      type: "switch",
      // 不需要指定 valuePropName，GenericModalForm 会自动设置
    },

    // 类型与有效期
    {
      name: "header_type",
      label: "类型与有效期",
      type: "divider", // 使用新增的divider类型
    },
    {
      name: "type",
      label: "组类型",
      type: "select",
      options: [
        { value: "PERMANENT", label: "永久组" },
        { value: "TEMPORARY", label: "临时组" },
      ],
      props: { onChange: handleTypeChange },
    },
    {
      name: "businessType",
      label: "业务类型",
      type: "select",
      options: [
        { value: "DEPARTMENT", label: "部门" },
        { value: "PROJECT", label: "项目组" },
        { value: "TEAM", label: "团队" },
        { value: "ROLE", label: "角色组" },
        { value: "COMMITTEE", label: "委员会" },
        { value: "OTHER", label: "其他" },
      ],
    },
    // 有效期开始（仅在临时组时显示）
    {
      name: "validFrom",
      label: "有效期开始",
      type: "date",
      hidden: !isTemporaryGroup, // 根据状态控制显示/隐藏
      props: { placeholder: "开始日期" },
    },
    {
      name: "validTo",
      label: "有效期结束",
      type: "date",
      hidden: !isTemporaryGroup, // 根据状态控制显示/隐藏
      props: { placeholder: "结束日期" },
    },
    {
      name: "autoExpire",
      label: "自动过期",
      type: "switch",
      hidden: !isTemporaryGroup, // 根据状态控制显示/隐藏
    },

    // 权限设置
    {
      name: "header_permission",
      label: "权限设置",
      type: "divider", // 使用新增的divider类型
    },
    {
      name: "permissionLevel",
      label: "权限级别",
      type: "number",
      props: { min: 0, max: 100 },
    },
    {
      name: "dataScope",
      label: "数据权限范围",
      type: "select",
      options: [
        { value: "SELF", label: "个人数据" },
        { value: "TEAM", label: "团队数据" },
        { value: "BRANCH", label: "分支机构数据" },
        { value: "ALL", label: "全部数据" },
      ],
    },
    {
      name: "inheritPermissions",
      label: "继承权限",
      type: "switch",
      // 不需要指定 valuePropName
    },

    // 安全与标识
    {
      name: "header_security",
      label: "安全与标识",
      type: "divider", // 使用新增的divider类型
    },
    {
      name: "visibility",
      label: "可见性",
      type: "select",
      options: [
        { value: "PUBLIC", label: "公开" },
        { value: "INTERNAL", label: "内部" },
        { value: "RESTRICTED", label: "受限" },
        { value: "CONFIDENTIAL", label: "机密" },
      ],
    },
    {
      name: "securityLevel",
      label: "安全级别",
      type: "number",
      props: { min: 1, max: 10 },
    },
    // 注意：由于 GenericModalForm 不支持自定义渲染和标签功能，
    // 我们暂时移除标签功能，或者可以考虑通过后续的API调用单独处理标签
  ];

  return (
    <GenericModalForm
      key={formKey}
      title={currentGroup ? "编辑用户组" : "新建用户组"}
      visible={visible}
      width={700}
      formItems={formItems}
      initialValues={initialValues}
      onCancel={onCancel}
      onSubmit={handleFormSubmit}
      okText={currentGroup ? "保存" : "创建"}
      cancelText="取消"
      layout={layout}
      formRef={saveFormRef} // 添加这一行，保存表单引用
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      modalProps={{
        confirmLoading: loading,
        destroyOnClose: true,
      }}
      validateMessages={{
        required: "${label}不能为空",
        pattern: {
          mismatch: "${label}格式不匹配",
        },
      }}
      formProps={{
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
      }}
    />
  );
};

export default UserGroupFormModal;

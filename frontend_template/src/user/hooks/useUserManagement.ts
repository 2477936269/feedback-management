import { useState, useEffect } from "react";
import { App, Modal } from "antd";
import { UserApiService } from "../service";

const useUserManagement = () => {
  const [searchValues, setSearchValues] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 使用App.useApp() hook获取message和modal实例
  const { message, modal } = App.useApp();

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserApiService.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        message.error(response.error || '获取用户列表失败');
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    loadUsers();
  }, []);

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchValues(values);
    console.log("搜索条件:", values);

    // 过滤掉空值
    const filteredValues = Object.keys(values).reduce((acc, key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        acc[key] = values[key];
      }
      return acc;
    }, {} as any);

    console.log("过滤后的搜索条件:", filteredValues);

    // 如果有搜索条件，进行搜索
    if (Object.keys(filteredValues).length > 0) {
      loadUsersWithSearch(filteredValues);
    } else {
      // 没有搜索条件，加载所有数据
      loadUsers();
    }
  };

  // 带搜索条件加载用户
  const loadUsersWithSearch = async (searchParams: any) => {
    try {
      setLoading(true);
      console.log('开始搜索用户，参数:', searchParams);
      
      const response = await UserApiService.getUsers(searchParams);
      console.log('搜索用户响应:', response);
      
      if (response.success) {
        setUsers(response.data || []);
        console.log('搜索完成，用户数量:', response.data?.length || 0);
      } else {
        message.error(response.error || '搜索用户失败');
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      message.error('搜索用户失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadUsers();
  };

  // 添加用户
  const handleAddUser = () => {
    setIsEditMode(false);
    setEditingUser(null);
    setModalVisible(true);
  };

  // 编辑用户
  const handleEditUser = (user: any) => {
    setIsEditMode(true);
    setEditingUser(user);
    setModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = async (user: any) => {
    console.log('删除用户被调用:', user);
    
    // 显示确认对话框
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          console.log('开始删除用户:', user.id);
          const response = await UserApiService.deleteUser(user.id);
          console.log('删除用户响应:', response);
          
          if (response.success) {
            message.success('用户删除成功');
            console.log('删除成功，准备重新加载用户列表');
            await loadUsers(); // 重新加载列表
            console.log('用户列表重新加载完成');
          } else {
            message.error(response.error || '删除用户失败');
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除用户失败');
        }
      },
    });
  };

  // 处理表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      // 映射表单字段名到API字段名
      const mappedValues = {
        username: values.form_username,
        phone: values.form_phone,
        password: values.form_password,
        status: values.form_status,
      };

      let response;
      if (isEditMode && editingUser) {
        // 更新用户 - 如果没有输入密码，则不更新密码字段
        const updateData = { ...mappedValues };
        if (!updateData.password) {
          delete updateData.password;
        }
        response = await UserApiService.updateUser(editingUser.id, updateData);
        if (response.success) {
          message.success('用户更新成功');
        } else {
          message.error(response.error || '更新用户失败');
          return false;
        }
      } else {
        // 创建用户
        response = await UserApiService.createUser(mappedValues);
        if (response.success) {
          message.success('用户创建成功');
        } else {
          message.error(response.error || '创建用户失败');
          return false;
        }
      }

      setModalVisible(false);
      console.log('表单提交成功，准备重新加载用户列表');
      
      // 如果有搜索条件，需要清除搜索条件并重新加载所有数据
      if (Object.keys(searchValues).some(key => searchValues[key] && searchValues[key] !== '')) {
        console.log('检测到搜索条件，清除搜索条件');
        setSearchValues({});
        await loadUsers(); // 重新加载所有用户
      } else {
        await loadUsers(); // 重新加载用户列表
      }
      
      console.log('用户列表重新加载完成');
      return true;
    } catch (error) {
      console.error('保存用户失败:', error);
      message.error('保存用户失败');
      return false;
    }
  };

  // 取消表单
  const handleFormCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    setIsEditMode(false);
  };

  return {
    searchValues,
    modalVisible,
    editingUser,
    isEditMode,
    users,
    loading,
    handleSearch,
    handleRefresh,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleFormSubmit,
    handleFormCancel,
  };
};

export default useUserManagement;

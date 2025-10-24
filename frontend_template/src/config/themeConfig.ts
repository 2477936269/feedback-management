// 新建文件: /src/config/theme.ts
import { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    // 自定义主色调
    colorPrimary: '#1890ff',
    // 自定义边框颜色
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    // 自定义背景色
    colorBgContainer: '#ffffff',
  },
  components: {
    Menu: {
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#1890ff',
      itemMarginInline: 10,
      itemPaddingInline: 16,
      borderRadius: 2,
      itemBorderRadius: 2,
      subMenuItemBorderRadius: 2,
      itemHeight: 32,
    },
    // 可以添加其他组件配置
  },
  // 可以添加更多主题配置
};

export default themeConfig;
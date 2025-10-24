import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { App as AntApp } from 'antd'; // 导入Ant Design的App组件

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AntApp>
      <App />
    </AntApp>
  </React.StrictMode>
);
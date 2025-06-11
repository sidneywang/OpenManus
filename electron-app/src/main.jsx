import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import { Layout, Typography, Button, Space } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import ThoughtFlow from './components/ThoughtFlow.jsx';
import ConfigDialog from './components/ConfigDialog.jsx';
import PromptInput from './components/PromptInput.jsx';
import useStore from './store/useStore';
import { openmanusApi } from './api/openmanusApi';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const {
    isConnected,
    clearThoughts,
    config,
    updateConfig,
    isConfigDialogOpen,
    openConfigDialog,
    closeConfigDialog
  } = useStore();

  React.useEffect(() => {
    // 初始化连接
    openmanusApi.initialize();
    return () => openmanusApi.disconnect();
  }, []);

  const handleRefresh = async () => {
    try {
      clearThoughts();
      const thoughts = await openmanusApi.getThoughts();
      thoughts.forEach(thought => useStore.getState().addThought(thought));
    } catch (error) {
      console.error('刷新失败:', error);
    }
  };

  const handleConfigSave = (newConfig) => {
    updateConfig(newConfig);
    // 重新连接
    openmanusApi.disconnect();
    openmanusApi.initialize();
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Title level={4} style={{ margin: 0 }}>OpenManus 思考过程可视化</Title>
          <Space>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={openConfigDialog}
            />
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            />
          </Space>
        </Header>
        <Content style={{ padding: '24px' }}>
          <div style={{
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text type={isConnected ? 'success' : 'danger'}>
                状态: {isConnected ? '已连接' : '未连接'}
              </Typography.Text>
              <PromptInput />
            </Space>
          </div>
          <ThoughtFlow />
        </Content>
        <ConfigDialog
          open={isConfigDialogOpen}
          onClose={closeConfigDialog}
          onSave={handleConfigSave}
          initialConfig={config}
        />
      </Layout>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

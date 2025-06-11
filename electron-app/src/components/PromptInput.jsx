import React, { useState } from 'react';
import { Input, Button, Space, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { ipcRenderer } = window.require('electron');

function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!prompt.trim()) {
      message.warning('请输入 prompt');
      return;
    }

    setLoading(true);
    try {
      const result = await ipcRenderer.invoke('run-python-flow', prompt);
      message.success('执行成功');
      console.log('执行结果:', result);
    } catch (error) {
      message.error(`执行失败: ${error.message}`);
      console.error('执行错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        placeholder="请输入 prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onPressEnter={handleExecute}
      />
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={handleExecute}
        loading={loading}
      >
        执行
      </Button>
    </Space.Compact>
  );
}

export default PromptInput;

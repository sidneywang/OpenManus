import React, { useState, useEffect } from 'react';
import { Input, Button, Space, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import useStore from '../store/useStore';

const { ipcRenderer } = window.require('electron');

function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { addLog, clearLogs } = useStore();

  useEffect(() => {
    console.log('PromptInput 组件挂载');

    // 监听 Python 日志事件
    const handlePythonLog = (event, log) => {
      console.log('收到 Python 日志:', log);
      addLog(log.message, log.type);
    };

    ipcRenderer.on('python-log', handlePythonLog);
    console.log('已注册 python-log 事件监听器');

    return () => {
      console.log('PromptInput 组件卸载');
      ipcRenderer.removeListener('python-log', handlePythonLog);
    };
  }, [addLog]);

  const handleExecute = async () => {
    if (!prompt.trim()) {
      message.warning('请输入 prompt');
      return;
    }

    console.log('开始执行命令:', prompt);
    setLoading(true);
    clearLogs();
    addLog(`开始执行: ${prompt}`);

    try {
      const result = await ipcRenderer.invoke('run-python-flow', prompt);
      console.log('执行结果:', result);
    } catch (error) {
      console.error('执行错误:', error);
      message.error(`执行失败: ${error.message}`);
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

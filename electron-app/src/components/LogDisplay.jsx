import React, { useRef, useEffect } from 'react';
import { Card, Typography } from 'antd';
import useStore from '../store/useStore';

const { Text } = Typography;

const LogDisplay = () => {
  const { logs } = useStore();
  const logContainerRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card title="运行日志" style={{ marginBottom: '24px' }}>
      <div
        ref={logContainerRef}
        style={{
          height: '200px',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5',
          padding: '12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.5'
        }}
      >
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            <Text type={log.type === 'error' ? 'danger' : log.type === 'success' ? 'success' : 'secondary'}>
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LogDisplay;

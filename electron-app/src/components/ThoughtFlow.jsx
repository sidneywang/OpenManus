import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Typography, Alert, Button, Space } from 'antd';
import useStore from '../store/useStore';
import { openmanusApi } from '../api/openmanusApi';
import ThoughtFilter from './ThoughtFilter.jsx';
import ThoughtDetail from './ThoughtDetail.jsx';
import './ThoughtFlow.css';

const { Title } = Typography;

const ThoughtFlow = () => {
  const {
    thoughts,
    addThought,
    clearThoughts,
    setConnected,
    filters,
    updateFilters,
    getFilteredThoughts,
    isDetailDialogOpen,
    selectedThought,
    openDetailDialog,
    closeDetailDialog
  } = useStore();

  useEffect(() => {
    // 订阅思考过程更新
    const unsubscribe = openmanusApi.subscribeToThoughts((newThoughts) => {
      clearThoughts();
      newThoughts.forEach(thought => addThought(thought));
      setConnected(true);
    });

    return () => {
      unsubscribe();
      setConnected(false);
    };
  }, []);

  // 将思考过程转换为流程图节点
  const nodes = getFilteredThoughts().map((thought, index) => ({
    id: thought.id,
    data: {
      label: thought.content,
      onClick: () => openDetailDialog(thought)
    },
    position: { x: index * 250, y: 100 },
    style: {
      background: thought.status === 'completed' ? '#f6ffed' : '#e6f7ff',
      border: '2px solid',
      borderColor: thought.status === 'completed' ? '#52c41a' : '#1890ff',
      borderRadius: 8,
      padding: 16,
      width: 200,
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }
  }));

  // 创建节点之间的连接
  const edges = getFilteredThoughts().slice(1).map((thought, index) => ({
    id: `e${index}`,
    source: getFilteredThoughts()[index].id,
    target: thought.id,
    animated: thought.status === 'in_progress',
    style: {
      stroke: thought.status === 'in_progress' ? '#1890ff' : '#666',
      strokeWidth: 2
    }
  }));

  const handleRetry = async () => {
    try {
      clearThoughts();
      const thoughts = await openmanusApi.getThoughts();
      thoughts.forEach(thought => addThought(thought));
      setConnected(true);
    } catch (error) {
      console.error('重试失败:', error);
    }
  };

  return (
    <Card>
      <Title level={5} style={{ color: '#1890ff', marginBottom: 24 }}>
        思考过程可视化
      </Title>

      <ThoughtFilter
        filters={filters}
        onFilterChange={updateFilters}
      />

      {thoughts.length === 0 ? (
        <div className="thought-flow-empty">
          <Alert
            type="warning"
            message="后端服务未运行或连接失败"
            description={
              <ul>
                <li>Python 后端服务已启动</li>
                <li>后端服务运行在 http://localhost:8000</li>
                <li>网络连接正常</li>
              </ul>
            }
            style={{ width: '100%', maxWidth: 600, marginBottom: 16 }}
          />
          <Button type="primary" onClick={handleRetry}>
            重试连接
          </Button>
        </div>
      ) : (
        <div className="thought-flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodeClick={(_, node) => {
              const thought = thoughts.find(t => t.id === node.id);
              if (thought) {
                openDetailDialog(thought);
              }
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const thought = thoughts.find(t => t.id === node.id);
                return thought?.status === 'completed' ? '#52c41a' : '#1890ff';
              }}
            />
          </ReactFlow>
        </div>
      )}

      <ThoughtDetail
        thought={selectedThought}
        open={isDetailDialogOpen}
        onClose={closeDetailDialog}
      />
    </Card>
  );
};

export default ThoughtFlow;

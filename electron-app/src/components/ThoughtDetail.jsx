import React from 'react';
import { Modal, Typography, Space, Tag, Descriptions } from 'antd';

const { Title, Text } = Typography;

const ThoughtDetail = ({ thought, open, onClose }) => {
  if (!thought) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'thought':
        return 'blue';
      case 'action':
        return 'green';
      case 'observation':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title="思考详情"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={5}>内容</Title>
          <Text>{thought.content}</Text>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(thought.status)}>
              {thought.status === 'completed' ? '已完成' :
               thought.status === 'in_progress' ? '进行中' : '待处理'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag color={getTypeColor(thought.type)}>
              {thought.type === 'thought' ? '思考' :
               thought.type === 'action' ? '行动' : '观察'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(thought.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(thought.updated_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {thought.metadata && (
          <div>
            <Title level={5}>元数据</Title>
            <pre style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              overflow: 'auto'
            }}>
              {JSON.stringify(thought.metadata, null, 2)}
            </pre>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default ThoughtDetail;

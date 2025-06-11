import React from 'react';
import { Card, Space, Select, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const ThoughtFilter = ({ filters, onFilterChange }) => {
  const handleStatusChange = (value) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleTypeChange = (value) => {
    onFilterChange({ ...filters, type: value });
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Space align="center" size="large">
        <Space>
          <Text>状态：</Text>
          <Select
            value={filters.status}
            onChange={handleStatusChange}
            style={{ width: 120 }}
          >
            <Option value="all">全部</Option>
            <Option value="completed">已完成</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="pending">待处理</Option>
          </Select>
        </Space>
        <Space>
          <Text>类型：</Text>
          <Select
            value={filters.type}
            onChange={handleTypeChange}
            style={{ width: 120 }}
          >
            <Option value="all">全部</Option>
            <Option value="thought">思考</Option>
            <Option value="action">行动</Option>
            <Option value="observation">观察</Option>
          </Select>
        </Space>
      </Space>
    </Card>
  );
};

export default ThoughtFilter;

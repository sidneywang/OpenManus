import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';

const ConfigDialog = ({ open, onClose, onSave, initialConfig }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open && initialConfig) {
      form.setFieldsValue(initialConfig);
    }
  }, [open, initialConfig, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="配置"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialConfig}
      >
        <Form.Item
          name="apiUrl"
          label="API 地址"
          rules={[{ required: true, message: '请输入 API 地址' }]}
        >
          <Input placeholder="例如：http://localhost:8000" />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label="API 密钥"
          rules={[{ required: true, message: '请输入 API 密钥' }]}
        >
          <Input.Password placeholder="请输入 API 密钥" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigDialog;

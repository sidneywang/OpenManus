import axios from 'axios';
import { websocketService } from './websocketService';

const API_BASE_URL = 'http://localhost:8001'; // 更新端口为 8001

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNREFUSED') {
      console.warn('后端服务未启动，请确保后端服务正在运行');
    }
    return Promise.reject(error);
  }
);

export const openmanusApi = {
  // 初始化连接
  initialize: () => {
    try {
      websocketService.connect();
    } catch (error) {
      console.warn('WebSocket 连接失败:', error);
    }
  },

  // 获取思考过程
  getThoughts: async () => {
    try {
      const response = await api.get('/thoughts');
      return response.data;
    } catch (error) {
      console.error('获取思考过程失败:', error);
      return []; // 返回空数组而不是抛出错误
    }
  },

  // 订阅思考过程更新
  subscribeToThoughts: (callback) => {
    try {
      return websocketService.subscribe((message) => {
        if (message.type === 'message' && message.data.type === 'thought') {
          callback(message.data.thoughts);
        }
      });
    } catch (error) {
      console.warn('订阅失败:', error);
      return () => {}; // 返回空函数作为取消订阅的回调
    }
  },

  // 发送命令到 OpenManus
  sendCommand: async (command) => {
    try {
      websocketService.send({
        type: 'command',
        command
      });
    } catch (error) {
      console.error('发送命令失败:', error);
      // 不抛出错误，让 UI 继续运行
    }
  },

  // 断开连接
  disconnect: () => {
    try {
      websocketService.disconnect();
    } catch (error) {
      console.warn('断开连接失败:', error);
    }
  }
};

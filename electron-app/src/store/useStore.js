import create from 'zustand';
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// 示例数据
const sampleThoughts = [
  {
    id: '1',
    content: '分析用户需求',
    status: 'completed',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() - 3500000).toISOString(),
    metadata: {
      type: 'analysis',
      priority: 'high'
    }
  },
  {
    id: '2',
    content: '设计系统架构',
    status: 'in_progress',
    startTime: new Date(Date.now() - 3400000).toISOString(),
    metadata: {
      type: 'design',
      priority: 'high'
    }
  },
  {
    id: '3',
    content: '实现核心功能',
    status: 'pending',
    startTime: new Date(Date.now() - 3300000).toISOString(),
    metadata: {
      type: 'implementation',
      priority: 'medium'
    }
  }
];

const useStore = create((set, get) => ({
  // 思考过程状态
  thoughts: sampleThoughts,
  currentThought: sampleThoughts[0],

  // 添加新的思考
  addThought: (thought) => set((state) => ({
    thoughts: [...state.thoughts, thought],
    currentThought: thought
  })),

  // 更新当前思考
  updateCurrentThought: (thought) => set((state) => ({
    currentThought: thought,
    thoughts: state.thoughts.map((t) =>
      t.id === thought.id ? thought : t
    )
  })),

  // 清除所有思考
  clearThoughts: () => set({ thoughts: [], currentThought: null }),

  // 连接状态
  isConnected: false,
  setConnected: (status) => set({ isConnected: status }),

  // 配置状态
  config: {
    wsUrl: 'ws://localhost:8000/ws',
    apiUrl: 'http://localhost:8000',
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000
  },
  updateConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),

  // 配置对话框状态
  isConfigDialogOpen: false,
  openConfigDialog: () => set({ isConfigDialogOpen: true }),
  closeConfigDialog: () => set({ isConfigDialogOpen: false }),

  // 过滤状态
  filters: {
    search: '',
    status: 'all',
    timeRange: 'all'
  },
  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // 获取过滤后的思考列表
  getFilteredThoughts: () => {
    const { thoughts, filters } = get();
    return thoughts.filter(thought => {
      // 搜索过滤
      if (filters.search && !thought.content.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // 状态过滤
      if (filters.status !== 'all' && thought.status !== filters.status) {
        return false;
      }

      // 时间范围过滤
      if (filters.timeRange !== 'all') {
        const now = new Date();
        let start, end;

        switch (filters.timeRange) {
          case 'today':
            start = startOfDay(now);
            end = endOfDay(now);
            break;
          case 'week':
            start = startOfWeek(now);
            end = endOfWeek(now);
            break;
          case 'month':
            start = startOfMonth(now);
            end = endOfMonth(now);
            break;
          default:
            return true;
        }

        if (!isWithinInterval(new Date(thought.startTime), { start, end })) {
          return false;
        }
      }

      return true;
    });
  },

  // 详情对话框状态
  isDetailDialogOpen: false,
  selectedThought: null,
  openDetailDialog: (thought) => set({
    isDetailDialogOpen: true,
    selectedThought: thought
  }),
  closeDetailDialog: () => set({
    isDetailDialogOpen: false,
    selectedThought: null
  })
}));

export default useStore;

export const theme = {
  colors: {
    // 主色调 - 优化后的现代青绿色系
    primary: '#34D399',        // 优化后的主色，更柔和
    primaryLight: '#6EE7B7',   // 浅色变体
    primaryDark: '#059669',    // 深色变体
    
    // 辅助色彩 - 增加温暖感和亲和力
    secondary: '#FDBA74',      // 温暖的橙色辅助色
    secondaryBlue: '#93C5FD',  // 柔和的蓝色辅助色
    accent: '#F472B6',         // 现代粉色，用于重要提示
    
    // 背景色系 - 优化的中性色体系
    background: '#F8FAFC',     // 页面底色
    surface: '#FFFFFF',        // 卡片/页面背景
    surfaceElevated: '#F1F5F9', // 提升的表面
    
    // 文字颜色层级 - 更清晰的层次
    text: '#0F172A',           // 标题文字
    textPrimary: '#334155',    // 正文文字
    textSecondary: '#94A3B8',  // 辅助/提示文字
    textLight: '#CBD5E1',      // 淡色文字
    textMuted: '#E2E8F0',      // 静音文字
    
    // 边框和分割
    border: '#E2E8F0',         // 分割线/边框
    borderLight: '#F1F5F9',    // 浅色边框
    
    // 功能色 - 更鲜明的状态色彩
    error: '#F87171',          // 危险/警示红色
    success: '#4ADE80',        // 成功/健康绿色
    warning: '#FBBF24',        // 警告/中等橙色
    info: '#60A5FA',           // 信息蓝色
    
    // 特殊用途颜色
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(52, 211, 153, 0.08)', // 带有主色调的阴影
    
    // 导航栏
    tabBarBackground: '#FFFFFF',
    tabBarActiveTint: '#34D399',
    tabBarInactiveTint: '#94A3B8',
    
    // 渐变色 - 更现代的渐变组合
    gradientPrimary: ['#34D399', '#6EE7B7'],
    gradientSecondary: ['#FDBA74', '#FCD34D'],
    gradientAccent: ['#F472B6', '#EC4899'],
    
    // 健康主题色彩
    healthBlue: '#4FC3F7',     // 脑电波蓝色
    healthGreen: '#81C784',    // 心率绿色  
    healthPurple: '#BA68C8',   // 睡眠紫色
    healthOrange: '#FFB74D',   // 活力橙色
  },
  // V2 精修: 基于 8px 网格的严格间距系统 (1 unit = 8px)
  spacing: {
    unit: 8,           // 基础单位
    xs: 4,            // 0.5 units - 微调间距
    sm: 8,            // 1 unit - 最小间距
    md: 12,           // 1.5 units - 列表项间距
    lg: 16,           // 2 units - 卡片内边距 (标准)
    xl: 20,           // 2.5 units - 中等外边距
    xxl: 24,          // 3 units - 区块间大间距 (标准)
    xxxl: 32,         // 4 units - 页面级间距
    huge: 48,         // 6 units - 超大间距
    
    // V2 专用语义化间距
    cardPadding: 16,      // 卡片统一内边距
    cardMargin: 12,       // 卡片间垂直间距
    sectionMargin: 24,    // 区块间距
    listItemSpacing: 12,  // 列表项间距
  },
  borderRadius: {
    xs: 6,         // 小元素圆角
    sm: 8,         // 按钮、输入框
    md: 12,        // 标准卡片圆角
    lg: 16,        // 大卡片圆角
    xl: 20,        // 特大卡片圆角
    xxl: 24,       // 超大圆角
    round: 28,     // 圆形按钮
    pill: 50,      // 胶囊形状
  },
  fontSize: {
    xs: 12,        // 辅助文字/标签
    sm: 14,        // 正文/列表项 (小)
    md: 16,        // 正文/列表项 (标准)
    lg: 18,        // 卡片标题/重要内容
    xl: 20,        // 大标题 (小)
    xxl: 24,       // 大标题 (大)
    xxxl: 28,      // 特大标题
    display: 32,   // 展示标题
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    // 更细腻的阴影效果 - 类似CSS box-shadow
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    // 标准卡片阴影 - 相当于 box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    // 特殊阴影效果 - 更新为新主色
    colored: {
      shadowColor: '#34D399',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    glow: {
      shadowColor: '#34D399',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  // 动画配置
  animations: {
    quick: 150,
    normal: 250,
    slow: 350,
    verySlow: 500,
  },
  // 透明度层级
  opacity: {
    disabled: 0.4,
    secondary: 0.6,
    primary: 0.8,
    full: 1.0,
  },
  
  // V2 精修: 标准化组件样式规范
  components: {
    // 统一的 Tag 标签样式
    tag: {
      lifestyle: {
        background: '#E6F7F5',
        text: '#00A78E',
      },
      schedule: {
        background: '#FFF4E6',
        text: '#D97706',
      },
      sleep: {
        background: '#F3E8FF',
        text: '#9333EA',
      },
      vip: {
        background: '#FFFBEA',
        text: '#F59E0B',
      },
      paid: {
        background: '#FEF2F2',
        text: '#EF4444',
      },
      psychology: {
        background: '#EFF6FF',
        text: '#2563EB',
      },
      cognitive: {
        background: '#F0FDF4',
        text: '#16A34A',
      },
      emotion: {
        background: '#FEF7FF',
        text: '#C026D3',
      },
      brainwave: {
        background: '#F0F9FF',
        text: '#0284C7',
      },
      sleep_audio: {
        background: '#F8FAFC',
        text: '#64748B',
      },
    },
    
    // 统一的图标容器样式  
    iconContainer: {
      size: 44,
      borderRadius: 22,
      backgroundColor: '#F1F5F9',
      shadowStyle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }
    }
  },
};

export type Theme = typeof theme;
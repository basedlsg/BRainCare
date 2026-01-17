# EEG 蓝牙集成实现摘要

## 📋 概述

成功将 BLE 蓝牙功能集成到评估页面（AssessmentScreen），支持连接 OpenBCI 设备并实时显示 EEG 脑电波数据。

## ✅ 已实现功能

### 1. 核心组件

#### 📦 数据解析服务 (`src/services/EEGDataParser.ts`)
- ✅ 解析 OpenBCI 33字节数据包
- ✅ 支持 8通道 和 2通道设备自动检测
- ✅ 24位补码转换为微伏（μV）
- ✅ 解析加速度计和陀螺仪数据
- ✅ 温度数据提取（2通道设备）

#### 📱 UI 组件

**BluetoothStatusBar** (`src/components/BluetoothStatusBar.tsx`)
- ✅ 显示连接状态（已连接/未连接/连接中）
- ✅ 显示设备名称和类型
- ✅ 显示信号强度 (RSSI)
- ✅ 点击打开连接抽屉

**BleConnectionDrawer** (`src/components/BleConnectionDrawer.tsx`)
- ✅ 底部滑出式抽屉设计
- ✅ BLE 设备扫描功能
- ✅ 设备列表显示（名称、MAC地址、信号强度）
- ✅ 自动权限请求（Android）
- ✅ 蓝牙状态检测
- ✅ 连接过程加载指示

**EEGDataDisplay** (`src/components/EEGDataDisplay.tsx`)
- ✅ 横向滚动的数值显示
- ✅ 各通道实时数值（μV）
- ✅ 温度显示（2通道设备）
- ✅ 加速度计三轴数据
- ✅ 陀螺仪三轴数据
- ✅ 数据包统计信息

**EEGWaveformChart** (`src/components/EEGWaveformChart.tsx`)
- ✅ 实时波形图绘制
- ✅ 多通道波形同时显示
- ✅ 自动缩放 Y 轴
- ✅ 彩色图例标识
- ✅ 数据缓冲管理（最多5秒数据）
- ✅ 支持 8通道和2通道设备

#### 🎣 React Hook

**useEEGData** (`src/hooks/useEEGData.ts`)
- ✅ BLE 连接管理
- ✅ 数据订阅和解析
- ✅ 波形数据缓冲
- ✅ 统计信息计算
- ✅ 帧率监测（实时显示 Hz）
- ✅ 自动清理资源

#### 🔤 TypeScript 类型 (`src/types/eeg.ts`)
- ✅ 完整的 EEG 数据类型定义
- ✅ 设备类型枚举
- ✅ 加速度计和陀螺仪类型
- ✅ 数据包规格常量

### 2. 集成到评估页面

**AssessmentScreen** 更新内容：
- ✅ 顶部蓝牙状态栏
- ✅ 实时波形图区域（连接后显示）
- ✅ 实时数值显示区域（连接后显示）
- ✅ 保留原有功能（心理量表、健康评分、ECG数据等）
- ✅ 底部抽屉用于连接设备

## 📊 支持的数据格式

### 8通道 OpenBCI 数据包
```
A0 [帧计数] [CH1-3字节] [CH2-3字节] ... [CH8-3字节] [加速度6字节] [陀螺仪6字节] C0
总长度: 33字节
```

### 2通道设备数据包
```
A0 [帧计数] [FP1-3字节] [FP2-3字节] [温度-3字节] [保留6字节] [重力计6字节] [陀螺仪6字节] C0
总长度: 33字节
```

## 🔧 数据处理

### 数据转换公式
```typescript
// 24位有符号整数转换
if ((value & 0x800000) !== 0) {
  value |= 0xFF000000; // 符号扩展
}

// 转换为微伏
microvolts = (value * 4.5) / 8388608.0 * 1000000 / 24.0;
```

### 采样率
- **250 Hz** - 标准采样频率
- **缓冲**: 最多保持 1250 个数据点（5秒）

## 🎨 UI/UX 特性

1. **状态指示**
   - 绿色：已连接
   - 橙色：连接中
   - 灰色：未连接

2. **响应式设计**
   - 自适应屏幕尺寸
   - 横向滚动数值显示
   - 紧凑的卡片布局

3. **实时更新**
   - 波形图动画更新
   - 数值实时刷新
   - 帧率显示

4. **用户友好**
   - 一键扫描设备
   - 点击连接设备
   - 信号强度提示
   - 设备类型自动识别

## 📦 新增依赖

```json
{
  "react-native-gifted-charts": "^1.x.x",
  "react-native-svg": "^15.x.x"
}
```

## 🔌 BLE 配置

**NV-BrainRF/BG22A1 模块 UUIDs:**
```typescript
SERVICE_UUID: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'
RX_UUID:      '6E400002-B5A3-F393-E0A9-E50E24DCCA9E' // Write (发送命令)
TX_UUID:      '6E400003-B5A3-F393-E0A9-E50E24DCCA9E' // Notify (接收数据)
```

**OpenBCI 命令:**
- `b` - 开始数据传输（连接后自动发送）
- `sv` - 停止数据传输（断开前自动发送）

## 🚀 使用方法

### 连接设备
1. 打开评估页面
2. 点击顶部蓝牙状态栏
3. 在抽屉中点击"开始扫描"
4. **NV-BrainRF 设备会自动高亮显示**（绿色边框和"推荐"标签）
5. 点击设备连接
6. 连接成功后**自动发送 `b` 命令启动数据传输**
7. 开始实时显示波形和数据

### 自动化功能
- ✅ **自动命令发送**：连接时自动发送 `b` 命令，断开时自动发送 `sv` 命令
- ✅ **设备识别**：自动识别并高亮显示 NV-BrainRF 设备
- ✅ **设备类型检测**：自动识别 8通道或2通道设备
- ✅ **数据自动解析**：无需手动配置，自动解析所有数据

### 查看数据
- **波形图**: 实时显示脑电波形
- **数值显示**: 各通道当前数值
- **频段分析**: Alpha/Beta/Gamma/Delta/Theta（占位）

## 📁 文件结构

```
src/
├── types/
│   └── eeg.ts                      # EEG 类型定义
├── services/
│   └── EEGDataParser.ts            # 数据解析服务
├── components/
│   ├── BluetoothStatusBar.tsx      # 蓝牙状态栏
│   ├── BleConnectionDrawer.tsx     # 连接抽屉
│   ├── EEGDataDisplay.tsx          # 数值显示
│   └── EEGWaveformChart.tsx        # 波形图
├── hooks/
│   └── useEEGData.ts               # EEG 数据 Hook
└── screens/
    └── AssessmentScreen.tsx        # 评估页面（已集成）
```

## ⚠️ 注意事项

### Android 权限
需要以下权限（自动请求）：
- `BLUETOOTH_SCAN` (Android 12+)
- `BLUETOOTH_CONNECT` (Android 12+)
- `ACCESS_FINE_LOCATION` (所有版本)

### 设备要求
- 蓝牙必须开启
- 位置服务（GPS）必须开启（Android）
- 设备需支持 BLE 4.0+

### 性能优化
- 数据缓冲限制在5秒
- 使用 `useMemo` 和 `useCallback` 避免不必要的渲染
- 自动清理订阅和定时器

## 🔮 未来扩展

### 可选功能（未实现）
- [ ] 实时 FFT 频谱分析
- [ ] 数据录制和导出
- [ ] 滤波器设置（DC截止、陷波、带通）
- [ ] 多设备同时连接
- [ ] 数据质量检测
- [ ] 电极接触检测

## 🐛 调试

### 日志
所有关键操作都有控制台日志：
- `🔍` 扫描相关
- `🔗` 连接相关
- `📡` 数据接收
- `✅` 成功操作
- `❌` 错误信息

### 测试数据包
可以使用以下示例数据包测试解析器：
```typescript
const testPacket = [
  0xA0, 0x01, // 帧头+计数
  0x67, 0xD2, 0xC3, // CH1
  0xD0, 0x7F, 0xC8, // CH2
  // ... 其他通道
  0xC0 // 帧尾
];
```

## 📞 技术支持

如有问题，请检查：
1. Metro bundler 控制台日志
2. Android Logcat（`adb logcat *:E`）
3. 蓝牙和位置权限是否授予
4. 设备是否在范围内且未连接其他应用

---

**实现完成时间**: 2025年1月
**版本**: 1.0.0
**状态**: ✅ 完成并集成到评估页面

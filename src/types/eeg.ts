// EEG 数据类型定义

export enum DeviceType {
  OPENBCI_8CH = '8_CHANNEL',    // 8通道 OpenBCI 设备
  DUAL_2CH = '2_CHANNEL',        // 2通道设备 (FP1/FP2)
  UNKNOWN = 'UNKNOWN',
}

export interface AccelerometerData {
  x: number; // g
  y: number; // g
  z: number; // g
}

export interface GyroscopeData {
  x: number; // 陀螺仪原始值
  y: number;
  z: number;
}

export interface EEGChannelData {
  channelIndex: number;
  channelName: string; // 例如: "FP1", "FP2", "Channel 1"
  value: number;       // μV (微伏)
  raw: number;         // 原始24位整数值
}

export interface EEGPacket {
  frameHeader: number;      // 0xA0
  frameCounter: number;     // 帧计数 (0-255)
  channels: EEGChannelData[];
  temperature?: number;     // 温度 (仅2通道设备)
  accelerometer: AccelerometerData;
  gyroscope: GyroscopeData;
  frameFooter: number;      // 0xC0
  timestamp: number;        // 时间戳 (毫秒)
  isValid: boolean;         // 数据包是否有效
}

export interface ParsedEEGData {
  deviceType: DeviceType;
  packet: EEGPacket;
  sampleRate: number; // Hz
}

export interface EEGWaveformDataPoint {
  timestamp: number;  // 毫秒
  values: number[];   // 每个通道的值 (μV)
}

export interface EEGStatistics {
  totalPackets: number;
  validPackets: number;
  invalidPackets: number;
  currentFrameRate: number; // Hz
  lastPacketTime: number | null;
  deviceType: DeviceType;
}

// 8通道 OpenBCI 通道名称
export const OPENBCI_8CH_NAMES = [
  'Channel 1',
  'Channel 2',
  'Channel 3',
  'Channel 4',
  'Channel 5',
  'Channel 6',
  'Channel 7',
  'Channel 8',
];

// 2通道设备通道名称
export const DUAL_2CH_NAMES = [
  'FP1',
  'FP2',
  'Temperature',
  'Reserved 1',
  'Reserved 2',
  'Gravity X',
  'Gravity Y',
  'Gravity Z',
];

// 数据包规格
export const PACKET_SPECS = {
  LENGTH: 33,           // 数据包总长度
  HEADER: 0xA0,        // 帧头
  FOOTER: 0xC0,        // 帧尾
  CHANNEL_COUNT: 8,     // 通道数
  BYTES_PER_CHANNEL: 3, // 每通道字节数
  SAMPLE_RATE: 250,     // 采样率 Hz
  GAIN: 24,            // OpenBCI 增益
  VREF: 4.5,           // 参考电压 (V)
  LSB: 8388608,        // 24位最大值 (2^23)
  // NV-BrainRF 2通道设备的校正因子 (实测需要除以1000)
  DUAL_2CH_SCALE_FACTOR: 0.001,
};

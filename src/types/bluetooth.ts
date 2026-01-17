/**
 * 蓝牙设备类型定义
 */
export interface BluetoothDevice {
  id: string; // MAC 地址
  name: string | null; // 设备名称
  rssi: number; // 信号强度
  advertising?: any; // 广播数据
}

/**
 * 连接状态枚举
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
}

/**
 * 数据日志条目
 */
export interface DataLogEntry {
  id: string;
  timestamp: Date;
  data: number[]; // 字节数组
  hexString: string; // 十六进制字符串
  isValid: boolean; // 是否为有效的 33 字节数据包
}

/**
 * 数据统计信息
 */
export interface DataStatistics {
  totalPackets: number; // 总数据包数
  validPackets: number; // 有效数据包数（33字节）
  invalidPackets: number; // 无效数据包数
  bytesReceived: number; // 总接收字节数
  startTime: Date | null; // 开始时间
  lastPacketTime: Date | null; // 最后一个数据包时间
}

/**
 * BG22A1 蓝牙模块的 UUID 常量
 */
export const BLE_UUIDS = {
  // UART Service
  SERVICE: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
  // RX Characteristic (Write) - 向设备发送数据
  RX_CHARACTERISTIC: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E',
  // TX Characteristic (Notify) - 从设备接收数据
  TX_CHARACTERISTIC: '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
  // AT Command Characteristic
  AT_CHARACTERISTIC: '6E400004-B5A3-F393-E0A9-E50E24DCCA9E',
} as const;

/**
 * 蓝牙错误类型
 */
export enum BluetoothErrorType {
  PERMISSION_DENIED = 'permission_denied',
  BLUETOOTH_OFF = 'bluetooth_off',
  SCAN_FAILED = 'scan_failed',
  CONNECT_FAILED = 'connect_failed',
  DISCONNECT_FAILED = 'disconnect_failed',
  WRITE_FAILED = 'write_failed',
  SUBSCRIBE_FAILED = 'subscribe_failed',
  UNKNOWN = 'unknown',
}

/**
 * 蓝牙错误信息
 */
export interface BluetoothError {
  type: BluetoothErrorType;
  message: string;
  originalError?: any;
}

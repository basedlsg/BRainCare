/**
 * EEG 数据解析服务
 *
 * 支持两种设备类型:
 * 1. 8通道 OpenBCI: 全功能脑电波设备
 * 2. 2通道设备: FP1/FP2 简化设备
 */

import {
  DeviceType,
  EEGPacket,
  EEGChannelData,
  ParsedEEGData,
  AccelerometerData,
  GyroscopeData,
  PACKET_SPECS,
  OPENBCI_8CH_NAMES,
  DUAL_2CH_NAMES,
} from '../types/eeg';

export class EEGDataParser {
  private lastDeviceType: DeviceType = DeviceType.UNKNOWN;

  /**
   * 解析原始数据包
   * @param data 原始字节数组或 base64 字符串
   * @returns 解析后的 EEG 数据，如果数据包无效则返回 null
   */
  parsePacket(data: number[] | string): ParsedEEGData | null {
    let packet: number[];

    // 处理输入数据格式
    if (typeof data === 'string') {
      // 如果是 base64 字符串，先解码
      packet = this.base64ToBytes(data);
    } else {
      packet = data;
    }

    // 验证数据包长度
    if (packet.length !== PACKET_SPECS.LENGTH) {
      console.warn(
        `[EEG Parser] ❌ Invalid packet length: ${packet.length}, expected ${PACKET_SPECS.LENGTH}`,
      );
      console.warn(
        `[EEG Parser] First 10 bytes: ${packet.slice(0, 10).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`,
      );
      return null;
    }

    // 验证帧头和帧尾
    if (
      packet[0] !== PACKET_SPECS.HEADER ||
      packet[32] !== PACKET_SPECS.FOOTER
    ) {
      console.warn(
        `[EEG Parser] ❌ Invalid frame header/footer: 0x${packet[0].toString(16)}/0x${packet[32].toString(16)}, expected 0xA0/0xC0`,
      );
      console.warn(
        `[EEG Parser] Packet preview: ${packet.slice(0, 5).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')} ... ${packet.slice(-5).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`,
      );
      return null;
    }

    const frameCounter = packet[1];
    const timestamp = Date.now();

    // 解析通道数据
    const channels = this.parseChannels(packet);

    // 检测设备类型
    const deviceType = this.detectDeviceType(channels);
    this.lastDeviceType = deviceType;

    // 实际数据中，陀螺仪在最后13个字节的前6个字节
    const gyroscope = this.parseGyroscope(packet);

    // 加速度计在最后7个字节的前6个字节（不包括帧尾）
    const accelerometer = this.parseAccelerometer(packet);

    // 提取温度数据 (仅2通道设备)
    // 温度值为开尔文，直接转换为摄氏度 (K - 273.15 = °C)
    const temperature = deviceType === DeviceType.DUAL_2CH && channels[2].raw !== undefined
      ? channels[2].raw - 273.15
      : undefined;

    const eegPacket: EEGPacket = {
      frameHeader: packet[0],
      frameCounter,
      channels,
      temperature,
      accelerometer,
      gyroscope,
      frameFooter: packet[32],
      timestamp,
      isValid: true,
    };

    return {
      deviceType,
      packet: eegPacket,
      sampleRate: PACKET_SPECS.SAMPLE_RATE,
      // Mock Data for Dashboard
      relaxation: Math.floor(Math.random() * 100),
      focus: Math.floor(Math.random() * 100),
      fatigue: Math.floor(Math.random() * 100),
    };
  }

  /**
   * 解析8个通道的数据
   * 每个通道占3个字节 (24位有符号整数)
   */
  private parseChannels(packet: number[]): EEGChannelData[] {
    const channels: EEGChannelData[] = [];

    for (let i = 0; i < PACKET_SPECS.CHANNEL_COUNT; i++) {
      const offset = 2 + i * PACKET_SPECS.BYTES_PER_CHANNEL;

      // 组合3个字节为24位整数
      let value = (packet[offset] << 16) | (packet[offset + 1] << 8) | packet[offset + 2];

      // 处理24位有符号整数 (补码)
      // 如果第24位(符号位)为1，则扩展为32位负数
      if ((value & 0x800000) !== 0) {
        value |= 0xFF000000; // 符号扩展
      }

      // 转换为微伏 (μV)
      // 公式: (value * VREF) / LSB / GAIN * 1000000
      let microvolts = (value * PACKET_SPECS.VREF) / PACKET_SPECS.LSB / PACKET_SPECS.GAIN * 1000000;

      // NV-BrainRF 2通道设备需要额外的缩放因子
      // (实测数据显示需要除以1000)
      if (this.lastDeviceType === DeviceType.DUAL_2CH && i < 2) {
        microvolts *= PACKET_SPECS.DUAL_2CH_SCALE_FACTOR;
      }

      channels.push({
        channelIndex: i,
        channelName: this.getChannelName(i, this.lastDeviceType),
        value: microvolts,
        raw: value,
      });
    }

    return channels;
  }

  /**
   * 检测设备类型
   * 通过分析通道数据特征来判断是8通道还是2通道设备
   */
  private detectDeviceType(channels: EEGChannelData[]): DeviceType {
    // 如果已经检测过，保持相同类型
    if (this.lastDeviceType !== DeviceType.UNKNOWN) {
      return this.lastDeviceType;
    }

    // 2通道设备特征: 通道3-4为空 (值接近0)
    const ch3Empty = Math.abs(channels[3].raw) < 100;
    const ch4Empty = Math.abs(channels[4].raw) < 100;

    if (ch3Empty && ch4Empty) {
      console.log('[EEG Parser] Detected 2-channel device');
      return DeviceType.DUAL_2CH;
    }

    console.log('[EEG Parser] Detected 8-channel OpenBCI device');
    return DeviceType.OPENBCI_8CH;
  }

  /**
   * 获取通道名称
   */
  private getChannelName(index: number, deviceType: DeviceType): string {
    if (deviceType === DeviceType.DUAL_2CH) {
      return DUAL_2CH_NAMES[index] || `Channel ${index + 1}`;
    }
    return OPENBCI_8CH_NAMES[index] || `Channel ${index + 1}`;
  }

  /**
   * 解析加速度计数据
   * 实际位置：数据包最后7个字节的前6个字节 (不包括帧尾)
   * 每个轴2个字节
   */
  private parseAccelerometer(packet: number[]): AccelerometerData {
    const offset = packet.length - 7; // 33 - 7 = 26

    const xRaw = (packet[offset] << 8) | packet[offset + 1];
    const yRaw = (packet[offset + 2] << 8) | packet[offset + 3];
    const zRaw = (packet[offset + 4] << 8) | packet[offset + 5];

    // 转换为有符号16位整数
    const xSigned = xRaw > 32767 ? xRaw - 65536 : xRaw;
    const ySigned = yRaw > 32767 ? yRaw - 65536 : yRaw;
    const zSigned = zRaw > 32767 ? zRaw - 65536 : zRaw;

    // 返回原始值，单位待定（可能是 mg 或其他）
    return {
      x: xSigned,
      y: ySigned,
      z: zSigned,
    };
  }

  /**
   * 解析陀螺仪数据
   * 实际位置：数据包最后13个字节的前6个字节
   * 每个轴2个字节 (大端模式)
   */
  private parseGyroscope(packet: number[]): GyroscopeData {
    const offset = packet.length - 13; // 33 - 13 = 20

    // 大端模式: 高字节在前
    const xRaw = (packet[offset] << 8) | packet[offset + 1];
    const yRaw = (packet[offset + 2] << 8) | packet[offset + 3];
    const zRaw = (packet[offset + 4] << 8) | packet[offset + 5];

    // 转换为有符号16位整数
    const xSigned = xRaw > 32767 ? xRaw - 65536 : xRaw;
    const ySigned = yRaw > 32767 ? yRaw - 65536 : yRaw;
    const zSigned = zRaw > 32767 ? zRaw - 65536 : zRaw;

    // 转换为 °/s (度每秒)
    // 陀螺仪灵敏度因子（需要根据实际设备调整）
    const sensitivity = 0.00875; // 假设为 ±250°/s 量程
    return {
      x: xSigned * sensitivity,
      y: ySigned * sensitivity,
      z: zSigned * sensitivity,
    };
  }

  /**
   * Base64 转字节数组
   */
  private base64ToBytes(base64: string): number[] {
    const binary = atob(base64);
    const bytes: number[] = [];
    for (let i = 0; i < binary.length; i++) {
      bytes.push(binary.charCodeAt(i));
    }
    return bytes;
  }

  /**
   * 获取最后检测的设备类型
   */
  getDeviceType(): DeviceType {
    return this.lastDeviceType;
  }

  /**
   * 重置设备类型检测
   */
  resetDeviceType(): void {
    this.lastDeviceType = DeviceType.UNKNOWN;
  }
}

// 导出单例实例
export const eegDataParser = new EEGDataParser();

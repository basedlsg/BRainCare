/**
 * EEG 数据缓冲区
 *
 * 处理 BLE 流式传输的数据分包问题
 * - 累积接收到的字节
 * - 查找完整的 33 字节数据包 (A0...C0)
 * - 提取并返回所有完整的数据包
 * - 保留不完整的数据到下次处理
 */

import { PACKET_SPECS } from '../types/eeg';

const MAX_BUFFER_SIZE = 10000; // 最大缓冲区大小 (防止内存溢出)

export class EEGDataBuffer {
  private buffer: number[] = [];
  private totalBytesReceived = 0;
  private packetsExtracted = 0;
  private invalidPackets = 0;

  /**
   * 添加新接收到的数据到缓冲区
   */
  appendData(data: number[]): void {
    this.buffer.push(...data);
    this.totalBytesReceived += data.length;

    console.log(
      `[Buffer] Received ${data.length} bytes, buffer size: ${this.buffer.length}`,
    );

    // 防止缓冲区过大
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      console.warn(
        `[Buffer] Buffer overflow! Clearing old data. Size: ${this.buffer.length}`,
      );
      // 保留最后 1000 字节
      this.buffer = this.buffer.slice(-1000);
    }
  }

  /**
   * 从缓冲区中提取所有完整的数据包
   * @returns 完整数据包数组，每个数据包是 33 字节的数组
   */
  extractPackets(): number[][] {
    const packets: number[][] = [];
    let searchIndex = 0;

    while (searchIndex < this.buffer.length) {
      // 1. 查找帧头 A0
      const headerIndex = this.buffer.indexOf(
        PACKET_SPECS.HEADER,
        searchIndex,
      );

      if (headerIndex === -1) {
        // 没有找到帧头，清空搜索位置之前的所有数据
        if (searchIndex > 0) {
          console.log(
            `[Buffer] No header found, discarding ${searchIndex} bytes`,
          );
          this.buffer = this.buffer.slice(searchIndex);
        }
        break;
      }

      // 2. 检查是否有足够的数据构成完整数据包
      const packetEndIndex = headerIndex + PACKET_SPECS.LENGTH;
      if (packetEndIndex > this.buffer.length) {
        // 数据不够，等待下次接收
        console.log(
          `[Buffer] Incomplete packet at index ${headerIndex}, need ${
            packetEndIndex - this.buffer.length
          } more bytes`,
        );
        // 清除帧头之前的数据
        if (headerIndex > 0) {
          this.buffer = this.buffer.slice(headerIndex);
        }
        break;
      }

      // 3. 验证帧尾
      const footerIndex = headerIndex + PACKET_SPECS.LENGTH - 1;
      const footerByte = this.buffer[footerIndex];

      if (footerByte === PACKET_SPECS.FOOTER) {
        // 找到完整的数据包
        const packet = this.buffer.slice(headerIndex, packetEndIndex);
        packets.push(packet);
        this.packetsExtracted++;

        console.log(
          `[Buffer] ✅ Extracted packet #${this.packetsExtracted} at index ${headerIndex}`,
        );

        // 移动搜索位置到当前数据包之后
        searchIndex = packetEndIndex;
      } else {
        // 帧尾不匹配，这不是有效的数据包
        console.warn(
          `[Buffer] ❌ Invalid footer at index ${footerIndex}: 0x${footerByte.toString(
            16,
          )}, expected 0xC0`,
        );
        this.invalidPackets++;

        // 从下一个字节继续搜索
        searchIndex = headerIndex + 1;
      }
    }

    // 清除已提取的数据包
    if (searchIndex > 0) {
      this.buffer = this.buffer.slice(searchIndex);
      console.log(
        `[Buffer] Removed ${searchIndex} bytes, remaining: ${this.buffer.length}`,
      );
    }

    if (packets.length > 0) {
      console.log(
        `[Buffer] 📦 Extracted ${packets.length} packet(s), buffer remaining: ${this.buffer.length} bytes`,
      );
    }

    return packets;
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    console.log('[Buffer] Clearing buffer');
    this.buffer = [];
    this.totalBytesReceived = 0;
    this.packetsExtracted = 0;
    this.invalidPackets = 0;
  }

  /**
   * 获取缓冲区统计信息
   */
  getStats() {
    return {
      bufferSize: this.buffer.length,
      totalBytesReceived: this.totalBytesReceived,
      packetsExtracted: this.packetsExtracted,
      invalidPackets: this.invalidPackets,
    };
  }

  /**
   * 获取当前缓冲区大小
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
}

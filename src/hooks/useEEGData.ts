import {useState, useEffect, useRef, useCallback} from 'react';
import {Device, Subscription} from 'react-native-ble-plx';
import {eegDataParser} from '../services/EEGDataParser';
import {EEGDataBuffer} from '../services/EEGDataBuffer';
import {
  ParsedEEGData,
  EEGWaveformDataPoint,
  EEGStatistics,
  DeviceType,
  PACKET_SPECS,
} from '../types/eeg';

// NV-BrainRF/BG22A1 模块的 BLE UUIDs
const BLE_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const BLE_RX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'; // Write (发送命令)
const BLE_TX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'; // Notify (接收数据)

interface UseEEGDataReturn {
  // 连接状态
  isConnected: boolean;
  connectedDevice: Device | null;

  // 数据状态
  latestData: ParsedEEGData | null;
  waveformData: EEGWaveformDataPoint[];
  statistics: EEGStatistics;

  // 控制方法
  connectDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  clearData: () => void;
}

const MAX_WAVEFORM_POINTS = 2500; // 保持最近10秒的数据 (250Hz * 10s) - 优化性能

export const useEEGData = (): UseEEGDataReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [latestData, setLatestData] = useState<ParsedEEGData | null>(null);
  const [waveformData, setWaveformData] = useState<EEGWaveformDataPoint[]>([]);
  const [statistics, setStatistics] = useState<EEGStatistics>({
    totalPackets: 0,
    validPackets: 0,
    invalidPackets: 0,
    currentFrameRate: 0,
    lastPacketTime: null,
    deviceType: DeviceType.UNKNOWN,
  });

  const subscriptionRef = useRef<Subscription | null>(null);
  const frameRateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const packetCountRef = useRef(0);
  const lastFrameRateCheckRef = useRef(Date.now());
  const dataBufferRef = useRef<EEGDataBuffer>(new EEGDataBuffer());
  const isCleaningUpRef = useRef(false); // 防止清理过程中的状态更新
  const deviceDisconnectSubscriptionRef = useRef<Subscription | null>(null);

  // 清空数据
  const clearData = useCallback(() => {
    if (isCleaningUpRef.current) return;

    setLatestData(null);
    setWaveformData([]);
    setStatistics({
      totalPackets: 0,
      validPackets: 0,
      invalidPackets: 0,
      currentFrameRate: 0,
      lastPacketTime: null,
      deviceType: DeviceType.UNKNOWN,
    });
    packetCountRef.current = 0;
    eegDataParser.resetDeviceType();
    dataBufferRef.current.clear(); // 清空缓冲区
  }, []);

  // 断开设备 (放在前面，这样 connectDevice 可以使用它)
  const disconnectDevice = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting device...');
      isCleaningUpRef.current = true; // 设置清理标志

      // 发送 'sv' 命令停止数据传输
      if (connectedDevice) {
        try {
          const isDeviceConnected = await connectedDevice.isConnected();
          if (isDeviceConnected) {
            console.log('📤 Sending "sv" command to stop streaming...');
            const commandBase64 = btoa('sv');
            await connectedDevice.writeCharacteristicWithResponseForService(
              BLE_SERVICE_UUID,
              BLE_RX_CHARACTERISTIC_UUID,
              commandBase64,
            );
            console.log('✅ "sv" command sent successfully');
          }
        } catch (cmdError: any) {
          console.error('❌ Failed to send "sv" command:', cmdError);
          // 继续断开流程
        }
      }

      // 取消设备断开监听
      if (deviceDisconnectSubscriptionRef.current) {
        deviceDisconnectSubscriptionRef.current.remove();
        deviceDisconnectSubscriptionRef.current = null;
      }

      // 取消订阅
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      // 清除帧率定时器
      if (frameRateTimerRef.current) {
        clearInterval(frameRateTimerRef.current);
        frameRateTimerRef.current = null;
      }

      // 断开设备
      if (connectedDevice) {
        const isDeviceConnected = await connectedDevice.isConnected();
        if (isDeviceConnected) {
          await connectedDevice.cancelConnection();
        }
      }

      setIsConnected(false);
      setConnectedDevice(null);
      isCleaningUpRef.current = false; // 清理完成

      console.log('✅ Device disconnected');
    } catch (error: any) {
      console.error('❌ Disconnect error:', error);
      isCleaningUpRef.current = false; // 即使出错也重置标志
    }
  }, [connectedDevice]);

  // 连接设备
  const connectDevice = useCallback(
    async (device: Device) => {
      try {
        console.log('🔗 Connecting to device:', device.id);

        // 如果已经有设备连接，先断开
        if (connectedDevice) {
          console.log('⚠️ Already connected, disconnecting first...');
          await disconnectDevice();
          // 等待一小段时间确保完全断开
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 确保设备已连接
        const isDeviceConnected = await device.isConnected();
        if (!isDeviceConnected) {
          await device.connect();
        }

        // 发现服务和特征
        await device.discoverAllServicesAndCharacteristics();
        console.log('✅ Services discovered');

        // 订阅 TX 特征 (Notify)
        console.log('📡 Subscribing to TX characteristic...');

        subscriptionRef.current = device.monitorCharacteristicForService(
          BLE_SERVICE_UUID,
          BLE_TX_CHARACTERISTIC_UUID,
          (error, characteristic) => {
            // 如果正在清理，忽略所有回调
            if (isCleaningUpRef.current) {
              return;
            }

            if (error) {
              console.error('❌ Monitor error:', error);
              // 如果是操作取消错误,说明连接已断开,触发清理
              if (error.message?.includes('cancelled') || error.message?.includes('disconnected')) {
                console.log('🔌 Device connection lost, cleaning up...');
                disconnectDevice();
              }
              return;
            }

            if (characteristic?.value) {
              // 解码 base64 数据为字节数组
              const base64Data = characteristic.value;
              const binaryString = atob(base64Data);
              const bytes: number[] = [];
              for (let i = 0; i < binaryString.length; i++) {
                bytes.push(binaryString.charCodeAt(i));
              }

              console.log(`📥 Received ${bytes.length} bytes from BLE`);

              // 添加到缓冲区
              dataBufferRef.current.appendData(bytes);

              // 从缓冲区提取所有完整的数据包
              const packets = dataBufferRef.current.extractPackets();

              // 处理每个完整的数据包
              packets.forEach(packetBytes => {
                // 再次检查清理标志
                if (isCleaningUpRef.current) {
                  return;
                }

                // 解析数据包
                const parsedData = eegDataParser.parsePacket(packetBytes);

                if (parsedData) {
                  // 更新最新数据
                  setLatestData(parsedData);

                  // 添加到波形数据缓冲区
                  const waveformPoint: EEGWaveformDataPoint = {
                    timestamp: parsedData.packet.timestamp,
                    values: parsedData.packet.channels.map(ch => ch.value),
                  };

                  setWaveformData(prev => {
                    const updated = [...prev, waveformPoint];
                    // 限制缓冲区大小
                    if (updated.length > MAX_WAVEFORM_POINTS) {
                      return updated.slice(updated.length - MAX_WAVEFORM_POINTS);
                    }
                    return updated;
                  });

                  // 更新统计信息
                  setStatistics(prev => ({
                    ...prev,
                    totalPackets: prev.totalPackets + 1,
                    validPackets: prev.validPackets + 1,
                    lastPacketTime: parsedData.packet.timestamp,
                    deviceType: parsedData.deviceType,
                  }));

                  packetCountRef.current++;
                } else {
                  // 无效数据包
                  setStatistics(prev => ({
                    ...prev,
                    totalPackets: prev.totalPackets + 1,
                    invalidPackets: prev.invalidPackets + 1,
                  }));
                }
              });

              // 如果提取到了数据包，打印缓冲区状态
              if (packets.length > 0) {
                const stats = dataBufferRef.current.getStats();
                console.log(
                  `📊 Buffer stats: ${stats.packetsExtracted} extracted, ${stats.invalidPackets} invalid, ${stats.bufferSize} bytes remaining`,
                );
              }
            }
          },
        );

        console.log('✅ Subscribed to data notifications');

        // 发送 'b' 命令启动数据传输
        console.log('📤 Sending "b" command to start streaming...');
        try {
          // 将 'b' 转换为 base64
          const commandBase64 = btoa('b');
          await device.writeCharacteristicWithResponseForService(
            BLE_SERVICE_UUID,
            BLE_RX_CHARACTERISTIC_UUID,
            commandBase64,
          );
          console.log('✅ "b" command sent successfully');
        } catch (cmdError: any) {
          console.error('❌ Failed to send "b" command:', cmdError);
          // 即使发送命令失败，也继续连接流程
        }

        setConnectedDevice(device);
        setIsConnected(true);
        clearData();
        isCleaningUpRef.current = false; // 重置清理标志

        // 监听设备断开事件
        deviceDisconnectSubscriptionRef.current = device.onDisconnected(
          (error, disconnectedDevice) => {
            console.log('📡 Device disconnected event:', disconnectedDevice?.id);
            if (error) {
              console.error('❌ Disconnection error:', error);
            }
            // 设备意外断开，触发清理
            if (!isCleaningUpRef.current) {
              console.log('⚠️ Unexpected disconnection, cleaning up...');
              disconnectDevice();
            }
          },
        );

        // 启动帧率计算定时器
        frameRateTimerRef.current = setInterval(() => {
          // 检查清理标志
          if (isCleaningUpRef.current) {
            return;
          }

          const now = Date.now();
          const elapsed = (now - lastFrameRateCheckRef.current) / 1000; // 秒
          const frameRate = packetCountRef.current / elapsed;

          setStatistics(prev => ({
            ...prev,
            currentFrameRate: Math.round(frameRate),
          }));

          // 重置计数器
          packetCountRef.current = 0;
          lastFrameRateCheckRef.current = now;
        }, 1000); // 每秒更新一次帧率

        console.log('✅ Device connected and data streaming started');
      } catch (error: any) {
        console.error('❌ Connection error:', error);
        throw error;
      }
    },
    [connectedDevice, clearData, disconnectDevice],
  );

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      isCleaningUpRef.current = true; // 设置清理标志

      // 清理订阅和定时器
      if (deviceDisconnectSubscriptionRef.current) {
        deviceDisconnectSubscriptionRef.current.remove();
        deviceDisconnectSubscriptionRef.current = null;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (frameRateTimerRef.current) {
        clearInterval(frameRateTimerRef.current);
        frameRateTimerRef.current = null;
      }

      // 自动断开设备连接
      const currentDevice = connectedDevice;
      if (currentDevice) {
        (async () => {
          try {
            console.log('🔌 Auto-disconnecting device on component unmount...');

            // 发送 'sv' 命令停止数据传输
            const isDeviceConnected = await currentDevice.isConnected();
            if (isDeviceConnected) {
              try {
                const commandBase64 = btoa('sv');
                await currentDevice.writeCharacteristicWithResponseForService(
                  BLE_SERVICE_UUID,
                  BLE_RX_CHARACTERISTIC_UUID,
                  commandBase64,
                );
                console.log('✅ "sv" command sent successfully during cleanup');
              } catch (cmdError: any) {
                console.error('❌ Failed to send "sv" command during cleanup:', cmdError);
              }

              // 断开设备
              await currentDevice.cancelConnection();
              console.log('✅ Device disconnected during cleanup');
            }
          } catch (error: any) {
            console.error('❌ Error during auto-disconnect:', error);
          }
        })();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isConnected,
    connectedDevice,
    latestData,
    waveformData,
    statistics,
    connectDevice,
    disconnectDevice,
    clearData,
  };
};

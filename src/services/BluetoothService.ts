import BleManager, {Peripheral} from 'react-native-ble-manager';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import {
  BluetoothDevice,
  BluetoothError,
  BluetoothErrorType,
  BLE_UUIDS,
} from '../types/bluetooth';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class BluetoothService {
  private initialized = false;
  private scanning = false;
  private connectedDeviceId: string | null = null;
  private deviceServices: any = null; // 存储已连接设备的服务信息
  private bluetoothState: string = 'unknown'; // 蓝牙状态

  /**
   * 初始化 BLE Manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('[BluetoothService] Starting BLE Manager...');
      await BleManager.start({showAlert: false});

      // 监听蓝牙状态变化
      bleManagerEmitter.addListener('BleManagerDidUpdateState', ({state}) => {
        console.log('[BluetoothService] Bluetooth state changed:', state);
        this.bluetoothState = state;
      });

      // iOS 需要一点时间来初始化蓝牙堆栈
      console.log('[BluetoothService] Waiting for BLE stack to initialize...');
      await this.delay(1500);

      // 主动检查蓝牙状态（iOS 上很重要）
      try {
        console.log('[BluetoothService] Checking Bluetooth state...');
        const state = await BleManager.checkState();
        console.log('[BluetoothService] Bluetooth state from checkState():', state);
        // checkState 返回的是字符串，如 "on", "off", "unauthorized" 等
        this.bluetoothState = state;
      } catch (stateError) {
        console.error('[BluetoothService] Failed to check state:', stateError);
        // 继续，某些版本可能不支持 checkState
      }

      this.initialized = true;
      console.log('[BluetoothService] BleManager initialized, state:', this.bluetoothState);
    } catch (error) {
      console.error('[BluetoothService] Failed to initialize:', error);
      throw this.createError(
        BluetoothErrorType.UNKNOWN,
        '初始化蓝牙管理器失败',
        error,
      );
    }
  }

  /**
   * 检查蓝牙是否已启用
   */
  async checkBluetoothEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await BleManager.enableBluetooth();
        return true;
      }
      // iOS 不支持程序化启用蓝牙，只能返回状态
      return true;
    } catch (error) {
      console.error('[BluetoothService] Bluetooth check failed:', error);
      return false;
    }
  }

  /**
   * 开始扫描蓝牙设备
   * @param onDeviceFound 发现设备的回调
   */
  async startScan(
    onDeviceFound: (device: BluetoothDevice) => void,
  ): Promise<void> {
    if (!this.initialized) {
      console.log('[BluetoothService] Not initialized, initializing now...');
      await this.initialize();
    }

    if (this.scanning) {
      console.log('[BluetoothService] Already scanning');
      return;
    }

    // 检查蓝牙状态
    console.log('[BluetoothService] Current Bluetooth state:', this.bluetoothState);
    if (this.bluetoothState === 'off') {
      throw this.createError(
        BluetoothErrorType.SCAN_FAILED,
        '蓝牙未开启，请在设置中开启蓝牙',
        null,
      );
    }
    if (this.bluetoothState === 'unauthorized') {
      throw this.createError(
        BluetoothErrorType.SCAN_FAILED,
        '应用没有蓝牙权限，请在 iPhone 设置 → 隐私 → 蓝牙 中允许 BrainCare 使用蓝牙',
        null,
      );
    }

    try {
      // 设置设备发现监听器
      console.log('[BluetoothService] Setting up device discovery listener...');
      const discoverListener = bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        (peripheral: Peripheral) => {
          console.log('[BluetoothService] ✅ Device discovered:', {
            id: peripheral.id,
            name: peripheral.name,
            rssi: peripheral.rssi,
          });
          const device: BluetoothDevice = {
            id: peripheral.id,
            name: peripheral.name || peripheral.advertising?.localName || null,
            rssi: peripheral.rssi,
            advertising: peripheral.advertising,
          };
          onDeviceFound(device);
        },
      );
      console.log('[BluetoothService] Discovery listener registered');

      // 开始扫描
      // 扫描所有 BLE 设备（空数组 = 不过滤 Service UUID）
      // allowDuplicates = true 允许重复发现设备以更新 RSSI
      // duration = 0 表示持续扫描，不自动停止
      console.log('[BluetoothService] Starting BLE scan for all devices...');
      console.log('[BluetoothService] Scan parameters: serviceUUIDs=[], duration=continuous, allowDuplicates=true');
      await BleManager.scan(
        [], // serviceUUIDs - 空数组表示扫描所有设备
        0, // duration = 0 表示持续扫描，需要手动停止
        true, // allowDuplicates - 允许重复发现设备
      );
      this.scanning = true;
      console.log('[BluetoothService] ✅ Scan started successfully, will continue until manually stopped...');
    } catch (error) {
      this.scanning = false;
      console.error('[BluetoothService] ❌ Scan failed:', error);
      throw this.createError(BluetoothErrorType.SCAN_FAILED, '扫描失败', error);
    }
  }

  /**
   * 停止扫描
   */
  async stopScan(): Promise<void> {
    if (!this.scanning) {
      console.log('[BluetoothService] Not scanning, nothing to stop');
      return;
    }

    try {
      await BleManager.stopScan();
      this.scanning = false;
      console.log('[BluetoothService] ✅ Scan stopped manually');
    } catch (error) {
      console.error('[BluetoothService] ❌ Stop scan failed:', error);
      // 即使停止失败，也标记为未扫描状态
      this.scanning = false;
    }
  }

  /**
   * 获取系统已连接的 BLE 设备（iOS 专用）
   * 这对于查找已配对的设备很有用
   */
  async getConnectedPeripherals(): Promise<BluetoothDevice[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // 获取已连接的外设（可以指定 Service UUID，空数组表示所有）
      const peripherals = await BleManager.getConnectedPeripherals([]);
      console.log('[BluetoothService] Connected peripherals:', peripherals);

      return peripherals.map((p: any) => ({
        id: p.id,
        name: p.name || null,
        rssi: p.rssi || 0,
        advertising: p.advertising,
      }));
    } catch (error) {
      console.error('[BluetoothService] Get connected peripherals failed:', error);
      return [];
    }
  }

  /**
   * 简化的测试扫描（按照文章示例）
   * 用于调试 iOS 扫描问题
   * 注意：测试扫描会持续进行，需要手动停止或重启应用
   */
  async testScan(): Promise<void> {
    console.log('[BluetoothService] === TEST SCAN START ===');

    if (!this.initialized) {
      console.log('[BluetoothService] Initializing...');
      await this.initialize();
    }

    // 添加临时监听器
    const tempListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral: any) => {
        console.log('[BluetoothService] 🎉🎉🎉 DEVICE FOUND 🎉🎉🎉');
        console.log('[BluetoothService] ID:', peripheral.id);
        console.log('[BluetoothService] Name:', peripheral.name);
        console.log('[BluetoothService] RSSI:', peripheral.rssi);
        console.log('[BluetoothService] Raw data:', JSON.stringify(peripheral));
      },
    );

    console.log('[BluetoothService] Starting continuous test scan...');
    await BleManager.scan([], 0, true); // duration = 0 表示持续扫描
    console.log('[BluetoothService] Test scan started, will continue until app restarts or stopScan() is called');
    console.log('[BluetoothService] Watch console for "🎉 DEVICE FOUND 🎉" messages');
  }

  /**
   * 连接设备
   * @param deviceId 设备 MAC 地址
   */
  async connect(deviceId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`[BluetoothService] Connecting to ${deviceId}...`);
      await BleManager.connect(deviceId);
      this.connectedDeviceId = deviceId;

      // 等待连接稳定并进行 MTU 协商（根据规格书建议等待 6 秒）
      await this.delay(6000);

      // 获取设备信息和服务
      const peripheralInfo = await BleManager.retrieveServices(deviceId);
      this.deviceServices = peripheralInfo;
      console.log('[BluetoothService] Device connected:', peripheralInfo);
      console.log('[BluetoothService] Available services:', peripheralInfo.services);
      console.log('[BluetoothService] Characteristics:', peripheralInfo.characteristics);

      console.log(`[BluetoothService] Connected to ${deviceId}`);
    } catch (error) {
      this.connectedDeviceId = null;
      console.error('[BluetoothService] Connection failed:', error);
      throw this.createError(
        BluetoothErrorType.CONNECT_FAILED,
        '连接设备失败',
        error,
      );
    }
  }

  /**
   * 发送初始化命令以开始接收数据
   * 根据用户提供的信息，需要发送一个值（可能是字符 'b'）
   */
  async sendStartCommand(): Promise<void> {
    if (!this.connectedDeviceId) {
      throw this.createError(
        BluetoothErrorType.WRITE_FAILED,
        '未连接设备',
        null,
      );
    }

    try {
      // 查找可写特征
      const writable = this.findWritableCharacteristic();
      if (!writable) {
        throw new Error('未找到可写的特征（Characteristic）');
      }

      console.log('[BluetoothService] Using writable characteristic:', writable);

      // 将字符 'b' 转换为字节数组
      const command = [0x62]; // 'b' 的 ASCII 码

      console.log('[BluetoothService] Sending start command:', command);

      await BleManager.write(
        this.connectedDeviceId,
        writable.service,
        writable.characteristic,
        command,
      );

      console.log('[BluetoothService] Start command sent successfully');
    } catch (error) {
      console.error('[BluetoothService] Send command failed:', error);
      throw this.createError(
        BluetoothErrorType.WRITE_FAILED,
        '发送启动命令失败',
        error,
      );
    }
  }

  /**
   * 订阅数据通知
   * @param onDataReceived 接收数据的回调
   */
  async subscribeToNotifications(
    onDataReceived: (data: number[]) => void,
  ): Promise<() => void> {
    if (!this.connectedDeviceId) {
      throw this.createError(
        BluetoothErrorType.SUBSCRIBE_FAILED,
        '未连接设备',
        null,
      );
    }

    try {
      // 查找可通知特征
      const notifiable = this.findNotifiableCharacteristic();
      if (!notifiable) {
        throw new Error('未找到可通知的特征（Characteristic）');
      }

      console.log('[BluetoothService] Using notifiable characteristic:', notifiable);

      // 启用 Notify
      await BleManager.startNotification(
        this.connectedDeviceId,
        notifiable.service,
        notifiable.characteristic,
      );

      console.log('[BluetoothService] Notifications enabled');

      // 保存 characteristic UUID 用于后续比较
      const notifiableCharUuid = notifiable.characteristic.toLowerCase();

      // 设置数据接收监听器
      const updateListener = bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        ({value, peripheral, characteristic}) => {
          // 确保是来自正确设备和特征的数据
          if (
            peripheral === this.connectedDeviceId &&
            characteristic.toLowerCase() === notifiableCharUuid
          ) {
            onDataReceived(value);
          }
        },
      );

      // 返回取消订阅的函数
      return () => {
        updateListener.remove();
        if (this.connectedDeviceId) {
          BleManager.stopNotification(
            this.connectedDeviceId,
            notifiable.service,
            notifiable.characteristic,
          ).catch(err =>
            console.error('[BluetoothService] Stop notification failed:', err),
          );
        }
      };
    } catch (error) {
      console.error('[BluetoothService] Subscribe failed:', error);
      throw this.createError(
        BluetoothErrorType.SUBSCRIBE_FAILED,
        '订阅数据通知失败',
        error,
      );
    }
  }

  /**
   * 断开设备连接
   */
  async disconnect(): Promise<void> {
    if (!this.connectedDeviceId) {
      return;
    }

    try {
      await BleManager.disconnect(this.connectedDeviceId);
      console.log(`[BluetoothService] Disconnected from ${this.connectedDeviceId}`);
      this.connectedDeviceId = null;
      this.deviceServices = null;
    } catch (error) {
      console.error('[BluetoothService] Disconnect failed:', error);
      throw this.createError(
        BluetoothErrorType.DISCONNECT_FAILED,
        '断开连接失败',
        error,
      );
    }
  }

  /**
   * 获取设备的服务信息
   */
  getDeviceServices(): any {
    return this.deviceServices;
  }

  /**
   * 查找第一个可写特征（用于发送命令）
   */
  private findWritableCharacteristic(): {service: string; characteristic: string} | null {
    if (!this.deviceServices || !this.deviceServices.characteristics) {
      return null;
    }

    // 优先查找 BG22A1 的 RX Characteristic
    const bg22Char = this.deviceServices.characteristics.find(
      (char: any) => char.characteristic.toUpperCase() === BLE_UUIDS.RX_CHARACTERISTIC.toUpperCase()
    );
    if (bg22Char) {
      return {
        service: bg22Char.service,
        characteristic: bg22Char.characteristic,
      };
    }

    // 查找任何支持 WRITE 或 WRITE_NO_RESPONSE 的特征
    const writableChar = this.deviceServices.characteristics.find(
      (char: any) => char.properties.Write || char.properties.WriteWithoutResponse
    );

    if (writableChar) {
      return {
        service: writableChar.service,
        characteristic: writableChar.characteristic,
      };
    }

    return null;
  }

  /**
   * 查找第一个可通知特征（用于接收数据）
   */
  private findNotifiableCharacteristic(): {service: string; characteristic: string} | null {
    if (!this.deviceServices || !this.deviceServices.characteristics) {
      return null;
    }

    // 优先查找 BG22A1 的 TX Characteristic
    const bg22Char = this.deviceServices.characteristics.find(
      (char: any) => char.characteristic.toUpperCase() === BLE_UUIDS.TX_CHARACTERISTIC.toUpperCase()
    );
    if (bg22Char) {
      return {
        service: bg22Char.service,
        characteristic: bg22Char.characteristic,
      };
    }

    // 查找任何支持 NOTIFY 的特征
    const notifiableChar = this.deviceServices.characteristics.find(
      (char: any) => char.properties.Notify || char.properties.Indicate
    );

    if (notifiableChar) {
      return {
        service: notifiableChar.service,
        characteristic: notifiableChar.characteristic,
      };
    }

    return null;
  }

  /**
   * 获取当前连接的设备 ID
   */
  getConnectedDeviceId(): string | null {
    return this.connectedDeviceId;
  }

  /**
   * 检查是否正在扫描
   */
  isScanning(): boolean {
    return this.scanning;
  }

  /**
   * 获取当前蓝牙状态
   */
  getBluetoothState(): string {
    return this.bluetoothState;
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 创建错误对象
   */
  private createError(
    type: BluetoothErrorType,
    message: string,
    originalError: any,
  ): BluetoothError {
    return {
      type,
      message,
      originalError,
    };
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
export default new BluetoothService();

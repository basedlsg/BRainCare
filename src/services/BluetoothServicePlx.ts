import {BleManager, Device, State, Subscription} from 'react-native-ble-plx';
import {Platform, PermissionsAndroid} from 'react-native';
import {
  BluetoothDevice,
  BluetoothError,
  BluetoothErrorType,
  BLE_UUIDS,
} from '../types/bluetooth';

class BluetoothServicePlx {
  private manager: BleManager;
  private initialized = false;
  private scanning = false;
  private connectedDeviceId: string | null = null;
  private scanSubscription: Subscription | null = null;
  private stateSubscription: Subscription | null = null;
  private bluetoothState: State = State.Unknown;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * 初始化 BLE Manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('[BluetoothServicePlx] Initializing BLE Manager...');

      // 监听蓝牙状态变化
      this.stateSubscription = this.manager.onStateChange(state => {
        console.log('[BluetoothServicePlx] Bluetooth state changed:', state);
        this.bluetoothState = state;

        if (state === State.PoweredOn) {
          console.log('[BluetoothServicePlx] ✅ Bluetooth is powered on and ready');
        }
      }, true);

      this.initialized = true;
      console.log('[BluetoothServicePlx] ✅ BLE Manager initialized');
    } catch (error) {
      console.error('[BluetoothServicePlx] Failed to initialize:', error);
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
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const state = await this.manager.state();
      console.log('[BluetoothServicePlx] Current Bluetooth state:', state);
      return state === State.PoweredOn;
    } catch (error) {
      console.error('[BluetoothServicePlx] Failed to check Bluetooth state:', error);
      return false;
    }
  }

  /**
   * 请求 Android 蓝牙权限
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Platform.Version as number;
      console.log('[BluetoothServicePlx] Android API Level:', apiLevel);

      if (apiLevel >= 31) {
        // Android 12+
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(permissions).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED,
        );

        console.log('[BluetoothServicePlx] Permissions:', permissions);
        return allGranted;
      } else {
        // Android 11 及以下
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
          permissions['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          permissions['android.permission.ACCESS_COARSE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (error) {
      console.error('[BluetoothServicePlx] Permission request failed:', error);
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
      console.log('[BluetoothServicePlx] Not initialized, initializing now...');
      await this.initialize();
    }

    if (this.scanning) {
      console.log('[BluetoothServicePlx] Already scanning');
      return;
    }

    // 检查蓝牙状态
    const isEnabled = await this.checkBluetoothEnabled();
    if (!isEnabled) {
      throw this.createError(
        BluetoothErrorType.SCAN_FAILED,
        '蓝牙未开启，请在设置中开启蓝牙',
        null,
      );
    }

    try {
      console.log('[BluetoothServicePlx] Starting BLE scan...');

      this.manager.startDeviceScan(
        null, // UUIDs - null 表示扫描所有设备
        {
          allowDuplicates: true, // 允许重复发现设备以更新 RSSI
        },
        (error, device) => {
          if (error) {
            console.error('[BluetoothServicePlx] Scan error:', error);
            this.scanning = false;
            return;
          }

          if (device) {
            console.log('[BluetoothServicePlx] 📱 Device found:', {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
            });

            const bluetoothDevice: BluetoothDevice = {
              id: device.id,
              name: device.name || device.localName || null,
              rssi: device.rssi || 0,
              advertising: {
                localName: device.localName,
                manufacturerData: device.manufacturerData,
                serviceUUIDs: device.serviceUUIDs,
              },
            };

            onDeviceFound(bluetoothDevice);
          }
        },
      );

      this.scanning = true;
      console.log('[BluetoothServicePlx] ✅ Scan started successfully');
    } catch (error) {
      this.scanning = false;
      console.error('[BluetoothServicePlx] ❌ Scan failed:', error);
      throw this.createError(BluetoothErrorType.SCAN_FAILED, '扫描失败', error);
    }
  }

  /**
   * 停止扫描
   */
  async stopScan(): Promise<void> {
    if (!this.scanning) {
      console.log('[BluetoothServicePlx] Not scanning, nothing to stop');
      return;
    }

    try {
      this.manager.stopDeviceScan();
      this.scanning = false;
      console.log('[BluetoothServicePlx] ✅ Scan stopped');
    } catch (error) {
      console.error('[BluetoothServicePlx] ❌ Stop scan failed:', error);
      this.scanning = false;
    }
  }

  /**
   * 连接到设备
   */
  async connect(deviceId: string): Promise<void> {
    try {
      console.log('[BluetoothServicePlx] Connecting to device:', deviceId);

      const device = await this.manager.connectToDevice(deviceId);
      console.log('[BluetoothServicePlx] Connected to device:', device.id);

      // 发现服务和特征
      await device.discoverAllServicesAndCharacteristics();
      console.log('[BluetoothServicePlx] Services discovered');

      this.connectedDeviceId = deviceId;
      console.log('[BluetoothServicePlx] ✅ Connection successful');
    } catch (error) {
      console.error('[BluetoothServicePlx] ❌ Connection failed:', error);
      throw this.createError(
        BluetoothErrorType.CONNECTION_FAILED,
        '连接失败',
        error,
      );
    }
  }

  /**
   * 断开设备连接
   */
  async disconnect(): Promise<void> {
    if (!this.connectedDeviceId) {
      console.log('[BluetoothServicePlx] No device connected');
      return;
    }

    try {
      console.log(
        '[BluetoothServicePlx] Disconnecting from:',
        this.connectedDeviceId,
      );
      await this.manager.cancelDeviceConnection(this.connectedDeviceId);
      this.connectedDeviceId = null;
      console.log('[BluetoothServicePlx] ✅ Disconnected');
    } catch (error) {
      console.error('[BluetoothServicePlx] ❌ Disconnect failed:', error);
      this.connectedDeviceId = null;
    }
  }

  /**
   * 订阅特征值变化
   */
  async subscribeToCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    onDataReceived: (data: string) => void,
  ): Promise<Subscription | null> {
    if (!this.connectedDeviceId) {
      throw this.createError(
        BluetoothErrorType.CONNECTION_FAILED,
        '未连接到设备',
        null,
      );
    }

    try {
      console.log('[BluetoothServicePlx] Subscribing to characteristic:', {
        service: serviceUUID,
        characteristic: characteristicUUID,
      });

      const subscription = this.manager.monitorCharacteristicForDevice(
        this.connectedDeviceId,
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
          if (error) {
            console.error(
              '[BluetoothServicePlx] Characteristic monitor error:',
              error,
            );
            return;
          }

          if (characteristic?.value) {
            console.log(
              '[BluetoothServicePlx] Received data:',
              characteristic.value,
            );
            onDataReceived(characteristic.value);
          }
        },
      );

      console.log('[BluetoothServicePlx] ✅ Subscribed to characteristic');
      return subscription;
    } catch (error) {
      console.error('[BluetoothServicePlx] ❌ Subscribe failed:', error);
      throw this.createError(
        BluetoothErrorType.UNKNOWN,
        '订阅特征失败',
        error,
      );
    }
  }

  /**
   * 写入数据到特征
   */
  async writeCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    data: string,
  ): Promise<void> {
    if (!this.connectedDeviceId) {
      throw this.createError(
        BluetoothErrorType.CONNECTION_FAILED,
        '未连接到设备',
        null,
      );
    }

    try {
      console.log('[BluetoothServicePlx] Writing to characteristic:', {
        service: serviceUUID,
        characteristic: characteristicUUID,
        data,
      });

      await this.manager.writeCharacteristicWithResponseForDevice(
        this.connectedDeviceId,
        serviceUUID,
        characteristicUUID,
        data,
      );

      console.log('[BluetoothServicePlx] ✅ Write successful');
    } catch (error) {
      console.error('[BluetoothServicePlx] ❌ Write failed:', error);
      throw this.createError(BluetoothErrorType.UNKNOWN, '写入数据失败', error);
    }
  }

  /**
   * 获取已连接的设备（兼容性方法）
   */
  async getConnectedPeripherals(): Promise<BluetoothDevice[]> {
    // ble-plx 不支持直接获取已连接设备列表
    // 返回空数组
    console.log('[BluetoothServicePlx] getConnectedPeripherals called (not supported by ble-plx)');
    return [];
  }

  /**
   * 获取蓝牙状态
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
   * 清理资源（注意：不销毁 manager，因为这是单例服务）
   */
  async cleanup(): Promise<void> {
    console.log('[BluetoothServicePlx] Cleaning up...');

    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }

    if (this.scanning) {
      await this.stopScan();
    }

    if (this.connectedDeviceId) {
      await this.disconnect();
    }

    console.log('[BluetoothServicePlx] ✅ Cleanup complete');
  }

  /**
   * 完全销毁（仅在应用退出时使用）
   */
  async destroy(): Promise<void> {
    console.log('[BluetoothServicePlx] Destroying BLE Manager...');

    await this.cleanup();

    if (this.stateSubscription) {
      this.stateSubscription.remove();
      this.stateSubscription = null;
    }

    // 注意：只有在应用完全退出时才销毁 manager
    this.manager.destroy();
    this.initialized = false;
    console.log('[BluetoothServicePlx] ✅ Destroyed');
  }

  /**
   * 创建错误对象
   */
  private createError(
    type: BluetoothErrorType,
    message: string,
    error: any,
  ): BluetoothError {
    return {
      type,
      message,
      error,
    };
  }
}

export default new BluetoothServicePlx();

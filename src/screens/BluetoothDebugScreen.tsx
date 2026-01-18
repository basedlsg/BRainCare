import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  TextInput,
  ScrollView,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { Buffer } from 'buffer';
import { useLanguage } from '../i18n/LanguageContext';

const BluetoothDebugScreen = () => {
  const { t } = useLanguage();
  const [bleManager] = useState(() => new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bleState, setBleState] = useState<State>(State.Unknown);
  const [filterText, setFilterText] = useState('NV-BrainRF');
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [showServices, setShowServices] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [dataLog, setDataLog] = useState<string[]>([]);
  const [dataCount, setDataCount] = useState(0);
  const [useWriteWithoutResponse, setUseWriteWithoutResponse] = useState(false);
  const [customCommand, setCustomCommand] = useState('b');

  // Nordic UART Service UUIDs (当前设备使用的正确 UUIDs)
  const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const NUS_TX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // 写入命令
  const NUS_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // 接收数据 (主通道)
  const NUS_RX2_CHARACTERISTIC_UUID = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'; // 接收数据 (第二通道)

  useEffect(() => {
    // 监听蓝牙状态
    const subscription = bleManager.onStateChange(state => {
      console.log('📡 [BluetoothDebug] BLE State:', state);
      setBleState(state);
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    };
  }, [bleManager]);

  // 过滤设备
  useEffect(() => {
    if (!filterText.trim()) {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(device => {
        const name = device.name || device.localName || '';
        return name.toLowerCase().includes(filterText.toLowerCase());
      });
      setFilteredDevices(filtered);
    }
  }, [devices, filterText]);

  // 请求 Android 权限
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Platform.Version as number;
      console.log('🔐 [BluetoothDebug] Android API Level:', apiLevel);

      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        console.log('🔐 [BluetoothDebug] Permissions:', results);

        return Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        // Android 11 及以下
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('❌ [BluetoothDebug] Permission error:', error);
      return false;
    }
  };

  // 开始扫描
  const startScan = async () => {
    console.log('\n🔍 [BluetoothDebug] ===== STARTING SCAN =====');

    // 1. 检查权限
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('权限不足', '请在设置中授予蓝牙和位置权限');
      return;
    }
    console.log('✅ [BluetoothDebug] Permissions granted');

    // 2. 检查蓝牙状态
    const state = await bleManager.state();
    console.log('📡 [BluetoothDebug] Current BLE State:', state);

    if (state !== State.PoweredOn) {
      Alert.alert(
        '蓝牙未开启',
        `当前状态: ${state}\n\n请确保：\n1. 蓝牙已开启\n2. 位置服务（GPS）已开启`,
      );
      return;
    }
    console.log('✅ [BluetoothDebug] Bluetooth is powered on');

    // 3. 清空设备列表
    setDevices([]);
    setIsScanning(true);

    // 4. 开始扫描
    console.log('🔍 [BluetoothDebug] Starting device scan...');
    console.log('🔍 [BluetoothDebug] Filter:', filterText || 'None (all devices)');

    bleManager.startDeviceScan(
      null, // 扫描所有设备
      { allowDuplicates: true },
      (error, device) => {
        if (error) {
          console.error('❌ [BluetoothDebug] Scan error:', error);
          setIsScanning(false);
          Alert.alert('扫描错误', error.message);
          return;
        }

        if (device) {
          const deviceName = device.name || device.localName || 'Unknown';
          console.log('📱 [BluetoothDebug] Device found:', {
            id: device.id,
            name: deviceName,
            rssi: device.rssi,
          });

          // 更新设备列表
          setDevices(prev => {
            const index = prev.findIndex(d => d.id === device.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = device;
              return updated;
            }
            return [...prev, device];
          });
        }
      },
    );

    console.log('✅ [BluetoothDebug] Scan started');
  };

  // 停止扫描
  const stopScan = () => {
    console.log('🛑 [BluetoothDebug] Stopping scan...');
    bleManager.stopDeviceScan();
    setIsScanning(false);
    console.log('✅ [BluetoothDebug] Scan stopped');
    console.log(`📊 [BluetoothDebug] Total devices found: ${devices.length}`);
    console.log(`📊 [BluetoothDebug] Filtered devices: ${filteredDevices.length}`);
  };

  // 连接设备
  const connectToDevice = async (device: Device) => {
    console.log('🔌 [BluetoothDebug] Connecting to:', device.name || device.id);

    try {
      // 停止扫描
      if (isScanning) {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }

      // 连接设备
      await device.connect();
      console.log('✅ [BluetoothDebug] Connected to device');

      // 发现服务和特征
      await device.discoverAllServicesAndCharacteristics();
      console.log('✅ [BluetoothDebug] Services discovered');

      // 读取所有服务和特征
      const deviceServices = await device.services();
      console.log('📋 [BluetoothDebug] Found services:', deviceServices.length);

      const servicesData = [];
      for (const service of deviceServices) {
        const characteristics = await service.characteristics();
        console.log(`📋 [BluetoothDebug] Service ${service.uuid}:`, {
          uuid: service.uuid,
          isPrimary: service.isPrimary,
          characteristicsCount: characteristics.length,
        });

        const characteristicsData = [];
        for (const char of characteristics) {
          console.log(`  📝 Characteristic ${char.uuid}:`, {
            uuid: char.uuid,
            isReadable: char.isReadable,
            isWritableWithResponse: char.isWritableWithResponse,
            isWritableWithoutResponse: char.isWritableWithoutResponse,
            isNotifiable: char.isNotifiable,
            isIndicatable: char.isIndicatable,
          });

          characteristicsData.push({
            uuid: char.uuid,
            isReadable: char.isReadable,
            isWritableWithResponse: char.isWritableWithResponse,
            isWritableWithoutResponse: char.isWritableWithoutResponse,
            isNotifiable: char.isNotifiable,
            isIndicatable: char.isIndicatable,
          });
        }

        servicesData.push({
          uuid: service.uuid,
          isPrimary: service.isPrimary,
          characteristics: characteristicsData,
        });
      }

      setServices(servicesData);
      setConnectedDevice(device);

      Alert.alert(
        '连接成功',
        `已连接到 ${device.name || device.id}\n\n找到 ${servicesData.length} 个服务\n点击设备卡片查看详情`,
      );
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Connection error:', error);
      Alert.alert('连接失败', error.message || '未知错误');
    }
  };

  // 订阅数据通知
  const subscribeToData = async () => {
    if (!connectedDevice) {
      Alert.alert('错误', '未连接设备');
      return;
    }

    try {
      console.log('📥 [BluetoothDebug] Subscribing to notifications...');
      console.log('📥 [BluetoothDebug] Device ID:', connectedDevice.id);
      console.log('📥 [BluetoothDebug] Service UUID:', NUS_SERVICE_UUID);

      // 订阅第一个 Notify 特征 (6E400003)
      console.log('📥 [BluetoothDebug] Setting up monitor for RX (0003)...');
      const subscription1 = connectedDevice.monitorCharacteristicForService(
        NUS_SERVICE_UUID,
        NUS_RX_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ [BluetoothDebug] RX Monitor error:', error);
            console.error('❌ [BluetoothDebug] Error details:', JSON.stringify(error));
            return;
          }

          console.log('📥 [BluetoothDebug] RX (0003) callback triggered');

          if (characteristic) {
            console.log('📥 [BluetoothDebug] RX Characteristic:', {
              uuid: characteristic.uuid,
              isNotifying: characteristic.isNotifying,
              value: characteristic.value ? 'has value' : 'no value',
            });
          }

          if (characteristic?.value) {
            // 解码 Base64 数据
            const base64Data = characteristic.value;
            console.log('📦 [BluetoothDebug] RX (0003) data (base64):', base64Data);

            // 转换为十六进制字符串以便查看
            const bytes = Buffer.from(base64Data, 'base64');
            const hexString = Array.from(bytes)
              .map(b => b.toString(16).padStart(2, '0'))
              .join(' ');

            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const logEntry = `[${timestamp}] [RX-0003] ${bytes.length}字节: ${hexString}`;

            console.log('📦 [BluetoothDebug]', logEntry);

            setDataLog(prev => [...prev.slice(-49), logEntry]); // 保留最近50条
            setDataCount(prev => prev + 1);
          }
        },
      );
      console.log('📥 [BluetoothDebug] RX (0003) monitor subscription created:', subscription1 ? 'success' : 'failed');

      // 订阅第二个 Notify 特征 (6E400004)
      console.log('📥 [BluetoothDebug] Setting up monitor for RX2 (0004)...');
      const subscription2 = connectedDevice.monitorCharacteristicForService(
        NUS_SERVICE_UUID,
        NUS_RX2_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ [BluetoothDebug] RX2 Monitor error:', error);
            console.error('❌ [BluetoothDebug] Error details:', JSON.stringify(error));
            return;
          }

          console.log('📥 [BluetoothDebug] RX2 (0004) callback triggered');

          if (characteristic) {
            console.log('📥 [BluetoothDebug] RX2 Characteristic:', {
              uuid: characteristic.uuid,
              isNotifying: characteristic.isNotifying,
              value: characteristic.value ? 'has value' : 'no value',
            });
          }

          if (characteristic?.value) {
            // 解码 Base64 数据
            const base64Data = characteristic.value;
            console.log('📦 [BluetoothDebug] RX2 (0004) data (base64):', base64Data);

            // 转换为十六进制字符串以便查看
            const bytes = Buffer.from(base64Data, 'base64');
            const hexString = Array.from(bytes)
              .map(b => b.toString(16).padStart(2, '0'))
              .join(' ');

            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const logEntry = `[${timestamp}] [RX2-0004] ${bytes.length}字节: ${hexString}`;

            console.log('📦 [BluetoothDebug]', logEntry);

            setDataLog(prev => [...prev.slice(-49), logEntry]); // 保留最近50条
            setDataCount(prev => prev + 1);
          }
        },
      );
      console.log('📥 [BluetoothDebug] RX2 (0004) monitor subscription created:', subscription2 ? 'success' : 'failed');

      setIsSubscribed(true);
      console.log('✅ [BluetoothDebug] Subscribed to both RX (0003) and RX2 (0004)');
      Alert.alert('订阅成功', '开始接收两个通道的数据通知\n• RX-0003 (主数据流)\n• RX2-0004 (第二数据流)');
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Subscribe error:', error);
      Alert.alert('订阅失败', error.message);
    }
  };

  // 取消订阅
  const unsubscribeFromData = async () => {
    if (!connectedDevice) {
      return;
    }

    try {
      console.log('📥 [BluetoothDebug] Unsubscribing...');
      // Note: react-native-ble-plx doesn't have explicit unsubscribe for monitorCharacteristic
      // It will stop when device disconnects
      setIsSubscribed(false);
      console.log('✅ [BluetoothDebug] Unsubscribed');
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Unsubscribe error:', error);
    }
  };

  // 发送自定义命令
  const sendCustomCommand = async (commandText: string) => {
    if (!connectedDevice) {
      Alert.alert('错误', '未连接设备');
      return;
    }

    try {
      console.log(`✍️ [BluetoothDebug] Sending custom command: "${commandText}"`);
      console.log('✍️ [BluetoothDebug] Device ID:', connectedDevice.id);
      console.log('✍️ [BluetoothDebug] Service UUID:', NUS_SERVICE_UUID);
      console.log('✍️ [BluetoothDebug] TX Characteristic UUID:', NUS_TX_CHARACTERISTIC_UUID);

      // 处理转义字符：将 \r 和 \n 转换为实际的控制字符
      const processedCommand = commandText
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');

      // 发送命令
      const commandBytes = Buffer.from(processedCommand, 'utf8');
      const command = commandBytes.toString('base64');

      console.log('✍️ [BluetoothDebug] Command bytes (hex):', Array.from(commandBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
      console.log('✍️ [BluetoothDebug] Command bytes (ascii):', Array.from(commandBytes).map(b => String.fromCharCode(b)).join(''));
      console.log('✍️ [BluetoothDebug] Command (base64):', command);

      // 尝试两种写入方式
      if (useWriteWithoutResponse) {
        console.log('✍️ [BluetoothDebug] Using writeWithoutResponse...');
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          NUS_SERVICE_UUID,
          NUS_TX_CHARACTERISTIC_UUID,
          command,
        );
      } else {
        console.log('✍️ [BluetoothDebug] Using writeWithResponse...');
        await connectedDevice.writeCharacteristicWithResponseForService(
          NUS_SERVICE_UUID,
          NUS_TX_CHARACTERISTIC_UUID,
          command,
        );
      }

      const hexDisplay = Array.from(commandBytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
      console.log(`✅ [BluetoothDebug] Command "${commandText}" sent successfully`);
      Alert.alert('发送成功', `命令: "${commandText}"\nHex: ${hexDisplay}\n模式: ${useWriteWithoutResponse ? '无响应' : '有响应'}`);
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Write error:', error);
      console.error('❌ [BluetoothDebug] Error details:', JSON.stringify(error));
      Alert.alert('发送失败', error.message);
    }
  };

  // 写入命令启动数据流
  const startDataStream = async () => {
    await sendCustomCommand(customCommand);
  };

  // 手动启用 CCCD (通知描述符)
  const manuallyEnableCCCD = async () => {
    if (!connectedDevice) {
      Alert.alert('错误', '未连接设备');
      return;
    }

    try {
      console.log('🔧 [BluetoothDebug] Manually enabling CCCD for notifications...');

      // CCCD UUID (标准的 BLE CCCD descriptor UUID)
      const CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb';

      // 启用通知的值: 0x01 0x00
      const enableNotification = Buffer.from([0x01, 0x00]).toString('base64');

      console.log('🔧 [BluetoothDebug] Writing to CCCD descriptor...');
      console.log('🔧 [BluetoothDebug] Value (hex): 01 00');

      // 尝试写入 RX characteristic 的 CCCD
      await connectedDevice.writeDescriptorForService(
        NUS_SERVICE_UUID,
        NUS_RX_CHARACTERISTIC_UUID,
        CCCD_UUID,
        enableNotification,
      );

      console.log('✅ [BluetoothDebug] CCCD enabled for RX (0003)');

      // 也为 RX2 启用
      await connectedDevice.writeDescriptorForService(
        NUS_SERVICE_UUID,
        NUS_RX2_CHARACTERISTIC_UUID,
        CCCD_UUID,
        enableNotification,
      );

      console.log('✅ [BluetoothDebug] CCCD enabled for RX2 (0004)');
      Alert.alert('CCCD 已启用', '已手动启用两个特征的通知描述符');
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] CCCD enable error:', error);
      console.error('❌ [BluetoothDebug] Error details:', JSON.stringify(error));
      Alert.alert('CCCD 启用失败', error.message);
    }
  };

  // 测试读取特征值
  const testReadCharacteristic = async () => {
    if (!connectedDevice) {
      Alert.alert('错误', '未连接设备');
      return;
    }

    try {
      console.log('📖 [BluetoothDebug] Reading RX characteristic...');

      const characteristic = await connectedDevice.readCharacteristicForService(
        NUS_SERVICE_UUID,
        NUS_RX_CHARACTERISTIC_UUID,
      );

      if (characteristic.value) {
        const base64Data = characteristic.value;
        const bytes = Buffer.from(base64Data, 'base64');
        const hexString = Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');

        console.log('📖 [BluetoothDebug] Read value:', hexString);
        Alert.alert('读取成功', `${bytes.length} 字节:\n${hexString}`);
      } else {
        console.log('📖 [BluetoothDebug] No value to read');
        Alert.alert('读取结果', '特征值为空');
      }
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Read error:', error);
      Alert.alert('读取失败', error.message);
    }
  };

  // 停止数据流
  const stopDataStream = async () => {
    if (!connectedDevice) {
      Alert.alert('错误', '未连接设备');
      return;
    }

    try {
      console.log('✍️ [BluetoothDebug] Writing stop command: "sv"');

      // 发送字符串 'sv' 停止数据流
      const command = Buffer.from('sv').toString('base64');

      await connectedDevice.writeCharacteristicWithResponseForService(
        NUS_SERVICE_UUID,
        NUS_TX_CHARACTERISTIC_UUID,
        command,
      );

      console.log('✅ [BluetoothDebug] Stop command "sv" sent');
      Alert.alert('停止成功', '已发送停止命令 "sv"');
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Write error:', error);
      Alert.alert('写入失败', error.message);
    }
  };

  // 断开连接
  const disconnectDevice = async () => {
    if (!connectedDevice) {
      return;
    }

    console.log('🔌 [BluetoothDebug] Disconnecting from:', connectedDevice.id);

    try {
      if (isSubscribed) {
        await unsubscribeFromData();
      }

      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setServices([]);
      setShowServices(false);
      setIsSubscribed(false);
      setDataLog([]);
      setDataCount(0);
      console.log('✅ [BluetoothDebug] Disconnected');
      Alert.alert('已断开', '设备连接已断开');
    } catch (error: any) {
      console.error('❌ [BluetoothDebug] Disconnect error:', error);
      setConnectedDevice(null);
      setServices([]);
      setShowServices(false);
      setIsSubscribed(false);
      setDataLog([]);
      setDataCount(0);
    }
  };

  // 渲染设备项
  const renderDevice = ({ item }: { item: Device }) => {
    const isConnected = connectedDevice?.id === item.id;
    const deviceName = item.name || item.localName || 'Unknown Device';

    return (
      <TouchableOpacity
        style={[styles.deviceCard, isConnected && styles.deviceCardConnected]}
        onPress={() => connectToDevice(item)}
        disabled={isConnected}>
        <View style={styles.deviceHeader}>
          <Icon
            name={isConnected ? 'bluetooth' : 'bluetooth-outline'}
            size={24}
            color={isConnected ? theme.colors.success : theme.colors.primary}
          />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{deviceName}</Text>
            <Text style={styles.deviceId} numberOfLines={1}>
              {item.id}
            </Text>
          </View>
          <View style={styles.deviceMeta}>
            <Text style={styles.deviceRssi}>{item.rssi} dBm</Text>
            {isConnected && (
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedText}>{t('debug_connected')}</Text>
              </View>
            )}
          </View>
        </View>
        {isConnected && (
          <View style={styles.connectedActions}>
            <TouchableOpacity
              style={styles.servicesButton}
              onPress={() => setShowServices(!showServices)}>
              <Icon name="list-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.servicesButtonText}>
                {showServices ? t('action_hide') : t('action_view')} {t('debug_services')} ({services.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectDevice}>
              <Text style={styles.disconnectText}>{t('debug_disconnect')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 状态栏 */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Icon
            name="radio"
            size={20}
            color={bleState === State.PoweredOn ? theme.colors.success : theme.colors.error}
          />
          <Text style={styles.statusText}>
            {bleState === State.PoweredOn ? t('debug_ble_on') : t('debug_ble_off')}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Icon name="list" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.statusText}>
            {filteredDevices.length}/{devices.length} 设备
          </Text>
        </View>
      </View>

      {/* 过滤输入 */}
      <View style={styles.filterContainer}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.filterInput}
          placeholder="过滤设备名称（如：NV-BrainRF）"
          placeholderTextColor={theme.colors.textSecondary}
          value={filterText}
          onChangeText={setFilterText}
        />
        {filterText.length > 0 && (
          <TouchableOpacity onPress={() => setFilterText('')}>
            <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.scanButton,
            isScanning && styles.buttonDisabled,
          ]}
          onPress={startScan}
          disabled={isScanning}>
          <Icon name="search" size={20} color="white" />
          <Text style={styles.buttonText}>
            {isScanning ? t('debug_scan_scanning') : t('debug_scan_start')}
          </Text>
        </TouchableOpacity>

        {isScanning && (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopScan}>
            <Icon name="stop" size={20} color="white" />
            <Text style={styles.buttonText}>停止</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 数据控制面板 */}
      {connectedDevice && (
        <View style={styles.dataControlPanel}>
          <Text style={styles.dataPanelTitle}>📡 数据通信</Text>
          <View style={styles.dataControls}>
            <TouchableOpacity
              style={[
                styles.dataButton,
                styles.subscribeButton,
                isSubscribed && styles.dataButtonActive,
              ]}
              onPress={isSubscribed ? unsubscribeFromData : subscribeToData}>
              <Icon
                name={isSubscribed ? 'notifications' : 'notifications-outline'}
                size={18}
                color="white"
              />
              <Text style={styles.dataButtonText}>
                {isSubscribed ? t('debug_unsubscribe') : t('debug_subscribe')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 测试按钮 */}
          <View style={[styles.dataControls, { marginTop: 10 }]}>
            <TouchableOpacity
              style={[styles.dataButton, styles.testButton]}
              onPress={manuallyEnableCCCD}>
              <Icon name="flash-outline" size={18} color="white" />
              <Text style={styles.dataButtonText}>启用CCCD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dataButton, styles.testButton]}
              onPress={testReadCharacteristic}>
              <Icon name="book-outline" size={18} color="white" />
              <Text style={styles.dataButtonText}>测试读取</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.dataControls, { marginTop: 10 }]}>
            <TouchableOpacity
              style={[styles.dataButton, useWriteWithoutResponse ? styles.dataButtonActive : styles.testButton]}
              onPress={() => setUseWriteWithoutResponse(!useWriteWithoutResponse)}>
              <Icon name="settings-outline" size={18} color="white" />
              <Text style={styles.dataButtonText}>
                {useWriteWithoutResponse ? '无响应写' : '有响应写'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 自定义命令输入 */}
          {isSubscribed && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.commandInputLabel}>自定义命令:</Text>
              <View style={styles.commandInputContainer}>
                <TextInput
                  style={styles.commandInput}
                  value={customCommand}
                  onChangeText={setCustomCommand}
                  placeholder="输入命令 (如: b, sv, AT)"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={[styles.dataButton, styles.sendButton, { flex: 0, paddingHorizontal: 20 }]}
                  onPress={startDataStream}>
                  <Icon name="send" size={18} color="white" />
                  <Text style={styles.dataButtonText}>发送</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 快捷命令按钮 */}
          {isSubscribed && (
            <View style={[styles.dataControls, { marginTop: 10 }]}>
              <TouchableOpacity
                style={[styles.dataButton, styles.startButton]}
                onPress={() => sendCustomCommand('b')}>
                <Icon name="play" size={18} color="white" />
                <Text style={styles.dataButtonText}>快捷: b</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dataButton, styles.stopStreamButton]}
                onPress={stopDataStream}>
                <Icon name="stop" size={18} color="white" />
                <Text style={styles.dataButtonText}>快捷: sv</Text>
              </TouchableOpacity>
            </View>
          )}

          {isSubscribed && (
            <View style={styles.dataStats}>
              <Icon name="analytics" size={16} color={theme.colors.success} />
              <Text style={styles.dataStatsText}>
                已接收: {dataCount} 包 (RX-0003 + RX2-0004) | 日志: {dataLog.length} 条
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 数据日志显示 */}
      {isSubscribed && dataLog.length > 0 && (
        <View style={styles.dataLogContainer}>
          <Text style={styles.dataLogTitle}>📊 实时数据日志 (双通道)</Text>
          <ScrollView
            style={styles.dataLogScroll}
            contentContainerStyle={styles.dataLogContent}
            ref={scrollViewRef => {
              if (scrollViewRef) {
                scrollViewRef.scrollToEnd({ animated: true });
              }
            }}>
            {dataLog.map((log, index) => (
              <Text key={index} style={styles.logEntry}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 设备列表 */}
      <FlatList
        data={filteredDevices}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="bluetooth-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {isScanning
                ? '正在搜索设备...'
                : filterText
                  ? `未找到包含 "${filterText}" 的设备`
                  : '点击开始扫描按钮'}
            </Text>
            {!isScanning && (
              <Text style={styles.emptyHint}>
                💡 确保蓝牙和位置服务已开启
              </Text>
            )}
          </View>
        }
      />

      {/* 服务和特征列表 */}
      {showServices && connectedDevice && services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>
            📋 Services & Characteristics ({services.length})
          </Text>
          {services.map((service, serviceIndex) => (
            <View key={service.uuid} style={styles.serviceCard}>
              <Text style={styles.serviceUuid}>Service: {service.uuid}</Text>
              {service.characteristics.map((char: any, charIndex: number) => (
                <View key={char.uuid} style={styles.charCard}>
                  <Text style={styles.charUuid}>{char.uuid}</Text>
                  <View style={styles.charProperties}>
                    {char.isReadable && (
                      <View style={styles.propertyBadge}>
                        <Text style={styles.propertyText}>Read</Text>
                      </View>
                    )}
                    {char.isWritableWithResponse && (
                      <View style={styles.propertyBadge}>
                        <Text style={styles.propertyText}>Write</Text>
                      </View>
                    )}
                    {char.isNotifiable && (
                      <View style={styles.propertyBadge}>
                        <Text style={styles.propertyText}>Notify</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* 调试信息 */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          📊 调试信息 | 状态: {bleState} | 平台: {Platform.OS}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  deviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  deviceCardConnected: {
    borderColor: theme.colors.success,
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  deviceMeta: {
    alignItems: 'flex-end',
  },
  deviceRssi: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  connectedBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  connectedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  connectedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  servicesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 4,
  },
  servicesButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.error,
    borderRadius: 6,
  },
  disconnectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  servicesContainer: {
    maxHeight: 300,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  serviceUuid: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  charCard: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  charUuid: {
    fontSize: 11,
    color: theme.colors.text,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  charProperties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  propertyBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  propertyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  debugInfo: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  debugText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dataControlPanel: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  dataPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  dataControls: {
    flexDirection: 'row',
    gap: 10,
  },
  dataButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopStreamButton: {
    backgroundColor: '#EF4444',
  },
  testButton: {
    backgroundColor: '#8B5CF6',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
  },
  dataButtonActive: {
    backgroundColor: '#F59E0B',
  },
  commandInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  commandInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  commandInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  dataButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dataStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  dataStatsText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dataLogContainer: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#333',
  },
  dataLogTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    padding: 12,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dataLogScroll: {
    flex: 1,
  },
  dataLogContent: {
    padding: 12,
  },
  logEntry: {
    fontSize: 11,
    color: '#00ff00',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
    lineHeight: 16,
  },
});

export default BluetoothDebugScreen;

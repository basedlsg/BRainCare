import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {BleManager, Device, State} from 'react-native-ble-plx';

const BleTestScreen = () => {
  const [bleManager] = useState(() => new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bleState, setBleState] = useState<State>(State.Unknown);

  useEffect(() => {
    // 监听蓝牙状态
    const subscription = bleManager.onStateChange(state => {
      console.log('📡 BLE State:', state);
      setBleState(state);
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
      bleManager.destroy();
    };
  }, [bleManager]);

  // 请求 Android 权限
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Platform.Version as number;
      console.log('🔐 Android API Level:', apiLevel);

      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        console.log('🔐 Permissions:', results);

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
      console.error('❌ Permission error:', error);
      return false;
    }
  };

  // 开始扫描
  const startScan = async () => {
    console.log('\n🔍 ===== STARTING SCAN =====');

    // 1. 检查权限
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('权限不足', '请在设置中授予蓝牙和位置权限');
      return;
    }
    console.log('✅ Permissions granted');

    // 2. 检查蓝牙状态
    const state = await bleManager.state();
    console.log('📡 Current BLE State:', state);

    if (state !== State.PoweredOn) {
      Alert.alert(
        '蓝牙未开启',
        `当前状态: ${state}\n\n请确保：\n1. 蓝牙已开启\n2. 位置服务（GPS）已开启`,
      );
      return;
    }
    console.log('✅ Bluetooth is powered on');

    // 3. 清空设备列表
    setDevices([]);
    setIsScanning(true);

    // 4. 开始扫描
    console.log('🔍 Starting device scan...');
    console.log('📝 Scan options: allowDuplicates=true, no UUID filter');

    bleManager.startDeviceScan(
      null, // 扫描所有设备，不过滤 UUID
      {allowDuplicates: true}, // 允许重复发现设备以更新 RSSI
      (error, device) => {
        if (error) {
          console.error('❌ Scan error:', error);
          setIsScanning(false);
          Alert.alert('扫描错误', error.message);
          return;
        }

        if (device) {
          console.log('📱 Device found:', {
            id: device.id,
            name: device.name || device.localName || 'Unknown',
            rssi: device.rssi,
          });

          // 更新设备列表
          setDevices(prev => {
            const index = prev.findIndex(d => d.id === device.id);
            if (index !== -1) {
              // 更新已存在的设备
              const updated = [...prev];
              updated[index] = device;
              return updated;
            }
            // 添加新设备
            return [...prev, device];
          });
        }
      },
    );

    console.log('✅ Scan started, listening for devices...');

    // 5. 10秒后自动停止
    setTimeout(() => {
      stopScan();
    }, 10000);
  };

  // 停止扫描
  const stopScan = () => {
    console.log('🛑 Stopping scan...');
    bleManager.stopDeviceScan();
    setIsScanning(false);
    console.log('✅ Scan stopped');
    console.log(`📊 Total devices found: ${devices.length}`);
  };

  // 渲染设备项
  const renderDevice = ({item}: {item: Device}) => (
    <View style={styles.deviceCard}>
      <Text style={styles.deviceName}>
        {item.name || item.localName || 'Unknown Device'}
      </Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
      <Text style={styles.deviceRssi}>RSSI: {item.rssi} dBm</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE 扫描测试</Text>
        <Text style={styles.state}>
          状态: {bleState} {bleState === State.PoweredOn ? '✅' : '❌'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isScanning && styles.buttonDisabled]}
          onPress={startScan}
          disabled={isScanning}>
          <Text style={styles.buttonText}>
            {isScanning ? '扫描中...' : '开始扫描'}
          </Text>
        </TouchableOpacity>

        {isScanning && (
          <TouchableOpacity style={styles.stopButton} onPress={stopScan}>
            <Text style={styles.buttonText}>停止扫描</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>发现设备: {devices.length}</Text>
        {isScanning && <Text style={styles.scanning}>🔍 扫描中...</Text>}
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isScanning ? '正在搜索设备...' : '点击开始扫描按钮'}
          </Text>
        }
      />

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>💡 提示:</Text>
        <Text style={styles.tipsText}>• 确保蓝牙已开启</Text>
        <Text style={styles.tipsText}>• 确保位置服务（GPS）已开启</Text>
        <Text style={styles.tipsText}>• 扫描会持续10秒后自动停止</Text>
        <Text style={styles.tipsText}>
          • 查看 Metro bundler 控制台的详细日志
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  state: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scanning: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  deviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
  tips: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});

export default BleTestScreen;

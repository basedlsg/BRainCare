import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface BleConnectionDrawerProps {
  visible: boolean;
  onClose: () => void;
  onDeviceConnected: (device: Device) => void;
}

const BleConnectionDrawer: React.FC<BleConnectionDrawerProps> = ({
  visible,
  onClose,
  onDeviceConnected,
}) => {
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bleState, setBleState] = useState<State>(State.Unknown);
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(
    null,
  );

  // Create BleManager lazily only when drawer becomes visible for the first time
  const bleManagerRef = useRef<BleManager | null>(null);

  const getBleManager = (): BleManager | null => {
    if (!bleManagerRef.current) {
      try {
        console.log('🔧 Creating BleManager instance...');
        bleManagerRef.current = new BleManager();
        console.log('✅ BleManager created successfully');
      } catch (error) {
        console.error('❌ Failed to create BleManager:', error);
        return null;
      }
    }
    return bleManagerRef.current;
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    const bleManager = getBleManager();
    if (!bleManager) {
      console.error('❌ BleManager is not available');
      return;
    }

    // 监听蓝牙状态
    const subscription = bleManager.onStateChange(state => {
      console.log('📡 BLE State:', state);
      setBleState(state);
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    };
  }, [visible]);

  // 请求 Android 权限
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Platform.Version as number;

      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

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
    const bleManager = getBleManager();
    if (!bleManager) {
      Alert.alert(t('ble_error_title'), t('ble_error_manager'));
      return;
    }

    console.log('\n🔍 ===== STARTING SCAN =====');

    // 1. 检查权限
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(t('ble_permission_title'), t('ble_error_permission'));
      return;
    }

    // 2. 检查蓝牙状态
    const state = await bleManager.state();
    if (state !== State.PoweredOn) {
      Alert.alert(t('ble_not_enabled_title'), t('ble_error_not_enabled'));
      return;
    }

    // 3. 清空设备列表
    setDevices([]);
    setIsScanning(true);

    // 4. 开始扫描
    console.log('🔍 Starting device scan...');

    bleManager.startDeviceScan(
      null, // 扫描所有设备
      { allowDuplicates: true }, // 允许重复发现设备以更新 RSSI
      (error, device) => {
        if (error) {
          console.error('❌ Scan error:', error);
          setIsScanning(false);
          Alert.alert(t('ble_error_scan'), error.message);
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
              console.log(`🔄 Updated device: ${device.name || device.id}, total: ${updated.length}`);
              return updated;
            }
            // 添加新设备
            const newList = [...prev, device];
            console.log(`➕ Added device: ${device.name || device.id}, total: ${newList.length}`);
            return newList;
          });
        }
      },
    );

    // 5. 10秒后自动停止
    setTimeout(() => {
      stopScan();
    }, 10000);
  };

  // 停止扫描
  const stopScan = () => {
    const bleManager = bleManagerRef.current;
    if (!bleManager) {
      return;
    }
    console.log('🛑 Stopping scan...');
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  // 连接设备
  const connectToDevice = async (device: Device) => {
    try {
      setConnectingDeviceId(device.id);
      console.log(`🔗 Connecting to device: ${device.name || device.id}`);

      // 停止扫描
      stopScan();

      // 连接设备
      const connectedDevice = await device.connect();
      console.log('✅ Device connected');

      // 发现服务和特征
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('✅ Services discovered');

      // 连接成功回调
      onDeviceConnected(connectedDevice);

      // 关闭抽屉
      onClose();
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      Alert.alert(t('ble_connect_failed'), error.message || t('ble_connect_failed_msg'));
    } finally {
      setConnectingDeviceId(null);
    }
  };

  // 渲染设备项
  const renderDevice = ({ item }: { item: Device }) => {
    const isConnecting = connectingDeviceId === item.id;
    const deviceName = item.name || item.localName || 'Unknown Device';
    const isNVBrainRF = deviceName.toLowerCase().includes('nv-brainrf') ||
      deviceName.toLowerCase().includes('brainrf');

    return (
      <TouchableOpacity
        style={[
          styles.deviceCard,
          isNVBrainRF && styles.deviceCardHighlight,
        ]}
        onPress={() => connectToDevice(item)}
        disabled={isConnecting}>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceHeader}>
            <Icon
              name={isNVBrainRF ? "bluetooth" : "bluetooth-outline"}
              size={20}
              color={isNVBrainRF ? theme.colors.success : theme.colors.primary}
            />
            <Text
              style={[
                styles.deviceName,
                isNVBrainRF && styles.deviceNameHighlight,
              ]}
              numberOfLines={1}>
              {deviceName}
            </Text>
            {isNVBrainRF && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>{t('ble_recommended')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.deviceId} numberOfLines={1}>
            {item.id}
          </Text>
          <Text style={styles.deviceRssi}>{t('ble_signal_strength')}: {item.rssi} dBm</Text>
        </View>
        {isConnecting ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Icon
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.drawer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>{t('ble_drawer_title')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        bleState === State.PoweredOn
                          ? theme.colors.success
                          : theme.colors.error,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {t('ble_status_label')}: {bleState === State.PoweredOn ? t('ble_status_on') : t('ble_status_off')}
                </Text>
              </View>
              {isScanning && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <Text style={styles.scanningText}>{t('ble_scanning')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.scanButton,
                isScanning && styles.scanButtonActive,
              ]}
              onPress={isScanning ? stopScan : startScan}
              disabled={bleState !== State.PoweredOn}>
              <Icon
                name={isScanning ? 'stop' : 'search'}
                size={20}
                color={theme.colors.surface}
              />
              <Text style={styles.scanButtonText}>
                {isScanning ? t('ble_stop_scan') : t('ble_start_scan')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.deviceCount}>{t('ble_devices_found')}: {devices.length}</Text>
          </View>

          {/* Device List */}
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="bluetooth-outline"
                  size={48}
                  color={theme.colors.textLight}
                />
                <Text style={styles.emptyText}>
                  {isScanning ? t('ble_searching') : t('ble_tap_to_scan')}
                </Text>
              </View>
            }
          />

          {/* Tips */}
          <View style={styles.tips}>
            <Icon
              name="information-circle"
              size={16}
              color={theme.colors.info}
            />
            <Text style={styles.tipsText}>
              {t('ble_tips')}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    height: '85%', // 使用固定高度而不是 maxHeight
    ...theme.shadows.xl,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: theme.spacing.sm,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  scanningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  scanButtonActive: {
    backgroundColor: theme.colors.error,
  },
  scanButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.surface,
  },
  deviceCount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  list: {
    flex: 1,
    backgroundColor: 'transparent', // 确保背景透明
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm, // 添加顶部间距
    paddingBottom: theme.spacing.lg,
    flexGrow: 1, // 确保内容可以滚动
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md, // 使用 marginBottom 而不是 marginTop
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.xs,
  },
  deviceInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  deviceName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  deviceId: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.info + '15',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  tipsText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.info,
    lineHeight: 16,
  },
  // NV-BrainRF 设备高亮样式
  deviceCardHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    backgroundColor: theme.colors.success + '08',
  },
  deviceNameHighlight: {
    color: theme.colors.success,
    fontWeight: theme.fontWeight.bold,
  },
  recommendedBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  recommendedText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default BleConnectionDrawer;

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {theme} from '../styles/theme';
import {BluetoothDevice, ConnectionState} from '../types/bluetooth';

interface BluetoothDeviceCardProps {
  device: BluetoothDevice;
  connectionState: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
}

const BluetoothDeviceCard: React.FC<BluetoothDeviceCardProps> = ({
  device,
  connectionState,
  onConnect,
  onDisconnect,
}) => {
  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;
  const isDisconnecting = connectionState === ConnectionState.DISCONNECTING;

  // 信号强度图标和颜色
  const getSignalIcon = (rssi: number) => {
    if (rssi >= -60) {
      return {name: 'signal', color: theme.colors.success};
    }
    if (rssi >= -75) {
      return {name: 'signal', color: theme.colors.warning};
    }
    return {name: 'signal', color: theme.colors.error};
  };

  const signalIcon = getSignalIcon(device.rssi);

  return (
    <View style={styles.card}>
      <View style={styles.deviceInfo}>
        {/* 蓝牙图标 */}
        <View style={[styles.iconContainer, isConnected && styles.iconContainerConnected]}>
          <Icon
            name="bluetooth"
            size={20}
            color={isConnected ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>

        {/* 设备信息 */}
        <View style={styles.infoContainer}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {device.name || '未知设备'}
          </Text>
          <Text style={styles.deviceId} numberOfLines={1}>
            {device.id}
          </Text>
        </View>

        {/* 信号强度 */}
        <View style={styles.signalContainer}>
          <Icon name={signalIcon.name} size={16} color={signalIcon.color} />
          <Text style={[styles.rssiText, {color: signalIcon.color}]}>
            {device.rssi} dBm
          </Text>
        </View>
      </View>

      {/* 连接按钮 */}
      <TouchableOpacity
        style={[
          styles.button,
          isConnected && styles.buttonDisconnect,
          (isConnecting || isDisconnecting) && styles.buttonDisabled,
        ]}
        onPress={isConnected ? onDisconnect : onConnect}
        disabled={isConnecting || isDisconnecting}>
        {isConnecting || isDisconnecting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isConnected ? '断开' : '连接'}
          </Text>
        )}
      </TouchableOpacity>

      {/* 连接状态指示器 */}
      {isConnected && (
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>已连接</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerConnected: {
    backgroundColor: theme.colors.primaryLight + '20',
  },
  infoContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  deviceName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  deviceId: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rssiText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  buttonDisconnect: {
    backgroundColor: theme.colors.error,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },
});

export default BluetoothDeviceCard;

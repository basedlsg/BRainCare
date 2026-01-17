import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {theme} from '../styles/theme';
import {DeviceType} from '../types/eeg';

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

interface BluetoothStatusBarProps {
  status: ConnectionStatus;
  deviceName?: string;
  deviceType?: DeviceType;
  signalStrength?: number; // RSSI
  onPress: () => void;
}

const BluetoothStatusBar: React.FC<BluetoothStatusBarProps> = ({
  status,
  deviceName,
  deviceType,
  signalStrength,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return theme.colors.success;
      case ConnectionStatus.CONNECTING:
        return theme.colors.warning;
      case ConnectionStatus.DISCONNECTED:
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return '已连接';
      case ConnectionStatus.CONNECTING:
        return '连接中...';
      case ConnectionStatus.DISCONNECTED:
        return '未连接';
      default:
        return '未知';
    }
  };

  const getDeviceTypeText = () => {
    switch (deviceType) {
      case DeviceType.OPENBCI_8CH:
        return '8通道';
      case DeviceType.DUAL_2CH:
        return '2通道';
      default:
        return '';
    }
  };

  const getSignalIcon = () => {
    if (!signalStrength) return 'cellular-outline';

    // RSSI 信号强度分级
    if (signalStrength >= -60) return 'cellular'; // 强信号
    if (signalStrength >= -70) return 'cellular-outline'; // 中等信号
    return 'cellular-outline'; // 弱信号
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        status === ConnectionStatus.CONNECTED && styles.containerConnected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={[styles.statusDot, {backgroundColor: getStatusColor()}]} />
        <Icon
          name="bluetooth"
          size={20}
          color={getStatusColor()}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {status === ConnectionStatus.CONNECTED && deviceName && (
            <Text style={styles.deviceName} numberOfLines={1}>
              {deviceName}
              {deviceType && deviceType !== DeviceType.UNKNOWN && (
                <Text style={styles.deviceType}> · {getDeviceTypeText()}</Text>
              )}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {status === ConnectionStatus.CONNECTED && signalStrength && (
          <View style={styles.signalContainer}>
            <Icon
              name={getSignalIcon()}
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.signalText}>{signalStrength} dBm</Text>
          </View>
        )}
        <Icon
          name={
            status === ConnectionStatus.CONNECTED
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  containerConnected: {
    borderColor: theme.colors.success + '40',
    backgroundColor: theme.colors.success + '08',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  deviceName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  deviceType: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});

export default BluetoothStatusBar;

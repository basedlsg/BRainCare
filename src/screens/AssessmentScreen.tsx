import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import CustomerService from '../components/CustomerService';
import BluetoothStatusBar, { ConnectionStatus } from '../components/BluetoothStatusBar';
import BleConnectionDrawer from '../components/BleConnectionDrawer';
import EEGWaveformChart from '../components/EEGWaveformChart';
import EEGDataDisplay from '../components/EEGDataDisplay';
import { useEEGData } from '../hooks/useEEGData';
import { DeviceType } from '../types/eeg';
import { useLanguage } from '../i18n/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import ConsumerModeScreen from './ConsumerModeScreen';

const AssessmentScreen = () => {
  const { t } = useLanguage();
  const { showRawWaveforms } = useSettings();
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [showBleDrawer, setShowBleDrawer] = useState(false);

  // 使用 EEG 数据 hook
  const {
    isConnected,
    connectedDevice,
    latestData,
    waveformData,
    statistics,
    connectDevice,
    disconnectDevice,
  } = useEEGData();

  // 处理设备连接
  const handleDeviceConnected = async (device: any) => {
    try {
      await connectDevice(device);
      setShowBleDrawer(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // 获取蓝牙连接状态
  const getConnectionStatus = (): ConnectionStatus => {
    return isConnected
      ? ConnectionStatus.CONNECTED
      : ConnectionStatus.DISCONNECTED;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('assessment_title')}</Text>
        <TouchableOpacity
          style={styles.customerServiceBtn}
          onPress={() => setShowCustomerService(true)}
        >
          <Icon name="pulse-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Bluetooth Status Bar */}
      <BluetoothStatusBar
        status={getConnectionStatus()}
        deviceName={connectedDevice?.name || connectedDevice?.id}
        deviceType={latestData?.deviceType}
        signalStrength={connectedDevice?.rssi ?? undefined}
        onPress={() => setShowBleDrawer(true)}
      />

      {/* Real-time EEG Waveform or Consumer Dashboard */}
      {isConnected && (
        <View style={styles.section}>
          {showRawWaveforms ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('realtime_wave')}</Text>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                  <Text style={styles.statusText}>
                    {statistics.currentFrameRate} Hz | {waveformData.length} {t('points')}
                  </Text>
                </View>
              </View>
              <EEGWaveformChart
                data={waveformData}
                deviceType={latestData?.deviceType || DeviceType.UNKNOWN}
                maxDataPoints={2500}
              />
            </>
          ) : (
            <ConsumerModeScreen
              relaxation={latestData?.relaxation || 0}
              focus={latestData?.focus || 0}
              fatigue={latestData?.fatigue || 0}
            />
          )}
        </View>
      )}

      {/* Real-time EEG Data Display (Only in Developer Mode?) */}
      {isConnected && showRawWaveforms && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('realtime_data')}</Text>
          <EEGDataDisplay data={latestData} />
        </View>
      )}

      <CustomerService
        visible={showCustomerService}
        onClose={() => setShowCustomerService(false)}
      />

      {/* BLE Connection Drawer */}
      <BleConnectionDrawer
        visible={showBleDrawer}
        onClose={() => setShowBleDrawer(false)}
        onDeviceConnected={handleDeviceConnected}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  customerServiceBtn: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    ...theme.shadows.xs,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default AssessmentScreen;
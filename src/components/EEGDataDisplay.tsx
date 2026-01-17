import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {theme} from '../styles/theme';
import {ParsedEEGData, DeviceType} from '../types/eeg';

interface EEGDataDisplayProps {
  data: ParsedEEGData | null;
}

const EEGDataDisplay: React.FC<EEGDataDisplayProps> = ({data}) => {
  if (!data || !data.packet) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="pulse-outline"
          size={48}
          color={theme.colors.textLight}
        />
        <Text style={styles.emptyText}>等待 EEG 数据...</Text>
      </View>
    );
  }

  const {packet, deviceType} = data;

  // 根据设备类型筛选要显示的通道
  const displayChannels =
    deviceType === DeviceType.DUAL_2CH
      ? packet.channels.filter(ch => ch.channelIndex < 3) // FP1, FP2, Temperature
      : packet.channels;

  return (
    <View style={styles.container}>
      {/* EEG 通道数据 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>脑电通道</Text>
        <View style={styles.channelGrid}>
          {displayChannels.map((channel, index) => {
            // 2通道设备跳过温度显示在通道中
            if (deviceType === DeviceType.DUAL_2CH && channel.channelIndex === 2) {
              return null;
            }

            return (
              <View key={index} style={styles.channelCard}>
                <View style={styles.channelHeader}>
                  <View
                    style={[
                      styles.channelIndicator,
                      {backgroundColor: getChannelColor(channel.channelIndex)},
                    ]}
                  />
                  <Text style={styles.channelName}>{channel.channelName}</Text>
                </View>
                <Text style={styles.channelValue}>
                  {channel.value.toFixed(2)}
                </Text>
                <Text style={styles.channelUnit}>μV</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 温度数据 (仅2通道设备) */}
      {deviceType === DeviceType.DUAL_2CH && packet.temperature !== undefined && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>温度</Text>
          <View style={styles.dataCard}>
            <Icon
              name="thermometer-outline"
              size={24}
              color={theme.colors.healthOrange}
            />
            <Text style={styles.dataValue}>{Math.round(packet.temperature)}</Text>
            <Text style={styles.dataUnit}>°C</Text>
          </View>
        </View>
      )}

      {/* 加速度计数据 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>加速度计</Text>
        <View style={styles.axisGrid}>
          <View style={styles.axisCard}>
            <Text style={styles.axisLabel}>X</Text>
            <Text style={styles.axisValue}>
              {packet.accelerometer.x.toFixed(0)}
            </Text>
          </View>
          <View style={styles.axisCard}>
            <Text style={styles.axisLabel}>Y</Text>
            <Text style={styles.axisValue}>
              {packet.accelerometer.y.toFixed(0)}
            </Text>
          </View>
          <View style={styles.axisCard}>
            <Text style={styles.axisLabel}>Z</Text>
            <Text style={styles.axisValue}>
              {packet.accelerometer.z.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* 陀螺仪数据 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>陀螺仪</Text>
        <View style={styles.axisGrid}>
          <View style={styles.axisCard}>
            <Text style={styles.axisLabel}>X</Text>
            <Text style={styles.axisValue}>
              {packet.gyroscope.x.toFixed(2)}
            </Text>
          </View>
          <View style={styles.axisCard}>
            <Text style={styles.axisLabel}>Y</Text>
            <Text style={styles.axisValue}>
              {packet.gyroscope.y.toFixed(2)}
            </Text>
          </View>
          <View style={styles.axisCard}>
            <Text style={styles.axisLabel}>Z</Text>
            <Text style={styles.axisValue}>
              {packet.gyroscope.z.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* 数据包信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据包</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>帧计数</Text>
            <Text style={styles.infoValue}>{packet.frameCounter}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>采样率</Text>
            <Text style={styles.infoValue}>{data.sampleRate} Hz</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>设备类型</Text>
            <Text style={styles.infoValue}>
              {deviceType === DeviceType.OPENBCI_8CH ? '8通道' : '2通道'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 获取通道颜色
const getChannelColor = (index: number): string => {
  const colors = [
    theme.colors.healthBlue,
    theme.colors.healthGreen,
    theme.colors.healthPurple,
    theme.colors.healthOrange,
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.info,
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  channelCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '48%',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  channelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelName: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  channelValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  channelUnit: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  dataCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  dataValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  dataUnit: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  axisGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  axisCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  axisLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  axisValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  axisUnit: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});

export default EEGDataDisplay;

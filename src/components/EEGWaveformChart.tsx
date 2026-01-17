import React, {useMemo, useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Ionicons';
import {theme} from '../styles/theme';
import {EEGWaveformDataPoint, DeviceType} from '../types/eeg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
// 确保图表不超出屏幕，预留左右边距和 Y 轴空间
const CHART_PADDING = theme.spacing.lg * 2; // 左右边距
const Y_AXIS_WIDTH = 50; // Y 轴宽度
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING - Y_AXIS_WIDTH;

// 固定间距，避免动态计算导致无限循环
const FIXED_SPACING = 0.15;

interface EEGWaveformChartProps {
  data: EEGWaveformDataPoint[];
  deviceType: DeviceType;
  maxDataPoints?: number; // 最多显示的数据点数
}

const EEGWaveformChart: React.FC<EEGWaveformChartProps> = ({
  data,
  deviceType,
  maxDataPoints = 2500, // 默认显示10秒数据 (250Hz * 10s) - 优化性能
}) => {
  // 平滑开关状态
  const [enableSmooth, setEnableSmooth] = useState(true);

  // 节流渲染：每150ms最多更新一次
  const [throttledData, setThrottledData] = useState<EEGWaveformDataPoint[]>([]);
  const dataRef = useRef<EEGWaveformDataPoint[]>(data);
  const lastDataLengthRef = useRef<number>(0);

  // 使用 useEffect 跟踪最新的 data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 使用定时器定期更新节流数据
  useEffect(() => {
    const interval = setInterval(() => {
      // 只有当数据长度变化时才更新
      if (dataRef.current.length !== lastDataLengthRef.current) {
        setThrottledData([...dataRef.current]);
        lastDataLengthRef.current = dataRef.current.length;
      }
    }, 150); // 每150ms检查一次（约6-7 FPS）

    return () => clearInterval(interval);
  }, []);

  // 根据设备类型确定通道数
  const channelCount = deviceType === DeviceType.DUAL_2CH ? 2 : 8;

  // 通道名称
  const channelNames = useMemo(() => {
    if (deviceType === DeviceType.DUAL_2CH) {
      return ['FP1', 'FP2'];
    }
    return [
      'CH1',
      'CH2',
      'CH3',
      'CH4',
      'CH5',
      'CH6',
      'CH7',
      'CH8',
    ];
  }, [deviceType]);

  // 通道颜色
  const channelColors = useMemo(() => {
    return [
      theme.colors.healthBlue,
      theme.colors.healthGreen,
      theme.colors.healthPurple,
      theme.colors.healthOrange,
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.info,
    ];
  }, []);

  // 限制数据点数量
  const limitedData = useMemo(() => {
    if (throttledData.length <= maxDataPoints) {
      return throttledData;
    }
    return throttledData.slice(throttledData.length - maxDataPoints);
  }, [throttledData, maxDataPoints]);

  // 计算 Y 轴范围 - 根据平滑开关决定是否应用平滑算法 (必须在 early return 之前)
  const {minY, maxY} = useMemo(() => {
    if (limitedData.length === 0) {
      return {minY: -169, maxY: -68};
    }

    let min = Infinity;
    let max = -Infinity;

    limitedData.forEach(point => {
      point.values.slice(0, channelCount).forEach(value => {
        if (value < min) min = value;
        if (value > max) max = value;
      });
    });

    // 如果没有有效数据
    if (min === Infinity || max === -Infinity) {
      return {minY: -169, maxY: -68};
    }

    // 如果启用平滑，增加边距和最小范围保护
    if (enableSmooth) {
      // 增加 30% 边距防止波形贴边
      const range = max - min;
      const padding = range * 0.3;

      let smoothMin = min - padding;
      let smoothMax = max + padding;

      // 最小范围保护：确保至少有 100μV 的显示范围
      const minRange = 100;
      if (smoothMax - smoothMin < minRange) {
        const center = (smoothMax + smoothMin) / 2;
        smoothMin = center - minRange / 2;
        smoothMax = center + minRange / 2;
      }

      return {
        minY: Math.floor(smoothMin),
        maxY: Math.ceil(smoothMax),
      };
    } else {
      // 原始模式：使用实际的最小/最大值
      return {
        minY: Math.floor(min),
        maxY: Math.ceil(max),
      };
    }
  }, [limitedData, channelCount, enableSmooth]);

  // 准备图表数据 - 每个通道一条线
  // react-native-gifted-charts 只支持正值，所以需要将数据平移
  const chartData = useMemo(() => {
    if (limitedData.length === 0) {
      return [];
    }

    const lines = [];
    const offset = -minY; // 将最小值平移到0

    for (let ch = 0; ch < channelCount; ch++) {
      const lineData = limitedData.map((point, index) => ({
        value: (point.values[ch] || 0) + offset, // 平移到正值范围
        dataPointText: '', // 不显示数据点文本
      }));

      lines.push({
        data: lineData,
        color: channelColors[ch],
        thickness: 1.5,
        strokeDashArray: [],
        startOpacity: 0.9,
        endOpacity: 0.9,
        hideDataPoints: true, // 隐藏数据点，只显示线
      });
    }

    return lines;
  }, [limitedData, channelCount, channelColors, minY]);

  if (limitedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>等待波形数据...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 图例和控制栏 */}
      <View style={styles.controlBar}>
        <View style={styles.legend}>
          {channelNames.map((name, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {backgroundColor: channelColors[index]},
                ]}
              />
              <Text style={styles.legendText}>{name}</Text>
            </View>
          ))}
        </View>

        {/* 平滑开关 */}
        <TouchableOpacity
          style={[
            styles.smoothToggle,
            enableSmooth && styles.smoothToggleActive,
          ]}
          onPress={() => setEnableSmooth(!enableSmooth)}>
          <Icon
            name={enableSmooth ? 'options' : 'pulse'}
            size={16}
            color={enableSmooth ? theme.colors.surface : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.smoothToggleText,
              enableSmooth && styles.smoothToggleTextActive,
            ]}>
            {enableSmooth ? '平滑' : '原始'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 波形图 */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData[0]?.data || []}
          data2={chartData[1]?.data}
          data3={chartData[2]?.data}
          data4={chartData[3]?.data}
          data5={chartData[4]?.data}
          // LineChart 最多支持5条线，如果是8通道需要分两个图表
          width={CHART_WIDTH - 60}
          height={250}
          maxValue={maxY - minY}
          noOfSections={6}
          color={chartData[0]?.color}
          color2={chartData[1]?.color}
          color3={chartData[2]?.color}
          color4={chartData[3]?.color}
          color5={chartData[4]?.color}
          thickness={2}
          hideDataPoints
          hideRules={false}
          rulesColor={theme.colors.borderLight}
          rulesThickness={0.5}
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.xAxisText}
          yAxisColor={theme.colors.border}
          xAxisColor={theme.colors.border}
          animateOnDataChange={false}
          formatYLabel={(label: string) => {
            const value = parseFloat(label) + minY;
            return value.toFixed(0);
          }}
          yAxisLabelSuffix=" μV"
          spacing={FIXED_SPACING}
        />
      </View>

      {/* 如果是8通道，显示第二个图表 */}
      {deviceType === DeviceType.OPENBCI_8CH && chartData.length > 5 && (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData[5]?.data || []}
            data2={chartData[6]?.data}
            data3={chartData[7]?.data}
            width={CHART_WIDTH - 60}
            height={250}
            maxValue={maxY - minY}
            noOfSections={6}
            color={chartData[5]?.color}
            color2={chartData[6]?.color}
            color3={chartData[7]?.color}
            thickness={2}
            hideDataPoints
            hideRules={false}
            rulesColor={theme.colors.borderLight}
            rulesThickness={0.5}
            yAxisTextStyle={styles.yAxisText}
            xAxisLabelTextStyle={styles.xAxisText}
            yAxisColor={theme.colors.border}
            xAxisColor={theme.colors.border}
            animateOnDataChange={false}
            formatYLabel={(label: string) => {
              const value = parseFloat(label) + minY;
              return value.toFixed(0);
            }}
            yAxisLabelSuffix=" μV"
            spacing={FIXED_SPACING}
          />
        </View>
      )}

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>数据点</Text>
          <Text style={styles.statValue}>{limitedData.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>时长</Text>
          <Text style={styles.statValue}>
            {(limitedData.length / 250).toFixed(1)}s
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>范围</Text>
          <Text style={styles.statValue}>
            {minY.toFixed(0)} ~ {maxY.toFixed(0)} μV
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    flex: 1,
  },
  smoothToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  smoothToggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  smoothToggleText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  smoothToggleTextActive: {
    color: theme.colors.surface,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  chartContainer: {
    marginVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  yAxisText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  xAxisText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxxl,
    marginHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});

export default EEGWaveformChart;

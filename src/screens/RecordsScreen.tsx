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

// const { width } = Dimensions.get('window');

type PeriodType = 'week' | 'month';

interface StatItem {
  name: string;
  value: number;
  target: number;
  trend: number;
  unit: string;
  color: string;
}

interface SleepData {
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
}

const RecordsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showCustomerService, setShowCustomerService] = useState(false);

  const periods = [
    { key: 'week', title: '周' },
    { key: 'month', title: '月' },
  ];

  const getCurrentPeriodText = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1 + currentWeek * 7); // 周一开始
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // 到周日
        return `${startOfWeek.getFullYear()}年${(startOfWeek.getMonth() + 1)}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
      case 'month':
        const month = new Date(now.getFullYear(), now.getMonth() + currentWeek, 1);
        return `${month.getFullYear()}年${month.getMonth() + 1}月`;
      default:
        return '';
    }
  };

  const getTotalRecordDays = () => {
    switch (selectedPeriod) {
      case 'week':
        return Math.floor(Math.random() * 7) + 1;
      case 'month':
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + currentWeek + 1, 0).getDate();
        return Math.floor(Math.random() * daysInMonth) + Math.floor(daysInMonth * 0.5);
      default:
        return 0;
    }
  };

  const statData: StatItem[] = [
    {
      name: '焦虑指数',
      value: 28,
      target: 30,
      trend: -12.5,
      unit: '分',
      color: theme.colors.success,
    },
    {
      name: '抑郁指数',
      value: 22,
      target: 25,
      trend: -8.3,
      unit: '分',
      color: theme.colors.success,
    },
    {
      name: '喝水量',
      value: 1850,
      target: 2000,
      trend: 15.2,
      unit: 'ml',
      color: theme.colors.warning,
    },
    {
      name: '专注时长',
      value: 45,
      target: 60,
      trend: 22.7,
      unit: '分钟',
      color: theme.colors.warning,
    },
  ];

  const sleepData: SleepData[] = [
    { date: '周一', bedTime: '23:30', wakeTime: '07:00', duration: 7.5 },
    { date: '周二', bedTime: '23:15', wakeTime: '06:45', duration: 7.5 },
    { date: '周三', bedTime: '00:15', wakeTime: '07:30', duration: 7.25 },
    { date: '周四', bedTime: '23:00', wakeTime: '06:30', duration: 7.5 },
    { date: '周五', bedTime: '23:45', wakeTime: '07:15', duration: 7.5 },
    { date: '周六', bedTime: '00:30', wakeTime: '08:00', duration: 7.5 },
    { date: '周日', bedTime: '23:20', wakeTime: '07:10', duration: 7.83 },
  ];

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 获取应该显示的日期标签索引 - 固定显示方案
  const getDisplayDateIndices = (daysInMonth: number) => {
    // 使用固定的关键日期显示，不管多少天都保持一致
    const baseKeyDates = [1, 5, 10, 15, 20, 25];
    
    // 过滤出在当月范围内的日期
    const keyDates = baseKeyDates.filter(day => day <= daysInMonth);
    
    // 总是添加最后一天（除非已经在列表中）
    if (!keyDates.includes(daysInMonth) && daysInMonth > 1) {
      keyDates.push(daysInMonth);
    }
    
    return keyDates.sort((a, b) => a - b);
  };

  const renderBarChart = (item: StatItem) => {
    let dailyValues: { day: string; dayNumber: number; value: number; isAchieved: boolean; showLabel: boolean }[];
    let achievedDays: number;

    if (selectedPeriod === 'week') {
      achievedDays = Math.floor(Math.random() * 7) + 1;
      dailyValues = Array.from({ length: 7 }, (_, i) => ({
        day: ['一', '二', '三', '四', '五', '六', '日'][i],
        dayNumber: i + 1,
        value: Math.random() * item.target * 1.5,
        isAchieved: Math.random() > 0.3,
        showLabel: true, // 周视图始终显示所有标签
      }));
    } else {
      // 月视图：显示1-31号，但只在关键日期显示标签
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + currentWeek + 1, 0).getDate();
      const displayIndices = getDisplayDateIndices(daysInMonth);
      
      achievedDays = Math.floor(Math.random() * daysInMonth) + Math.floor(daysInMonth * 0.6);
      dailyValues = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNumber = i + 1;
        return {
          day: String(dayNumber), // 使用String()确保正确转换
          dayNumber,
          value: Math.random() * item.target * 1.5,
          isAchieved: Math.random() > 0.3,
          showLabel: displayIndices.includes(dayNumber), // 只在关键日期显示标签
        };
      });
    }

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{item.name}</Text>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementText}>达标 {achievedDays} 天</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={selectedPeriod === 'week' ? styles.chartContentWeek : styles.chartContentMonth}>
          {dailyValues.map((day, index) => (
            <TouchableOpacity key={index} style={styles.barContainer} activeOpacity={0.7}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((day.value / (item.target * 1.5)) * 100, 8),
                      width: selectedPeriod === 'week' ? 20 : 8,
                      backgroundColor: day.isAchieved ? theme.colors.primary : theme.colors.secondary,
                    }
                  ]}
                />
              </View>
              {day.showLabel ? (
                <Text 
                  style={[
                    styles.barLabel,
                    selectedPeriod === 'month' && styles.barLabelMonth
                  ]} 
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {day.dayNumber}
                </Text>
              ) : (
                <View style={styles.barLabelEmpty} />
              )}
            </TouchableOpacity>
          ))}
          </View>
        </View>

        <View style={styles.chartStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>达标天数</Text>
            <Text style={styles.statValue}>{achievedDays} 天</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>日均{item.name}</Text>
            <Text style={styles.statValue}>{item.value} {item.unit}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>趋势对比</Text>
            <View style={[
              styles.trendBadge, 
              { backgroundColor: item.trend > 0 ? theme.colors.success + '20' : theme.colors.warning + '20' }
            ]}>
              <Icon
                name={item.trend > 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={item.trend > 0 ? theme.colors.success : theme.colors.warning}
              />
              <Text style={[
                styles.trendText,
                { color: item.trend > 0 ? theme.colors.success : theme.colors.warning }
              ]}>
                {item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSleepChart = () => {
    const achievedDays = sleepData.filter(day => 
      timeToMinutes(day.bedTime) <= timeToMinutes('23:30') && 
      timeToMinutes(day.wakeTime) >= timeToMinutes('06:30')
    ).length;

    const avgBedTime = sleepData.reduce((sum, day) => sum + timeToMinutes(day.bedTime), 0) / sleepData.length;
    const avgWakeTime = sleepData.reduce((sum, day) => sum + timeToMinutes(day.wakeTime), 0) / sleepData.length;

    const formatMinutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>睡眠统计</Text>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementText}>达标 {achievedDays} 天</Text>
          </View>
        </View>

        <View style={styles.sleepChartContainer}>
          <View style={styles.timeAxis}>
            <Text style={styles.timeLabel}>20:00</Text>
            <Text style={styles.timeLabel}>24:00</Text>
            <Text style={styles.timeLabel}>04:00</Text>
            <Text style={styles.timeLabel}>08:00</Text>
          </View>
          
          {sleepData.map((day, index) => (
            <View key={index} style={styles.sleepBarContainer}>
              <Text style={styles.sleepDayLabel}>{day.date}</Text>
              <View style={styles.sleepBarWrapper}>
                <View
                  style={[
                    styles.sleepBar,
                    {
                      left: `${((timeToMinutes(day.bedTime) - 20 * 60) / (12 * 60)) * 100}%`,
                      width: `${(day.duration / 12) * 100}%`,
                      backgroundColor: day.duration >= 7 ? theme.colors.success : theme.colors.warning,
                    }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.chartStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>达标天数</Text>
            <Text style={styles.statValue}>{achievedDays} 天</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均就寝</Text>
            <Text style={styles.statValue}>{formatMinutesToTime(avgBedTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均起床</Text>
            <Text style={styles.statValue}>{formatMinutesToTime(avgWakeTime)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>记录</Text>
        <TouchableOpacity 
          style={styles.customerServiceBtn}
          onPress={() => setShowCustomerService(true)}
        >
          <Icon name="bar-chart-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSection}>
        <View style={styles.periodTabs}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodTab,
                selectedPeriod === period.key && styles.activePeriodTab
              ]}
              onPress={() => setSelectedPeriod(period.key as PeriodType)}
            >
              <Text style={[
                styles.periodTabText,
                selectedPeriod === period.key && styles.activePeriodTabText
              ]}>
                {period.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.periodNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentWeek(currentWeek - 1)}
          >
            <Icon name="chevron-back" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.periodText}>{getCurrentPeriodText()}</Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentWeek(currentWeek + 1)}
          >
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Badge */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBadge}>
            <Icon name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.summaryBadgeText}>
              本{selectedPeriod === 'week' ? '周' : '月'}累计记录
            </Text>
            <Text style={styles.summaryBadgeNumber}>{getTotalRecordDays()}</Text>
            <Text style={styles.summaryBadgeUnit}>天</Text>
          </View>
        </View>

        {/* Stats Charts */}
        {statData.map((item, index) => (
          <View key={index}>
            {renderBarChart(item)}
          </View>
        ))}

        {/* Sleep Chart */}
        {renderSleepChart()}
      </ScrollView>

      <CustomerService 
        visible={showCustomerService}
        onClose={() => setShowCustomerService(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: 60, // 增加顶部padding以避免灵动岛遮挡 (iPhone 14 Pro+)
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background, // 使用背景色而不是surface色
    // 移除阴影以避免与下方建议卡片的阴影割裂
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
  periodSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  activePeriodTab: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.colored,
    elevation: 2,
  },
  periodTabText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  activePeriodTabText: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
  },
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    ...theme.shadows.xs,
  },
  periodText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    textAlign: 'center',
    minWidth: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  // New Summary Badge Styles
  summarySection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
  },
  summaryBadgeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  summaryBadgeNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  summaryBadgeUnit: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  achievementBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.colored,
  },
  achievementText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
  },
  chartContainer: {
    height: 120,
    marginBottom: theme.spacing.md,
  },
  chartContentWeek: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    width: '100%',
  },
  chartContentMonth: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around', // 改为space-around以获得更均匀的分布
    paddingHorizontal: theme.spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  bar: {
    borderRadius: theme.borderRadius.sm,
    minHeight: 5,
  },
  barLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    minHeight: 12,
  },
  barLabelMonth: {
    fontSize: 8,
  },
  barLabelEmpty: {
    height: 12,
    width: '100%',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  sleepChartContainer: {
    marginBottom: theme.spacing.md,
  },
  timeAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: theme.spacing.sm,
  },
  timeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  sleepBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sleepDayLabel: {
    width: 35,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  sleepBarWrapper: {
    flex: 1,
    height: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    position: 'relative',
  },
  sleepBar: {
    position: 'absolute',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    top: 0,
  },
});

export default RecordsScreen;
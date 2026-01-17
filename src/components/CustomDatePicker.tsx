import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../styles/theme';

interface CustomDatePickerProps {
  onDateChange: (dateString: string) => void;
  initialDate?: string;
  minDate?: string;
  maxDate?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  onDateChange,
  initialDate,
  minDate,
  maxDate,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 初始化日期
  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setSelectedDay(date.getDate());
    }
  }, [initialDate]);

  // 当选择的年月日改变时，调用回调
  useEffect(() => {
    const dateString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    onDateChange(dateString);
  }, [selectedYear, selectedMonth, selectedDay, onDateChange]);

  // 获取当前月份的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 生成年份数组（当前年份前后各10年）
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  // 生成月份数组
  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  };

  // 生成天数数组
  const generateDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  };

  const years = generateYears();
  const monthNumbers = generateMonths();
  const days = generateDays();

  // 确保选择的日期不会超出当前月份的最大天数
  useEffect(() => {
    const maxDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDaysInMonth) {
      setSelectedDay(maxDaysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <View style={styles.container}>
      <Text style={styles.currentDateText}>
        {selectedYear}年{selectedMonth}月{selectedDay}日
      </Text>
      
      <View style={styles.pickersContainer}>
        {/* 年份选择器 */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>年份</Text>
          <View style={styles.scrollContainer}>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / 40);
                if (index >= 0 && index < years.length) {
                  setSelectedYear(years[index]);
                }
              }}
              contentOffset={{ x: 0, y: years.indexOf(selectedYear) * 40 }}
            >
              {years.map((year, index) => {
                const isActive = year === selectedYear;
                return (
                  <View key={year} style={styles.scrollItem}>
                    <Text style={[
                      styles.scrollText,
                      isActive && styles.scrollTextActive
                    ]}>
                      {year}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* 月份选择器 */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>月份</Text>
          <View style={styles.scrollContainer}>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / 40);
                if (index >= 0 && index < monthNumbers.length) {
                  setSelectedMonth(monthNumbers[index]);
                }
              }}
              contentOffset={{ x: 0, y: (selectedMonth - 1) * 40 }}
            >
              {monthNumbers.map((month, index) => {
                const isActive = month === selectedMonth;
                return (
                  <View key={month} style={styles.scrollItem}>
                    <Text style={[
                      styles.scrollText,
                      isActive && styles.scrollTextActive
                    ]}>
                      {month}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* 日期选择器 */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>日期</Text>
          <View style={styles.scrollContainer}>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / 40);
                if (index >= 0 && index < days.length) {
                  setSelectedDay(days[index]);
                }
              }}
              contentOffset={{ x: 0, y: Math.max(0, (selectedDay - 1) * 40) }}
            >
              {days.map((day, index) => {
                const isActive = day === selectedDay;
                return (
                  <View key={day} style={styles.scrollItem}>
                    <Text style={[
                      styles.scrollText,
                      isActive && styles.scrollTextActive
                    ]}>
                      {day}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  currentDateText: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  scrollContainer: {
    height: 120,
    width: 80,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  scrollTextActive: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
});

export default CustomDatePicker;
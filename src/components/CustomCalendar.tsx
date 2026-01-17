import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';

interface CustomCalendarProps {
  onDayPress: (day: { dateString: string }) => void;
  minDate?: string;
  selectedDate?: string;
  theme?: any;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  onDayPress,
  minDate,
  selectedDate,
}) => {
  console.log('CustomCalendar rendered with props:', { minDate, selectedDate });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(selectedDate || '');

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  // 获取当前月份的所有日期数据
  const getCalendarData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 当月第一天
    const firstDay = new Date(year, month, 1);
    // 当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    // 当月第一天是星期几（0=星期天）
    const firstDayOfWeek = firstDay.getDay();
    // 当月天数
    const daysInMonth = lastDay.getDate();

    const calendarDays: Array<{
      date: number;
      month: number;
      year: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }> = [];

    // 添加上个月的日期来填满第一行
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateString = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
      
      calendarDays.push({
        date,
        month: prevMonth,
        year: prevYear,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: minDate ? dateString < minDate : false,
      });
    }

    // 添加当月的日期
    const today = new Date();
    for (let date = 1; date <= daysInMonth; date++) {
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
      const isToday = 
        today.getDate() === date &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      
      calendarDays.push({
        date,
        month,
        year,
        dateString,
        isCurrentMonth: true,
        isToday,
        isDisabled: minDate ? dateString < minDate : false,
      });
    }

    // 添加下个月的日期来填满最后一行（确保有6行）
    const totalCells = 42; // 6行 x 7列
    const remainingCells = totalCells - calendarDays.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let date = 1; date <= remainingCells; date++) {
      const dateString = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
      
      calendarDays.push({
        date,
        month: nextMonth,
        year: nextYear,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: minDate ? dateString < minDate : false,
      });
    }

    return calendarDays;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayPress = (day: any) => {
    if (day.isDisabled) return;
    
    setSelectedDay(day.dateString);
    onDayPress({ dateString: day.dateString });
  };

  const calendarData = getCalendarData(currentDate);

  return (
    <View style={styles.container}>
      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Icon name="chevron-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {currentDate.getFullYear()}年{months[currentDate.getMonth()]}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 星期标题行 */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* 日期网格 */}
      <View style={styles.dateGrid}>
        {calendarData.map((day, index) => {
          const isSelected = day.dateString === selectedDay;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCell,
                day.isToday && styles.todayCell,
                isSelected && styles.selectedCell,
                day.isDisabled && styles.disabledCell,
              ]}
              onPress={() => handleDayPress(day)}
              disabled={day.isDisabled}
            >
              <Text style={[
                styles.dateText,
                !day.isCurrentMonth && styles.inactiveDateText,
                day.isToday && styles.todayText,
                isSelected && styles.selectedText,
                day.isDisabled && styles.disabledText,
              ]}>
                {day.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  navButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  weekDayText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28571%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    marginVertical: 1,
  },
  todayCell: {
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectedCell: {
    backgroundColor: theme.colors.primary,
  },
  disabledCell: {
    opacity: 0.3,
  },
  dateText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  inactiveDateText: {
    color: theme.colors.textLight,
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  selectedText: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
  },
  disabledText: {
    color: theme.colors.textLight,
  },
});

export default CustomCalendar;
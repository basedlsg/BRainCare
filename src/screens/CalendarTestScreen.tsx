import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';

const CalendarTestScreen = ({ navigation }: any) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // 日期选择器内联组件
  const DatePickerCalendarInline = () => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const months = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];

    // 获取日历数据
    const getCalendarData = () => {
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      
      // 当月第一天和最后一天
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      const calendarDays = [];

      // 添加上个月的日期
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        calendarDays.push({
          date,
          month: prevMonth,
          year: prevYear,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
        });
      }

      // 添加当月的日期
      const today = new Date();
      for (let date = 1; date <= daysInMonth; date++) {
        const isToday = 
          today.getDate() === date &&
          today.getMonth() === month &&
          today.getFullYear() === year;
        
        const isSelected = 
          selectedDate.getDate() === date &&
          selectedDate.getMonth() === month &&
          selectedDate.getFullYear() === year;
        
        calendarDays.push({
          date,
          month,
          year,
          isCurrentMonth: true,
          isToday,
          isSelected,
        });
      }

      // 添加下个月的日期
      const totalCells = 42; // 6行 x 7列
      const remainingCells = totalCells - calendarDays.length;
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;

      for (let date = 1; date <= remainingCells; date++) {
        calendarDays.push({
          date,
          month: nextMonth,
          year: nextYear,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
        });
      }

      return calendarDays;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCalendarMonth(prevDate => {
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
      if (!day.isCurrentMonth) return;
      
      const newDate = new Date(day.year, day.month, day.date);
      setSelectedDate(newDate);
      
      const dateString = `${day.year}-${(day.month + 1).toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`;
      Alert.alert('日期已选择', `您选择的日期是：${dateString}`);
    };

    const calendarData = getCalendarData();

    return (
      <View style={styles.inlineCalendar}>
        <Text style={styles.currentDateText}>
          {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
        </Text>
        
        {/* 月份导航 */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.calendarNavButton}>
            <Icon name="chevron-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.calendarMonthText}>
            {calendarMonth.getFullYear()}年{months[calendarMonth.getMonth()]}
          </Text>
          
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.calendarNavButton}>
            <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 星期标题行 */}
        <View style={styles.calendarWeekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.calendarWeekDay}>
              <Text style={styles.calendarWeekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* 日期网格 */}
        <View style={styles.calendarDateGrid}>
          {calendarData.map((day, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDateCell,
                  day.isToday && styles.calendarTodayCell,
                  day.isSelected && styles.calendarSelectedCell,
                  !day.isCurrentMonth && styles.calendarInactiveCell,
                ]}
                onPress={() => handleDayPress(day)}
              >
                <Text style={[
                  styles.calendarDateText,
                  !day.isCurrentMonth && styles.calendarInactiveDateText,
                  day.isToday && styles.calendarTodayText,
                  day.isSelected && styles.calendarSelectedText,
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>日历测试</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>日历选择器测试页面</Text>
        <Text style={styles.subtitle}>点击下面的按钮来测试日历显示功能</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>当前选择的日期：</Text>
          <Text style={styles.selectedDateText}>
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.openCalendarButton}
          onPress={() => setShowCalendar(true)}
        >
          <Icon name="calendar-outline" size={24} color={theme.colors.surface} />
          <Text style={styles.openCalendarText}>打开日历选择器</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.directCalendarButton}
          onPress={() => setShowCalendar(false)}
        >
          <Icon name="calendar" size={24} color={theme.colors.primary} />
          <Text style={styles.directCalendarText}>显示内嵌日历</Text>
        </TouchableOpacity>

        {/* 直接显示的日历 */}
        {!showCalendar && (
          <View style={styles.directCalendarContainer}>
            <DatePickerCalendarInline />
          </View>
        )}
      </View>

      {/* Modal 日历 */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>选择日期</Text>
            </View>
            <View style={styles.datePickerContent}>
              <DatePickerCalendarInline />
            </View>
            <View style={styles.datePickerButtons}>
              <TouchableOpacity 
                style={styles.datePickerCancel}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.datePickerCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datePickerConfirm}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.datePickerConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.lineHeight.relaxed * theme.fontSize.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  selectedDateText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  openCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  openCalendarText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.surface,
    marginLeft: theme.spacing.md,
  },
  directCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  directCalendarText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.md,
  },
  directCalendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Modal styles
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing.xl,
    maxWidth: '90%',
    width: '90%',
    ...theme.shadows.lg,
  },
  datePickerHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  datePickerContent: {
    padding: theme.spacing.lg,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  datePickerCancel: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  datePickerConfirm: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  datePickerCancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  datePickerConfirmText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.medium,
  },
  // Inline Calendar Styles
  inlineCalendar: {
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  calendarNavButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarMonthText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  calendarWeekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  calendarWeekDayText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  calendarDateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  calendarDateCell: {
    width: '14.28571%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    marginVertical: 1,
  },
  calendarTodayCell: {
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  calendarSelectedCell: {
    backgroundColor: theme.colors.primary,
  },
  calendarInactiveCell: {
    opacity: 0.3,
  },
  calendarDateText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  calendarInactiveDateText: {
    color: theme.colors.textLight,
  },
  calendarTodayText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  calendarSelectedText: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
  },
  currentDateText: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
});

export default CalendarTestScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';

type ReminderType = 'timepoint' | 'timerange' | 'allday';

interface ReminderSettings {
  type: ReminderType;
  timepoint?: string;
  startTime?: string;
  endTime?: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'custom' | 'ebbinghaus';
  customDays?: number;
  customWeeks?: number;
  startDate?: string;
  endDate?: string;
}

const ReminderSettingsScreen = ({ navigation, route }: any) => {
  const { todoId, todoText } = route.params || {};
  
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    type: 'timepoint',
    repeatType: 'none',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'time' | 'date'>('time');
  const [currentTimeType, setCurrentTimeType] = useState<'start' | 'end' | 'single'>('single');
  const [currentDateType, setCurrentDateType] = useState<'start' | 'end' | 'single'>('single');
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // 日期选择器相关状态
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const generateEbbinghausReminders = (startDate: Date) => {
    const reminders = [];
    const intervals = [1, 2, 4, 7, 15]; // 前15天的间隔
    
    // 前15天的提醒
    intervals.forEach(days => {
      const reminderDate = new Date(startDate);
      reminderDate.setDate(startDate.getDate() + days);
      reminders.push(reminderDate.toLocaleDateString());
    });
    
    // 15天后每隔15天的提醒
    for (let i = 1; i <= 12; i++) { // 生成一年的提醒
      const reminderDate = new Date(startDate);
      reminderDate.setDate(startDate.getDate() + 15 + (i * 15));
      reminders.push(reminderDate.toLocaleDateString());
    }
    
    return reminders;
  };

  const openDatePicker = (type: 'start' | 'end' | 'single') => {
    console.log('Opening date picker for type:', type);
    setCurrentDateType(type);
    setShowCalendar(true);
  };

  const onDateChange = (dateString: string) => {
    console.log('Date selected:', dateString, 'for type:', currentDateType);
    if (currentDateType === 'start') {
      setReminderSettings({...reminderSettings, startDate: dateString});
    } else if (currentDateType === 'end') {
      setReminderSettings({...reminderSettings, endDate: dateString});
    } else if (currentDateType === 'single') {
      setReminderSettings({...reminderSettings, startDate: dateString});
    }
    
    setShowCalendar(false);
  };

  const openTimePicker = (type: 'start' | 'end' | 'single') => {
    console.log('Opening time picker for type:', type);
    setCurrentTimeType(type);
    setDatePickerMode('time');
    
    // 设置当前时间作为初始值
    const currentTime = new Date();
    if (type === 'single' && reminderSettings.timepoint) {
      const [hours, minutes] = reminderSettings.timepoint.split(':');
      currentTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    } else if (type === 'start' && reminderSettings.startTime) {
      const [hours, minutes] = reminderSettings.startTime.split(':');
      currentTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    } else if (type === 'end' && reminderSettings.endTime) {
      const [hours, minutes] = reminderSettings.endTime.split(':');
      currentTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    
    setPickerDate(currentTime);
    setShowDatePicker(true);
  };

  const saveReminder = () => {
    // 这里可以添加保存提醒的逻辑
    console.log('保存提醒设置:', { todoId, settings: reminderSettings });
    Alert.alert('提醒设置', '提醒设置已保存成功！', [
      { text: '确定', onPress: () => navigation.goBack() }
    ]);
  };

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
          selectedCalendarDate.getDate() === date &&
          selectedCalendarDate.getMonth() === month &&
          selectedCalendarDate.getFullYear() === year;
        
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
      setSelectedCalendarDate(newDate);
      
      const dateString = `${day.year}-${(day.month + 1).toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`;
      onDateChange(dateString);
    };

    const calendarData = getCalendarData();

    return (
      <View style={styles.inlineCalendar}>
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
        <Text style={styles.headerTitle}>设置提醒</Text>
        <TouchableOpacity onPress={saveReminder}>
          <Text style={styles.saveButton}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Todo 信息 */}
        {todoText && (
          <View style={styles.todoInfo}>
            <Text style={styles.todoInfoTitle}>待办事项</Text>
            <Text style={styles.todoInfoText}>{todoText}</Text>
          </View>
        )}

        {/* 提醒类型选择 */}
        <View style={styles.reminderSection}>
          <Text style={styles.reminderSectionTitle}>提醒类型</Text>
          <View style={styles.reminderTypeContainer}>
            <TouchableOpacity
              style={[styles.reminderTypeButton, reminderSettings.type === 'timepoint' && styles.reminderTypeButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, type: 'timepoint'})}
            >
              <Text style={[styles.reminderTypeText, reminderSettings.type === 'timepoint' && styles.reminderTypeTextActive]}>时间点</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reminderTypeButton, reminderSettings.type === 'timerange' && styles.reminderTypeButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, type: 'timerange'})}
            >
              <Text style={[styles.reminderTypeText, reminderSettings.type === 'timerange' && styles.reminderTypeTextActive]}>时间段</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reminderTypeButton, reminderSettings.type === 'allday' && styles.reminderTypeButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, type: 'allday'})}
            >
              <Text style={[styles.reminderTypeText, reminderSettings.type === 'allday' && styles.reminderTypeTextActive]}>全天</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 时间设置 */}
        {reminderSettings.type === 'timepoint' && (
          <View style={styles.reminderSection}>
            <Text style={styles.reminderSectionTitle}>选择时间</Text>
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => openTimePicker('single')}
            >
              <Text style={styles.timePickerText}>{reminderSettings.timepoint || '09:00'}</Text>
              <Icon name="time-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {reminderSettings.type === 'timerange' && (
          <View style={styles.reminderSection}>
            <Text style={styles.reminderSectionTitle}>选择时间段</Text>
            <View style={styles.timeRangeContainer}>
              <TouchableOpacity 
                style={[styles.timePickerButton, styles.flexOne]}
                onPress={() => openTimePicker('start')}
              >
                <Text style={styles.timePickerText}>{reminderSettings.startTime || '09:00'}</Text>
                <Icon name="time-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.timeRangeSeparator}>-</Text>
              <TouchableOpacity 
                style={[styles.timePickerButton, styles.flexOne]}
                onPress={() => openTimePicker('end')}
              >
                <Text style={styles.timePickerText}>{reminderSettings.endTime || '10:00'}</Text>
                <Icon name="time-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {reminderSettings.type === 'allday' && (
          <View style={styles.reminderSection}>
            <Text style={styles.reminderSectionTitle}>全天事件</Text>
            <Text style={styles.allDayText}>此事件不需要具体时间</Text>
          </View>
        )}

        {/* 重复设置 */}
        <View style={styles.reminderSection}>
          <Text style={styles.reminderSectionTitle}>重复设置</Text>
          <View style={styles.repeatContainer}>
            <TouchableOpacity
              style={[styles.repeatButton, reminderSettings.repeatType === 'none' && styles.repeatButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, repeatType: 'none'})}
            >
              <Text style={[styles.repeatText, reminderSettings.repeatType === 'none' && styles.repeatTextActive]}>不重复</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.repeatButton, reminderSettings.repeatType === 'daily' && styles.repeatButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, repeatType: 'daily'})}
            >
              <Text style={[styles.repeatText, reminderSettings.repeatType === 'daily' && styles.repeatTextActive]}>每天</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.repeatButton, reminderSettings.repeatType === 'weekly' && styles.repeatButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, repeatType: 'weekly'})}
            >
              <Text style={[styles.repeatText, reminderSettings.repeatType === 'weekly' && styles.repeatTextActive]}>每周</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.repeatButton, reminderSettings.repeatType === 'custom' && styles.repeatButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, repeatType: 'custom'})}
            >
              <Text style={[styles.repeatText, reminderSettings.repeatType === 'custom' && styles.repeatTextActive]}>自定义</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.repeatButton, reminderSettings.repeatType === 'ebbinghaus' && styles.repeatButtonActive]}
              onPress={() => setReminderSettings({...reminderSettings, repeatType: 'ebbinghaus'})}
            >
              <Text style={[styles.repeatText, reminderSettings.repeatType === 'ebbinghaus' && styles.repeatTextActive]}>艾宾浩斯记忆法</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 自定义重复设置 */}
        {reminderSettings.repeatType === 'custom' && (
          <View style={styles.reminderSection}>
            <Text style={styles.reminderSectionTitle}>自定义重复</Text>
            <View style={styles.customRepeatContainer}>
              <View style={styles.customRepeatRow}>
                <Text style={styles.customRepeatLabel}>每</Text>
                <TextInput
                  style={styles.customRepeatInput}
                  value={reminderSettings.customDays?.toString() || ''}
                  onChangeText={(text) => setReminderSettings({...reminderSettings, customDays: parseInt(text, 10) || 0})}
                  keyboardType="numeric"
                  placeholder="1"
                />
                <Text style={styles.customRepeatLabel}>天</Text>
              </View>
              <View style={styles.customRepeatRow}>
                <Text style={styles.customRepeatLabel}>每</Text>
                <TextInput
                  style={styles.customRepeatInput}
                  value={reminderSettings.customWeeks?.toString() || ''}
                  onChangeText={(text) => setReminderSettings({...reminderSettings, customWeeks: parseInt(text, 10) || 0})}
                  keyboardType="numeric"
                  placeholder="1"
                />
                <Text style={styles.customRepeatLabel}>周</Text>
              </View>
            </View>
            
            {/* 日期范围设置 */}
            <View style={styles.dateRangeContainer}>
              <Text style={styles.dateRangeTitle}>日期范围</Text>
              <View style={styles.dateRangeRow}>
                <TouchableOpacity 
                  style={[styles.datePickerButton, styles.flexOne]}
                  onPress={() => openDatePicker('start')}
                >
                  <Text style={styles.datePickerText}>
                    {reminderSettings.startDate || '开始日期'}
                  </Text>
                  <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.dateRangeSeparator}>至</Text>
                <TouchableOpacity 
                  style={[styles.datePickerButton, styles.flexOne]}
                  onPress={() => openDatePicker('end')}
                >
                  <Text style={styles.datePickerText}>
                    {reminderSettings.endDate || '结束日期'}
                  </Text>
                  <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 艾宾浩斯记忆法预览 */}
        {reminderSettings.repeatType === 'ebbinghaus' && (
          <View style={styles.reminderSection}>
            <Text style={styles.reminderSectionTitle}>艾宾浩斯记忆法提醒</Text>
            <Text style={styles.ebbinghausDescription}>
              将根据遗忘曲线自动生成提醒日期：第1、2、4、7、15天，之后每隔15天重复
            </Text>
            
            {/* 开始日期选择 */}
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => openDatePicker('single')}
            >
              <Text style={styles.datePickerText}>
                {reminderSettings.startDate || '选择开始日期'}
              </Text>
              <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            {reminderSettings.startDate && (
              <View style={styles.ebbinghausPreview}>
                <Text style={styles.ebbinghausPreviewTitle}>预计提醒日期：</Text>
                {generateEbbinghausReminders(new Date(reminderSettings.startDate || new Date())).slice(0, 8).map((date, index) => (
                  <Text key={index} style={styles.ebbinghausDate}>{date}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 内嵌日历展示 */}
        {showCalendar && (
          <View style={styles.calendarSection}>
            <Text style={styles.reminderSectionTitle}>选择日期</Text>
            <View style={styles.calendarContainer}>
              <DatePickerCalendarInline />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 时间选择器Modal */}
      {showDatePicker && datePickerMode === 'time' && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>
                  {currentTimeType === 'start' ? '选择开始时间' : 
                   currentTimeType === 'end' ? '选择结束时间' : '选择时间'}
                </Text>
              </View>
              <View style={styles.timePickerContent}>
                <Text style={styles.currentTimeText}>{formatTime(pickerDate)}</Text>
                <View style={styles.timeControlsContainer}>
                  <View style={styles.timeControl}>
                    <Text style={styles.timeControlLabel}>小时</Text>
                    <View style={styles.timeScrollContainer}>
                      <ScrollView 
                        style={styles.timeScrollView}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        onMomentumScrollEnd={(e) => {
                          const offsetY = e.nativeEvent.contentOffset.y;
                          const index = Math.round(offsetY / 40);
                          const newHour = index % 24;
                          const newDate = new Date(pickerDate);
                          newDate.setHours(newHour);
                          setPickerDate(newDate);
                        }}
                        contentOffset={{ x: 0, y: (pickerDate.getHours() + 24) * 40 }}
                      >
                        {[...Array(72)].map((_, index) => {
                          const hour = index % 24;
                          const isActive = hour === pickerDate.getHours() && index >= 24 && index < 48;
                          return (
                            <View key={index} style={styles.timeScrollItem}>
                              <Text style={[
                                styles.timeScrollText,
                                isActive && styles.timeScrollTextActive
                              ]}>
                                {hour.toString().padStart(2, '0')}
                              </Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeControl}>
                    <Text style={styles.timeControlLabel}>分钟</Text>
                    <View style={styles.timeScrollContainer}>
                      <ScrollView 
                        style={styles.timeScrollView}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        onMomentumScrollEnd={(e) => {
                          const offsetY = e.nativeEvent.contentOffset.y;
                          const index = Math.round(offsetY / 40);
                          const newMinute = index % 60;
                          const newDate = new Date(pickerDate);
                          newDate.setMinutes(newMinute);
                          setPickerDate(newDate);
                        }}
                        contentOffset={{ x: 0, y: (pickerDate.getMinutes() + 60) * 40 }}
                      >
                        {[...Array(180)].map((_, index) => {
                          const minute = index % 60;
                          const isActive = minute === pickerDate.getMinutes() && index >= 60 && index < 120;
                          return (
                            <View key={index} style={styles.timeScrollItem}>
                              <Text style={[
                                styles.timeScrollText,
                                isActive && styles.timeScrollTextActive
                              ]}>
                                {minute.toString().padStart(2, '0')}
                              </Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity 
                  style={styles.timePickerCancel}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.timePickerCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.timePickerConfirm}
                  onPress={() => {
                    const timeString = formatTime(pickerDate);
                    if (currentTimeType === 'single') {
                      setReminderSettings({...reminderSettings, timepoint: timeString});
                    } else if (currentTimeType === 'start') {
                      setReminderSettings({...reminderSettings, startTime: timeString});
                    } else if (currentTimeType === 'end') {
                      setReminderSettings({...reminderSettings, endTime: timeString});
                    }
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.timePickerConfirmText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    justifyContent: 'space-between',
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
  saveButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  todoInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  todoInfoTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  todoInfoText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  reminderSection: {
    marginBottom: theme.spacing.xl,
  },
  reminderSectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  reminderTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  reminderTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  reminderTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reminderTypeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  reminderTypeTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  timePickerText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  timeRangeSeparator: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  allDayText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    textAlign: 'center',
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  repeatButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  repeatButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  repeatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  repeatTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
  },
  customRepeatContainer: {
    gap: theme.spacing.md,
  },
  customRepeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customRepeatLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  customRepeatInput: {
    width: 80,
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    backgroundColor: theme.colors.surface,
  },
  dateRangeContainer: {
    marginTop: theme.spacing.lg,
  },
  dateRangeTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  datePickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  dateRangeSeparator: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  ebbinghausDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.lineHeight.relaxed * theme.fontSize.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ebbinghausPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  ebbinghausPreviewTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  ebbinghausDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  flexOne: {
    flex: 1,
  },
  // Calendar Section
  calendarSection: {
    marginBottom: theme.spacing.xl,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  // Time Picker Modal Styles
  timePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing.xl,
    maxWidth: '90%',
    width: '90%',
    ...theme.shadows.lg,
  },
  timePickerHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  timePickerContent: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  currentTimeText: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  timeControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  timeControl: {
    alignItems: 'center',
  },
  timeControlLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  timeScrollContainer: {
    height: 120,
    width: 80,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeScrollView: {
    flex: 1,
  },
  timeScrollItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeScrollText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  timeScrollTextActive: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  timeSeparator: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  timePickerCancel: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timePickerConfirm: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  timePickerCancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  timePickerConfirmText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.medium,
  },
});

export default ReminderSettingsScreen;
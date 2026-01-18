import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import CustomerService from '../components/CustomerService';
import StandardTag from '../components/StandardTag';
import StandardIconContainer from '../components/StandardIconContainer';
import CustomCalendar from '../components/CustomCalendar';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  reminderTime?: string;
}

type FavoriteTab = 'plans' | 'courses' | 'therapy' | 'offline';

const HomeScreen = ({ navigation }: any) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: t('sample_todo_1'), completed: false },
    { id: '2', text: t('sample_todo_2'), completed: true },
    { id: '3', text: t('sample_todo_3'), completed: false },
  ]);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [activeFavoriteTab, setActiveFavoriteTab] = useState<FavoriteTab>('plans');
  const [showCalendar, setShowCalendar] = useState(false);

  const favoriteData = {
    plans: [
      { id: '1', title: t('plan_focus_title'), subtitle: t('plan_focus_subtitle'), tag: t('tag_plan'), duration: t('duration_14days'), favorited: true },
      { id: '2', title: t('plan_early_rise_title'), subtitle: t('plan_early_rise_subtitle'), tag: t('tag_plan'), duration: t('duration_21days'), favorited: false },
    ],
    courses: [
      { id: '3', title: t('course_sleep_title'), subtitle: t('course_sleep_subtitle'), tag: t('tag_course'), duration: t('duration_7_21days'), favorited: true },
      { id: '4', title: t('course_meditation_title'), subtitle: t('course_meditation_subtitle'), tag: t('tag_course'), duration: t('duration_10lessons'), favorited: false },
    ],
    therapy: [
      { id: '5', title: t('therapy_alpha_title'), subtitle: t('therapy_alpha_subtitle'), tag: t('tag_therapy'), duration: t('duration_30mins'), favorited: true },
      { id: '6', title: t('therapy_white_noise_title'), subtitle: t('therapy_white_noise_subtitle'), tag: t('tag_therapy'), duration: t('duration_60mins'), favorited: false },
    ],
    offline: [
      { id: '7', title: t('offline_center_title'), subtitle: t('offline_center_subtitle'), tag: t('tag_offline'), duration: t('duration_appointment'), favorited: false },
      { id: '8', title: t('offline_counseling_title'), subtitle: t('offline_counseling_subtitle'), tag: t('tag_offline'), duration: t('duration_1hour'), favorited: true },
    ],
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning');
    if (hour < 18) return t('good_afternoon');
    return t('good_evening');
  };

  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
  };

  // V2 精修: 标签类型映射函数
  const getTagType = (tag: string) => {
    // Inverse mapping or check values. Since tag is now localized,
    // we should rely on the valid keys from translations or perform a reverse lookup.
    // For simplicity, we'll map the localized string back to type if possible,
    // or better: refactor the data structure to store type separately.
    // Given the constraints, I'll allow 'tag' to be used if it matches directly,
    // or fix this logic to be language agnostic.
    // Hack: check if tag matches any of the known values for current language or fallback.
    return 'lifestyle';
  };
  // Better approach: Since getTagType in original code mapped Chinese string to style,
  // and we changed data to usage `t('tag_plan')`, we should probably just pass the TYPE in data
  // and map TYPE to text for display. But for now, let's keep it simple.
  // Actually, let's just use a simple mapping based on the Translation Key if possible.
  // But wait, the item.tag is passed.
  // Let's rewrite `favoriteData` in a way that we can derive style.
  // For now, I will skip complex logic and just return 'lifestyle' to avoid crash,
  // or simple check.

  // Re-implementing simplified getTagType for demo
  const getTagStyleType = (tag: string) => {
    if (tag === t('tag_plan')) return 'lifestyle';
    if (tag === t('tag_course')) return 'cognitive';
    if (tag === t('tag_therapy')) return 'brainwave';
    if (tag === t('tag_offline')) return 'psychology';
    return 'lifestyle';
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const setReminder = (id: string) => {
    const todo = todos.find(t => t.id === id);
    navigation.navigate('ReminderSettings', {
      todoId: id,
      todoText: todo?.text || ''
    });
  };



  const onDateChange = (dateString: string) => {
    console.log('Date selected:', dateString);
    setShowCalendar(false);
  };

  const updateTodoText = (id: string, newText: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  // 添加useEffect来监控showCalendar状态变化
  useEffect(() => {
    console.log('showCalendar state changed to:', showCalendar);
  }, [showCalendar]);

  // 日期选择器相关状态
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Format date based on language
  const formatCalendarDate = (date: Date, monthNames: string[]) => {
    if (language === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Format header date (year + month)
  const formatHeaderMonth = (year: number, monthIndex: number, monthNames: string[]) => {
    if (language === 'zh') {
      return `${year}年${monthNames[monthIndex]}`;
    }
    return `${monthNames[monthIndex]} ${year}`;
  };

  // 日期选择器内联组件
  const DatePickerCalendarInline = () => {
    const weekDays = [
      t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')
    ];
    const months = [
      t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun'),
      t('jul'), t('aug'), t('sep'), t('oct'), t('nov'), t('dec')
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
        <Text style={styles.currentDateText}>
          {formatCalendarDate(selectedCalendarDate, months)}
        </Text>

        {/* 月份导航 */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.calendarNavButton}>
            <Icon name="chevron-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.calendarMonthText}>
            {formatHeaderMonth(calendarMonth.getFullYear(), calendarMonth.getMonth(), months)}
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Icon name="sunny-outline" size={24} color={theme.colors.secondary} style={styles.weatherIcon} />
            <Text style={styles.greeting}>{getGreeting()}{language === 'zh' ? '，' : ', '}{t('user')}</Text>
          </View>
          <Text style={styles.date}>{getCurrentDate()}</Text>
          {/* Status Chip */}
          <View style={styles.statusChip}>
            <Icon name="moon-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.statusChipText}>
              {t('last_night_sleep')}: 7h 12m • {t('sleep_quality')}: {t('quality_good')}
            </Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.languageBtn}
            onPress={toggleLanguage}
          >
            <Text style={styles.languageBtnText}>{language === 'zh' ? 'En' : '中'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testCalendarBtn}
            onPress={() => navigation.navigate('CalendarTest')}
          >
            <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.customerServiceBtn}
            onPress={() => setShowCustomerService(true)}
          >
            <Icon name="pulse-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sleep Summary Card - NEW */}
      <TouchableOpacity
        style={styles.sleepSummaryCard}
        onPress={() => navigation.navigate('Sleep')}
        activeOpacity={0.7}
      >
        <View style={styles.sleepSummaryHeader}>
          <View style={styles.sleepSummaryIcon}>
            <Icon name="bed-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.sleepSummaryTitle}>{t('sleep_summary')}</Text>
          <Icon name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </View>
        <View style={styles.sleepSummaryContent}>
          <View style={styles.sleepMetric}>
            <Text style={styles.sleepMetricValue}>7h 12m</Text>
            <Text style={styles.sleepMetricLabel}>{t('duration')}</Text>
          </View>
          <View style={styles.sleepMetricDivider} />
          <View style={styles.sleepMetric}>
            <Text style={[styles.sleepMetricValue, { color: theme.colors.success }]}>{t('quality_good')}</Text>
            <Text style={styles.sleepMetricLabel}>{t('sleep_quality')}</Text>
          </View>
          <View style={styles.sleepMetricDivider} />
          <View style={styles.sleepMetric}>
            <Text style={styles.sleepMetricValue}>23:15</Text>
            <Text style={styles.sleepMetricLabel}>{t('bedtime')}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Pinned Actions - NEW */}
      <View style={styles.pinnedActions}>
        <Text style={styles.pinnedActionsTitle}>{t('pinned_actions')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pinnedActionsScroll}>
          <TouchableOpacity style={styles.pinnedActionButton}>
            <Icon name="pulse" size={18} color={theme.colors.primary} />
            <Text style={styles.pinnedActionText}>{t('action_complete_assessment')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pinnedActionButton}>
            <Icon name="leaf" size={18} color={theme.colors.success} />
            <Text style={styles.pinnedActionText}>{t('action_book_therapy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pinnedActionButton}>
            <Icon name="musical-notes" size={18} color={theme.colors.info} />
            <Text style={styles.pinnedActionText}>{t('action_start_meditation')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Health Suggestion Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('daily_tip_title')}</Text>
        <View style={styles.healthSuggestionCard}>
          <View style={styles.suggestionHeader}>
            <StandardIconContainer
              iconName="bulb"
              iconColor={theme.colors.secondary}
              iconSize={20}
              size={40}
            />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionText}>{t('health_suggestion_text')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.suggestionAction}>
            <Text style={styles.suggestionActionText}>{t('tip_start')}</Text>
            <Icon name="arrow-forward" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Todo List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('schedule_title')}</Text>
        <View style={styles.todoContainer}>
          {todos.map((todo) => (
            <View key={todo.id} style={[
              styles.todoItem,
              todo.completed && styles.todoItemCompleted
            ]}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  todo.completed && styles.checkboxCompleted
                ]}
                onPress={() => toggleTodo(todo.id)}
              >
                {todo.completed && (
                  <Icon name="checkmark" size={16} color={theme.colors.surface} />
                )}
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.todoText,
                  todo.completed && styles.todoTextCompleted
                ]}
                value={todo.text}
                onChangeText={(text) => updateTodoText(todo.id, text)}
                multiline
                editable={!todo.completed}
              />

              <TouchableOpacity
                style={[
                  styles.reminderBtn,
                  todo.completed && styles.reminderBtnCompleted
                ]}
                onPress={() => setReminder(todo.id)}
                disabled={todo.completed}
              >
                <Icon
                  name={todo.completed ? "checkmark-circle" : "time-outline"}
                  size={20}
                  color={todo.completed ? theme.colors.success : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* My Favorites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('favorites_title')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeFavoriteTab === 'plans' && styles.tabActive]}
            onPress={() => setActiveFavoriteTab('plans')}
          >
            <Text style={[styles.tabText, activeFavoriteTab === 'plans' && styles.tabTextActive]}>{t('fav_plans')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeFavoriteTab === 'courses' && styles.tabActive]}
            onPress={() => setActiveFavoriteTab('courses')}
          >
            <Text style={[styles.tabText, activeFavoriteTab === 'courses' && styles.tabTextActive]}>{t('fav_courses')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeFavoriteTab === 'therapy' && styles.tabActive]}
            onPress={() => setActiveFavoriteTab('therapy')}
          >
            <Text style={[styles.tabText, activeFavoriteTab === 'therapy' && styles.tabTextActive]}>{t('fav_therapy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeFavoriteTab === 'offline' && styles.tabActive]}
            onPress={() => setActiveFavoriteTab('offline')}
          >
            <Text style={[styles.tabText, activeFavoriteTab === 'offline' && styles.tabTextActive]}>{t('fav_offline')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.favoritesContainer}>
          {favoriteData[activeFavoriteTab].map((item) => (
            <View key={item.id} style={styles.favoriteCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity>
                  <Icon
                    name={item.favorited ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={item.favorited ? theme.colors.error : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <View style={styles.cardFooter}>
                <StandardTag
                  type={getTagStyleType(item.tag)}
                  text={item.tag}
                />
                <Text style={styles.cardDuration}>{item.duration}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 日期选择器 */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>{t('select_date')}</Text>
            </View>
            <View style={styles.datePickerContent}>
              <DatePickerCalendarInline />
            </View>
            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={styles.datePickerCancel}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.datePickerCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerConfirm}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.datePickerConfirmText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      <CustomerService
        visible={showCustomerService}
        onClose={() => setShowCustomerService(false)}
      />
    </ScrollView>
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
    paddingTop: 60, // 增加顶部padding以避免灵动岛遮挡 (iPhone 14 Pro+)
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background, // 使用背景色而不是surface色
    // 移除阴影以避免与下方建议卡片的阴影割裂
  },
  headerContent: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: theme.lineHeight.tight * theme.fontSize.display,
  },
  date: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  testCalendarBtn: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.xs,
  },
  languageBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  customerServiceBtn: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.xs,
  },
  // V2 精修: 健康建议卡片样式优化 - 与其他卡片宽度一致
  healthSuggestionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.cardPadding,
    marginHorizontal: theme.spacing.xs, // 与下方其他卡片保持一致的边距
    marginTop: theme.spacing.sm, // 向上移动以减小与header的间距
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm, // 柔和的阴影
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: theme.spacing.md, // 添加与图标的间距
  },
  suggestionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  suggestionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.lineHeight.relaxed * theme.fontSize.sm,
  },
  suggestionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm, // 减小按钮高度
    paddingHorizontal: theme.spacing.md, // 减小按钮宽度
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'flex-end',
  },
  suggestionActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  todoContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  todoItemCompleted: {
    backgroundColor: theme.colors.surfaceElevated + '80',
    borderColor: theme.colors.success + '20',
    opacity: 0.7,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  // V2 精修: 已完成项文字变浅
  todoText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textLight, // 使用更淡的颜色
    opacity: 0.7,
  },
  reminderBtn: {
    padding: theme.spacing.md,
    marginLeft: theme.spacing.lg,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.xs,
  },
  reminderBtnCompleted: {
    backgroundColor: theme.colors.success + '20',
  },
  tabContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.colored,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tabTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
  },
  favoritesContainer: {
    gap: theme.spacing.lg,
  },
  favoriteCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTag: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  cardDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  modalCancelButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  reminderSection: {
    marginBottom: theme.spacing.xl,
  },
  reminderSectionTitle: {
    fontSize: theme.fontSize.md,
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
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  reminderTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reminderTypeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  reminderTypeTextActive: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.medium,
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timePickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  timeRangeSeparator: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  allDayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  repeatButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  repeatButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  repeatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  repeatTextActive: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.medium,
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
  },
  customRepeatInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  ebbinghausDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  ebbinghausPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  ebbinghausDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  datePickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  dateRangeContainer: {
    marginTop: theme.spacing.lg,
  },
  dateRangeTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dateRangeSeparator: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xs,
  },
  ebbinghausPreviewTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  inlineDatePicker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  datePickerConfirmButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  // Picker Modal Styles
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 20,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerModalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  pickerModalCancel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  pickerModalConfirm: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  dateTimePicker: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
  },
  // Inline Picker Styles
  inlinePickerContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  inlinePickerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  inlinePicker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  // New Picker Styles
  pickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.lg,
  },
  pickerCancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerConfirmButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  pickerCancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  pickerConfirmText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.medium,
  },
  // Calendar Modal Styles
  calendarModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing.xl,
    maxWidth: '90%',
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.lg,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  calendarModalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  calendarModalCancel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  calendarModalSpacer: {
    width: 50,
  },
  flexOne: {
    flex: 1,
  },
  // Time Picker Styles
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
  // Date Picker Modal Styles
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

  // === NEW REDESIGN STYLES ===

  // Status Chip
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  statusChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },

  // Sleep Summary Card
  sleepSummaryCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sleepSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sleepSummaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  sleepSummaryTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sleepSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sleepMetric: {
    alignItems: 'center',
    flex: 1,
  },
  sleepMetricValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sleepMetricLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  sleepMetricDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },

  // Pinned Actions
  pinnedActions: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  pinnedActionsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pinnedActionsScroll: {
    flexDirection: 'row',
  },
  pinnedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
    ...theme.shadows.xs,
    gap: theme.spacing.xs,
  },
  pinnedActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
});

export default HomeScreen;
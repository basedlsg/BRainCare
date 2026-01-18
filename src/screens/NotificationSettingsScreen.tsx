import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface ReminderItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  time: Date;
  icon: string;
}

const NotificationSettingsScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);

  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: '1',
      title: '喝水提醒',
      description: '定时提醒补充水分',
      enabled: true,
      time: new Date(2024, 0, 1, 9, 0),
      icon: 'water-outline',
    },
    {
      id: '2',
      title: '运动提醒',
      description: '每日运动健身提醒',
      enabled: false,
      time: new Date(2024, 0, 1, 18, 0),
      icon: 'barbell-outline',
    },
    {
      id: '3',
      title: '睡眠提醒',
      description: '准时就寝提醒',
      enabled: true,
      time: new Date(2024, 0, 1, 22, 30),
      icon: 'moon-outline',
    },
    {
      id: '4',
      title: '冥想提醒',
      description: '放松身心冥想时间',
      enabled: false,
      time: new Date(2024, 0, 1, 20, 0),
      icon: 'leaf-outline',
    },
    {
      id: '5',
      title: '服药提醒',
      description: '按时服药健康提醒',
      enabled: false,
      time: new Date(2024, 0, 1, 8, 0),
      icon: 'medical-outline',
    },
  ]);

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const updateReminderTime = (id: string, newTime: Date) => {
    setReminders(prev =>
      prev.map(item =>
        item.id === id ? { ...item, time: newTime } : item
      )
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleTimePress = (id: string) => {
    setShowTimePicker(id);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(null);
    }

    if (event.type === 'dismissed') {
      setShowTimePicker(null);
      return;
    }

    if (selectedTime && showTimePicker) {
      updateReminderTime(showTimePicker, selectedTime);
    }

    if (Platform.OS === 'ios') {
      setShowTimePicker(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('title_notification_settings')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ns_general')}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Icon name="volume-high-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('ns_sound')}</Text>
                <Text style={styles.settingDescription}>{t('ns_sound_desc')}</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={soundEnabled ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Icon name="phone-portrait-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('ns_vibrate')}</Text>
                <Text style={styles.settingDescription}>{t('ns_vibrate_desc')}</Text>
              </View>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={vibrationEnabled ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ns_reminders')}</Text>

          {
            reminders.map((reminder, index) => (
              // Ideally we should map reminder dynamic content too, but for now let's just use the keys if we can
              // The state has them hardcoded. We need to update the state initialization or derived usage.
              // Updating state initialization:
              // But wait, state is initialized once. If lang changes, it won't update.
              // We should store KEYS in state, and translate in render.
              // BUT, that requires big refactor.
              // Quick fix: Just update the specific render part if possible, BUT the state holds the title/description.
              // So I must refactor the state or the rendering.
              // Let's refactor the rendering to look up translations based on ID if possible?
              // Or better, just update the state initialization with translated values? NO, that doesn't react to change.
              // I'll change the render to ignore the state title/desc and lookup valid ones.
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={reminder.icon} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.reminderTextContainer}>
                    <Text style={styles.reminderTitle}>{
                      reminder.id === '1' ? t('rem_water') :
                        reminder.id === '2' ? t('rem_sport') :
                          reminder.id === '3' ? t('rem_sleep') :
                            reminder.id === '4' ? t('rem_meditation') :
                              reminder.id === '5' ? t('rem_medicine') : reminder.title
                    }</Text>
                    <Text style={styles.reminderDescription}>{
                      reminder.id === '1' ? t('rem_water_desc') :
                        reminder.id === '2' ? t('rem_sport_desc') :
                          reminder.id === '3' ? t('rem_sleep_desc') :
                            reminder.id === '4' ? t('rem_meditation_desc') :
                              reminder.id === '5' ? t('rem_medicine_desc') : reminder.description
                    }</Text>
                    {reminder.enabled && (
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => handleTimePress(reminder.id)}
                      >
                        <Icon name="time-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.timeText}>{formatTime(reminder.time)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => toggleReminder(reminder.id)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={reminder.enabled ? theme.colors.surface : theme.colors.textSecondary}
                />
              </View>
            ))
          }
        </View >

        {/* Tips */}
        < View style={styles.tipsContainer} >
          <View style={styles.tipHeader}>
            <Icon name="information-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.tipTitle}>{t('ns_tips_title')}</Text>
          </View>
          <Text style={styles.tipText}>
            {t('ns_tips_content')}
          </Text>
        </View >
      </ScrollView >

      {/* Time Picker */}
      {
        showTimePicker && (
          <DateTimePicker
            value={reminders.find(r => r.id === showTimePicker)?.time || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )
      }
    </View >
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
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    ...theme.shadows.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  reminderDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  timeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  tipsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen;
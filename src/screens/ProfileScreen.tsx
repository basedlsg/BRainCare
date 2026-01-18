import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

interface ProfileItem {
  id: string;
  title: string;
  icon: string;
  hasArrow: boolean;
  gradient: string[];
  description: string;
  badge?: string;
  subtitle?: string;
  isDestructive?: boolean;
}

const ProfileScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const { showRawWaveforms, toggleRawWaveforms } = useSettings();
  const [userInfo, setUserInfo] = useState({
    nickname: t('user_nickname'),
    avatar: null,
  });

  // Simplified Profile: Only 4 items (per design spec)
  const profileItems = [
    {
      id: 'account',
      title: t('item_account'),
      icon: 'person-outline',
      color: theme.colors.success,
      description: t('item_account_desc'),
    },
    {
      id: 'membership',
      title: t('item_membership'),
      icon: 'diamond-outline',
      color: theme.colors.healthPurple,
      description: t('item_membership_desc'),
      badge: 'VIP',
    },
    {
      id: 'settings',
      title: t('settings'),
      icon: 'settings-outline',
      color: theme.colors.primary,
      description: t('settings_desc'),
    },
    {
      id: 'support',
      title: t('item_support'),
      icon: 'help-buoy-outline',
      color: theme.colors.warning,
      description: t('item_support_desc'),
    },
  ];

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'account':
        navigation.navigate('Account');
        break;
      case 'membership':
        Alert.alert(t('alert_membership'), t('alert_membership_msg'));
        break;
      case 'settings':
        navigation.navigate('SettingsHub');
        break;
      case 'support':
        navigation.navigate('Support');
        break;
      default:
        break;
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(t('item_account'), t('item_account_desc'), [
      { text: t('action_cancel'), style: 'cancel' },
      { text: t('action_album'), onPress: () => console.log('Select from gallery') },
      { text: t('action_camera'), onPress: () => console.log('Take photo') },
    ]);
  };

  const handleNicknamePress = () => {
    Alert.prompt(
      t('prompt_nickname'),
      t('prompt_nickname_msg'),
      (text) => {
        if (text && text.trim()) {
          setUserInfo(prev => ({ ...prev, nickname: text.trim() }));
        }
      },
      'plain-text',
      userInfo.nickname
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile_title')}</Text>
      </View>

      {/* Enhanced User Info */}
      <View style={styles.userSection}>
        <View style={styles.userProfileContainer}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            <View style={styles.avatarGradientBorder}>
              {userInfo.avatar ? (
                <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Icon name="person" size={32} color={theme.colors.surface} />
                </View>
              )}
            </View>
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={14} color={theme.colors.surface} />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.nicknameContainer} onPress={handleNicknamePress}>
              <Text style={styles.nickname}>{userInfo.nickname}</Text>
              <Icon name="pencil" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.userDescription}>{t('user_desc')}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>21</Text>
            <Text style={styles.statLabel}>{t('stat_record_days')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>85</Text>
            <Text style={styles.statLabel}>{t('stat_health_score')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t('stat_invited')}</Text>
          </View>
        </View>
      </View>

      {/* Simplified Profile Items (4 items only) */}
      <View style={styles.profileItemsContainer}>
        {profileItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.profileItemRow,
              index === profileItems.length - 1 && styles.profileItemRowLast,
            ]}
            onPress={() => handleItemPress(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.profileItemIcon, { backgroundColor: item.color + '15' }]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.profileItemContent}>
              <Text style={styles.profileItemTitle}>{item.title}</Text>
              <Text style={styles.profileItemDesc}>{item.description}</Text>
            </View>
            {item.badge && (
              <View style={styles.profileItemBadge}>
                <Icon name="diamond" size={10} color={theme.colors.surface} />
                <Text style={styles.profileItemBadgeText}>{item.badge}</Text>
              </View>
            )}
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>BrainCare v3.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  // Enhanced User Section Styles
  userSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xxl,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  userProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatarGradientBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    ...theme.shadows.colored,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  defaultAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primaryLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
    ...theme.shadows.xs,
  },
  userInfo: {
    flex: 1,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  nickname: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  userDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border + '50',
  },
  // Enhanced Settings List Styles
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsContainer: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  destructiveSection: {
    backgroundColor: theme.colors.error + '05',
    borderColor: theme.colors.error + '20',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight + '50',
    backgroundColor: 'transparent',
  },
  firstItem: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  lastItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  destructiveItem: {
    borderBottomWidth: 0,
    backgroundColor: theme.colors.error + '05',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconGradientContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.xs,
  },
  normalIcon: {
    backgroundColor: theme.colors.primary,
  },
  destructiveIcon: {
    backgroundColor: theme.colors.error,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  itemDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  itemSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
    ...theme.shadows.xs,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
    marginLeft: theme.spacing.xs,
  },
  arrowContainer: {
    padding: theme.spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  versionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },

  // === NEW SIMPLIFIED PROFILE ITEMS STYLES ===
  profileItemsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  profileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  profileItemRowLast: {
    borderBottomWidth: 0,
  },
  profileItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileItemDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  profileItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.healthPurple,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
  },
  profileItemBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
    marginLeft: theme.spacing.xs,
  },
});

export default ProfileScreen;
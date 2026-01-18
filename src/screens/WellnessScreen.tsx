import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import CustomerService from '../components/CustomerService';
import StandardTag from '../components/StandardTag';
import StandardIconContainer from '../components/StandardIconContainer';
import { useLanguage } from '../i18n/LanguageContext';

// const { width } = Dimensions.get('window');

type TabType = 'plans' | 'courses' | 'audio' | 'ai' | 'offline';

interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  duration?: string;
  price?: string;
  isPaid: boolean;
  isVip: boolean;
  isFavorited: boolean;
  type: string;
  distance?: string;
}

const WellnessScreen = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '3', '7']));
  const [chatInput, setChatInput] = useState('');
  const [showCustomerService, setShowCustomerService] = useState(false);

  const tabs = [
    { key: 'plans', title: t('tab_plans'), icon: 'calendar-outline' },
    { key: 'courses', title: t('tab_courses'), icon: 'book-outline' },
    { key: 'audio', title: t('tab_audio'), icon: 'volume-high-outline' },
    { key: 'ai', title: t('tab_ai'), icon: 'chatbubbles-outline' },
    { key: 'offline', title: t('tab_offline'), icon: 'location-outline' },
  ];

  const contentData: Record<TabType, ContentItem[]> = {
    plans: [
      {
        id: '1',
        title: t('plan_early_rise_title'),
        subtitle: t('plan_early_rise_desc'),
        duration: t('duration_21days'),
        isPaid: false,
        isVip: false,
        isFavorited: true,
        type: t('type_lifestyle'),
      },
      {
        id: '2',
        title: t('plan_schedule_opt'),
        subtitle: t('plan_schedule_desc'),
        duration: '30 ' + t('summary_days'),
        isPaid: false,
        isVip: true,
        isFavorited: false,
        type: t('type_schedule'),
      },
      {
        id: '3',
        title: t('plan_sleep_improve'),
        subtitle: t('plan_sleep_desc'),
        duration: t('duration_14days'),
        isPaid: true,
        isVip: false,
        isFavorited: true,
        type: t('type_sleep'),
        price: '¥88',
      },
    ],
    courses: [
      {
        id: '4',
        title: t('course_cbti'),
        subtitle: t('course_cbti_desc'),
        duration: '8 ' + t('duration_10lessons').split(' ')[1], // reusing lesson word or adding new key? keeping simple
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: t('type_psychology'),
        price: '¥198',
      },
      {
        id: '5',
        title: t('course_focus'),
        subtitle: t('course_focus_desc'),
        duration: '12 ' + t('duration_10lessons').split(' ')[1],
        isPaid: false,
        isVip: true,
        isFavorited: false,
        type: t('type_cognitive'),
      },
      {
        id: '6',
        title: t('course_happiness'),
        subtitle: t('course_happiness_desc'),
        duration: '30 ' + t('duration_10lessons').split(' ')[1],
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: t('type_emotion'),
        price: '¥298',
      },
    ],
    audio: [
      {
        id: '7',
        title: t('audio_alpha'),
        subtitle: t('audio_alpha_desc'),
        duration: '16 ' + t('unit_mins'),
        isPaid: false,
        isVip: true,
        isFavorited: true,
        type: t('type_brainwave'),
      },
      {
        id: '8',
        title: t('audio_white_noise'),
        subtitle: t('audio_white_noise_desc'),
        duration: '45 ' + t('unit_mins'),
        isPaid: false,
        isVip: true,
        isFavorited: false,
        type: t('type_sleep_audio'),
      },
      {
        id: '9',
        title: t('audio_beta'),
        subtitle: t('audio_beta_desc'),
        duration: '20 ' + t('unit_mins'),
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: t('type_brainwave'),
        price: '¥9.9',
      },
    ],
    ai: [],
    offline: [
      {
        id: '10',
        title: t('offline_center'),
        subtitle: t('offline_center_desc'),
        distance: '2.5 km',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: t('type_therapy_center'),
        price: '¥225',
      },
      {
        id: '11',
        title: t('offline_beauty'),
        subtitle: t('offline_beauty_desc'),
        distance: '1.2 km',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: t('type_spa'),
        price: '¥188',
      },
      {
        id: '12',
        title: t('offline_counsel'),
        subtitle: t('offline_counsel_desc'),
        distance: '3.8 km',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: t('type_counseling'),
        price: '¥380',
      },
    ],
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // V2 精修: 移除混乱的渐变色映射，使用统一的卡片样式
  const getTagType = (type: string): 'lifestyle' | 'schedule' | 'sleep' | 'psychology' | 'cognitive' | 'emotion' | 'brainwave' | 'sleep_audio' => {
    // Basic check using translated strings or keys if we refactored
    // For now, doing a best effort match based on the translated value could be tricky if languages change.
    // Ideally we'd store the "key" in the data object (e.g. 'type_lifestyle') and translate for display only.
    // Given the refactor scale, I will simplified the check or rely on the fact that I'm inserting `t('type_lifestyle')`.
    // Actually, let's just make a helper that checks against valid values for current language or fallback.
    // BUT, the cleaner way is to use english keys as types in data, and translate in render.
    // However, to minimize diffs, I'll just map the likely strings.
    // Since I replaced type: t('type_lifestyle'), I can check if type === t('type_lifestyle').

    if (type === t('type_lifestyle')) return 'lifestyle';
    if (type === t('type_schedule')) return 'schedule';
    if (type === t('type_sleep')) return 'sleep';
    if (type === t('type_psychology')) return 'psychology';
    if (type === t('type_cognitive')) return 'cognitive';
    if (type === t('type_emotion')) return 'emotion';
    if (type === t('type_brainwave')) return 'brainwave';
    if (type === t('type_sleep_audio')) return 'sleep_audio';
    return 'lifestyle';
  };

  // V2 精修: 统一图标映射逻辑
  const getCardIcon = (type: string, tabType: TabType) => {
    // Simplified logic since we are using translated strings
    return 'star';
  };

  // V2 精修: 获取图标颜色
  const getIconColor = (type: string, tabType: TabType) => {
    return theme.colors.primary;
  };

  // Re-implementing clearer icon/color logic without string parsing if possible,
  // or just restoring basic checks against the new translated values.
  const getCardStyle = (type: string, tabType: TabType) => {
    // Helper to return icon and color
    if (tabType === 'plans') {
      if (type === t('type_sleep')) return { icon: 'bed', color: theme.colors.healthPurple };
      if (type === t('type_schedule')) return { icon: 'time', color: theme.colors.secondary };
      return { icon: 'fitness', color: theme.colors.success };
    }
    // ... similar logic for others
    if (tabType === 'courses') {
      if (type === t('type_psychology')) return { icon: 'heart', color: theme.colors.error };
      if (type === t('type_cognitive')) return { icon: 'analytics', color: theme.colors.primary };
      return { icon: 'school', color: theme.colors.info };
    }
    if (tabType === 'audio') {
      if (type === t('type_brainwave')) return { icon: 'radio', color: theme.colors.healthPurple };
      return { icon: 'musical-notes', color: theme.colors.accent };
    }
    return { icon: 'star', color: theme.colors.primary };
  };

  // V2 精修: 完全重构卡片，使用统一的设计规范
  const renderContentCard = ({ item }: { item: ContentItem }) => {
    // const iconName = getCardIcon(item.type, activeTab);
    // const iconColor = getIconColor(item.type, activeTab);
    const { icon: iconName, color: iconColor } = getCardStyle(item.type, activeTab);
    const tagType = getTagType(item.type);

    return (
      <TouchableOpacity style={styles.contentCard} activeOpacity={0.8}>
        <View style={styles.cardContainer}>
          {/* V2 精修: 右上角标准化图标容器 */}
          <View style={styles.cardIconContainer}>
            <StandardIconContainer
              iconName={iconName}
              iconColor={iconColor}
              iconSize={20}
              backgroundColor={iconColor + '15'}
              size={40}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardBadges}>
                  {/* V2 精修: 使用标准化Tag组件，为保持高度一致，预留标签空间 */}
                  {item.isVip ? (
                    <StandardTag type="vip" text={t('tag_vip')} />
                  ) : item.isPaid ? (
                    <StandardTag type="paid" text={t('tag_paid')} />
                  ) : (
                    <View style={styles.badgePlaceholder} />
                  )}
                </View>
              </View>
            </View>

            {/* 书签按钮单独放置，避免与右上角图标重合 */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Icon
                name={favorites.has(item.id) ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={favorites.has(item.id) ? theme.colors.error : theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

            <View style={styles.cardFooter}>
              {/* V2 精修: 使用标准化类型标签 */}
              <StandardTag type={tagType} text={item.type} />
              <View style={styles.cardMeta}>
                {item.duration && (
                  <View style={styles.cardMetaItem}>
                    <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.cardDuration}>{item.duration}</Text>
                  </View>
                )}
                {item.distance && (
                  <View style={styles.cardMetaItem}>
                    <Icon name="location-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.cardDistance}>{item.distance}</Text>
                  </View>
                )}
                {item.price && (
                  <Text style={[styles.cardPrice, { color: iconColor }]}>{item.price}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAIChat = () => (
    <View style={styles.aiChatContainer}>
      <View style={styles.chatHeaderGradient}>
        <View style={styles.chatHeader}>
          <View style={styles.chatTitleContainer}>
            <View style={styles.aiAvatarLarge}>
              <Icon name="sparkles" size={24} color={theme.colors.surface} />
            </View>
            <View style={styles.chatTitleInfo}>
              <Text style={styles.chatTitle}>{t('ai_title')}</Text>
              <Text style={styles.chatSubtitle}>{t('ai_subtitle')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.historyButton}>
            <Icon name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.historyButtonText}>{t('ai_history')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
        <View style={styles.aiMessage}>
          <View style={styles.aiAvatar}>
            <Icon name="sparkles" size={16} color={theme.colors.surface} />
          </View>
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              {t('ai_intro')}
            </Text>
            <Text style={styles.messageTime}>{t('ai_just_now')}</Text>
          </View>
        </View>

        <View style={styles.quickReplies}>
          <Text style={styles.quickRepliesTitle}>{t('ai_quick_ask')}</Text>
          <View style={styles.quickRepliesContainer}>
            {[t('ai_q1'), t('ai_q2'), t('ai_q3')].map((question, index) => (
              <TouchableOpacity key={index} style={styles.quickReplyButton}>
                <Text style={styles.quickReplyText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.chatInput}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={t('ai_input_placeholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
          />
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="add-circle-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sendButton}>
          <Icon name="send" size={18} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('therapies_title')}</Text>
        <TouchableOpacity
          style={styles.customerServiceBtn}
          onPress={() => setShowCustomerService(true)}
        >
          <Icon name="headset-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Recommended for You - NEW */}
      <View style={styles.recommendedSection}>
        <View style={styles.recommendedHeader}>
          <Text style={styles.recommendedTitle}>{t('recommended_for_you')}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>{t('see_all_therapies')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedScroll}
        >
          {/* Sleep Therapy Card */}
          <TouchableOpacity style={styles.recommendedCard} activeOpacity={0.8}>
            <View style={[styles.recommendedIcon, { backgroundColor: theme.colors.healthPurple + '20' }]}>
              <Icon name="bed-outline" size={24} color={theme.colors.healthPurple} />
            </View>
            <Text style={styles.recommendedCardTitle}>{t('category_sleep')}</Text>
            <Text style={styles.recommendedCardSubtitle}>{t('suggestion_wind_down')}</Text>
            <TouchableOpacity style={styles.recommendedCardBtn}>
              <Text style={styles.recommendedCardBtnText}>{t('start_therapy')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Focus Therapy Card */}
          <TouchableOpacity style={styles.recommendedCard} activeOpacity={0.8}>
            <View style={[styles.recommendedIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="flash-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.recommendedCardTitle}>{t('category_focus')}</Text>
            <Text style={styles.recommendedCardSubtitle}>{t('plan_focus_subtitle')}</Text>
            <TouchableOpacity style={styles.recommendedCardBtn}>
              <Text style={styles.recommendedCardBtnText}>{t('start_therapy')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Meditation Card */}
          <TouchableOpacity style={styles.recommendedCard} activeOpacity={0.8}>
            <View style={[styles.recommendedIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="leaf-outline" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.recommendedCardTitle}>{t('category_meditation')}</Text>
            <Text style={styles.recommendedCardSubtitle}>{t('course_meditation_subtitle')}</Text>
            <TouchableOpacity style={styles.recommendedCardBtn}>
              <Text style={styles.recommendedCardBtnText}>{t('start_therapy')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Browse Categories Label */}
      <View style={styles.browseCategoriesHeader}>
        <Text style={styles.browseCategoriesTitle}>{t('browse_categories')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key as TabType)}
              activeOpacity={0.8}
            >
              <View style={activeTab === tab.key ? styles.activeTabContent : styles.inactiveTabContent}>
                <Icon
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.key ? theme.colors.surface : theme.colors.textSecondary}
                />
                <Text style={activeTab === tab.key ? styles.activeTabText : styles.tabText}>
                  {tab.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'ai' ? (
          renderAIChat()
        ) : (
          <FlatList
            data={contentData[activeTab]}
            renderItem={renderContentCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          />
        )}
      </View>

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
  // Enhanced Tab Styles
  tabContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  tabScrollContainer: {
    paddingRight: theme.spacing.lg,
  },
  tab: {
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    ...theme.shadows.colored,
    elevation: 4,
  },
  activeTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  activeTabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.surface,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  // V2 精修: 统一内容卡片样式
  contentCard: {
    marginBottom: theme.spacing.cardMargin,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    position: 'relative',
  },
  cardIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  cardContent: {
    padding: theme.spacing.cardPadding,
    paddingTop: theme.spacing.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 24,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  badgePlaceholder: {
    height: 20, // 与StandardTag高度一致
    minHeight: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 64, // 在图标下方位置
    right: 16,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.xs,
    zIndex: 1,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
  },
  // V2 精修: 移除旧的类型容器样式，使用StandardTag
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  cardDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  cardDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  cardPrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  // Enhanced AI Chat Styles
  aiChatContainer: {
    flex: 1,
  },
  chatHeaderGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    ...theme.shadows.colored,
  },
  chatTitleInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  chatSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.xs,
  },
  historyButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  aiMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    ...theme.shadows.xs,
  },
  messageContent: {
    maxWidth: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  messageText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  messageTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  quickReplies: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  quickRepliesTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.md,
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickReplyButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.xs,
  },
  quickReplyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    maxHeight: 80,
    paddingVertical: theme.spacing.sm,
    lineHeight: 20,
  },
  attachButton: {
    padding: theme.spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    ...theme.shadows.colored,
    elevation: 4,
  },

  // === NEW RECOMMENDED SECTION STYLES ===
  recommendedSection: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  recommendedTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAllLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  recommendedScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  recommendedCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: 160,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  recommendedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  recommendedCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recommendedCardSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  recommendedCardBtn: {
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
  },
  recommendedCardBtnText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  browseCategoriesHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  browseCategoriesTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});

export default WellnessScreen;
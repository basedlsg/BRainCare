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
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '3', '7']));
  const [chatInput, setChatInput] = useState('');
  const [showCustomerService, setShowCustomerService] = useState(false);

  const tabs = [
    { key: 'plans', title: '计划', icon: 'calendar-outline' },
    { key: 'courses', title: '课程', icon: 'book-outline' },
    { key: 'audio', title: '声疗', icon: 'volume-high-outline' },
    { key: 'ai', title: 'AI助手', icon: 'chatbubbles-outline' },
    { key: 'offline', title: '线下服务', icon: 'location-outline' },
  ];

  const contentData: Record<TabType, ContentItem[]> = {
    plans: [
      {
        id: '1',
        title: '21天早起计划',
        subtitle: '养成早起习惯，提升生活品质',
        duration: '21天',
        isPaid: false,
        isVip: false,
        isFavorited: true,
        type: '生活习惯',
      },
      {
        id: '2',
        title: '高效作息优化',
        subtitle: '科学安排作息时间，提高工作效率',
        duration: '30天',
        isPaid: false,
        isVip: true,
        isFavorited: false,
        type: '作息管理',
      },
      {
        id: '3',
        title: '睡眠质量改善计划',
        subtitle: '通过脑电反馈训练改善睡眠',
        duration: '14天',
        isPaid: true,
        isVip: false,
        isFavorited: true,
        type: '睡眠改善',
        price: '¥88',
      },
    ],
    courses: [
      {
        id: '4',
        title: 'CBT-I睡眠课程',
        subtitle: '认知行为疗法改善失眠问题',
        duration: '8节课',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: '心理健康',
        price: '¥198',
      },
      {
        id: '5',
        title: '专注力提升训练',
        subtitle: '科学训练方法提升注意力',
        duration: '12节课',
        isPaid: false,
        isVip: true,
        isFavorited: false,
        type: '认知训练',
      },
      {
        id: '6',
        title: '30天幸福课',
        subtitle: '积极心理学帮你找到内心平静',
        duration: '30节课',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: '情绪管理',
        price: '¥298',
      },
    ],
    audio: [
      {
        id: '7',
        title: 'Alpha脑波音乐',
        subtitle: '促进放松和专注状态',
        duration: '16分钟',
        isPaid: false,
        isVip: true,
        isFavorited: true,
        type: '脑波音乐',
      },
      {
        id: '8',
        title: '白噪音助眠',
        subtitle: '自然声音帮助入睡',
        duration: '45分钟',
        isPaid: false,
        isVip: true,
        isFavorited: false,
        type: '助眠音频',
      },
      {
        id: '9',
        title: 'Beta波专注音乐',
        subtitle: '提升工作学习专注力',
        duration: '20分钟',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: '脑波音乐',
        price: '¥9.9',
      },
    ],
    ai: [],
    offline: [
      {
        id: '10',
        title: '静心理疗中心',
        subtitle: '专业脑电反馈训练',
        distance: '2.5 km',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: '理疗中心',
        price: '¥225',
      },
      {
        id: '11',
        title: '禅意美容院',
        subtitle: '身心放松综合护理',
        distance: '1.2 km',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: '美容院',
        price: '¥188',
      },
      {
        id: '12',
        title: '心理健康咨询室',
        subtitle: '专业心理咨询服务',
        distance: '3.8 km',
        isPaid: true,
        isVip: false,
        isFavorited: false,
        type: '心理咨询',
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
    if (type.includes('生活习惯')) return 'lifestyle';
    if (type.includes('作息管理')) return 'schedule';
    if (type.includes('睡眠')) return 'sleep';
    if (type.includes('心理')) return 'psychology';
    if (type.includes('认知')) return 'cognitive';
    if (type.includes('情绪')) return 'emotion';
    if (type.includes('脑波')) return 'brainwave';
    if (type.includes('助眠')) return 'sleep_audio';
    return 'lifestyle';
  };

  // V2 精修: 统一图标映射逻辑
  const getCardIcon = (type: string, tabType: TabType) => {
    if (tabType === 'plans') {
      if (type.includes('睡眠')) return 'bed';
      if (type.includes('作息')) return 'time';
      return 'fitness';
    } else if (tabType === 'courses') {
      if (type.includes('心理')) return 'heart';
      if (type.includes('认知')) return 'analytics';
      if (type.includes('情绪')) return 'happy';
      return 'school';
    } else if (tabType === 'audio') {
      if (type.includes('脑波')) return 'radio';
      if (type.includes('助眠')) return 'moon';
      return 'musical-notes';
    } else if (tabType === 'offline') {
      if (type.includes('理疗')) return 'medical';
      if (type.includes('美容')) return 'flower';
      if (type.includes('心理')) return 'heart';
      return 'location';
    }
    return 'star';
  };

  // V2 精修: 获取图标颜色，基于内容类型
  const getIconColor = (type: string, tabType: TabType) => {
    if (tabType === 'plans') {
      if (type.includes('睡眠')) return theme.colors.healthPurple;
      if (type.includes('作息')) return theme.colors.secondary;
      return theme.colors.success;
    } else if (tabType === 'courses') {
      if (type.includes('心理')) return theme.colors.error;
      if (type.includes('认知')) return theme.colors.primary;
      if (type.includes('情绪')) return theme.colors.warning;
      return theme.colors.info;
    } else if (tabType === 'audio') {
      if (type.includes('脑波')) return theme.colors.healthPurple;
      if (type.includes('助眠')) return theme.colors.healthBlue;
      return theme.colors.accent;
    } else if (tabType === 'offline') {
      if (type.includes('理疗')) return theme.colors.primary;
      if (type.includes('美容')) return theme.colors.healthGreen;
      if (type.includes('心理')) return theme.colors.error;
      return theme.colors.info;
    }
    return theme.colors.primary;
  };

  // V2 精修: 完全重构卡片，使用统一的设计规范
  const renderContentCard = ({ item }: { item: ContentItem }) => {
    const iconName = getCardIcon(item.type, activeTab);
    const iconColor = getIconColor(item.type, activeTab);
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
                    <StandardTag type="vip" text="VIP" />
                  ) : item.isPaid ? (
                    <StandardTag type="paid" text="付费" />
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
              <Text style={styles.chatTitle}>AI健康助手</Text>
              <Text style={styles.chatSubtitle}>专业的健康指导和建议</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.historyButton}>
            <Icon name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.historyButtonText}>历史</Text>
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
              嗨，您好！😊 我是您的AI健康助手。我可以为您提供：
              
              • 个性化健康建议
              • 脑电数据分析
              • 睡眠质量改善
              • 冥想和放松技巧
              
              有什么问题尽管问我吧！🌱
            </Text>
            <Text style={styles.messageTime}>刚刚</Text>
          </View>
        </View>
        
        <View style={styles.quickReplies}>
          <Text style={styles.quickRepliesTitle}>快速提问：</Text>
          <View style={styles.quickRepliesContainer}>
            {['如何改善睡眠？', '压力太大怎么办？', '推荐冥想方法'].map((question, index) => (
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
            placeholder="请输入您的问题..."
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
        <Text style={styles.headerTitle}>理疗</Text>
        <TouchableOpacity 
          style={styles.customerServiceBtn}
          onPress={() => setShowCustomerService(true)}
        >
          <Icon name="headset-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
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
});

export default WellnessScreen;
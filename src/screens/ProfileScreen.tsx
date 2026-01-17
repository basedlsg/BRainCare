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
  const [userInfo, setUserInfo] = useState({
    nickname: '用户昵称',
    avatar: null,
  });

  const profileSections: { title: string; items: ProfileItem[] }[] = [
    {
      title: '个人中心',
      items: [
        {
          id: 'account',
          title: '我的账号',
          icon: 'person-outline',
          hasArrow: true,
          gradient: ['#34D399', '#6EE7B7'],
          description: '个人信息管理',
        },
        {
          id: 'membership',
          title: '会员中心',
          icon: 'diamond-outline',
          hasArrow: true,
          badge: 'VIP',
          gradient: ['#F472B6', '#EC4899'],
          description: '享受更多会员权益',
        },
      ]
    },
    {
      title: '设置与偏好',
      items: [
        {
          id: 'notifications',
          title: '声音和通知',
          icon: 'notifications-outline',
          hasArrow: true,
          gradient: ['#FDBA74', '#FCD34D'],
          description: '通知提醒设置',
        },
        {
          id: 'language',
          title: '更改语言',
          icon: 'globe-outline',
          hasArrow: true,
          subtitle: '简体中文',
          gradient: ['#60A5FA', '#93C5FD'],
          description: '选择您的语言',
        },
        {
          id: 'bluetooth',
          title: '蓝牙设备调试',
          icon: 'bluetooth-outline',
          hasArrow: true,
          gradient: ['#60A5FA', '#93C5FD'],
          description: '连接和调试EEG蓝牙设备',
        },
        {
          id: 'bletest',
          title: 'BLE 扫描测试',
          icon: 'radio-outline',
          hasArrow: true,
          gradient: ['#10B981', '#34D399'],
          description: '简化的BLE设备扫描测试工具',
        },
      ]
    },
    {
      title: '购买与服务',
      items: [
        {
          id: 'orders',
          title: '订单信息',
          icon: 'receipt-outline',
          hasArrow: true,
          gradient: ['#BA68C8', '#CE93D8'],
          description: '查看购买历史',
        },
        {
          id: 'support',
          title: '打赏应用',
          icon: 'heart-outline',
          hasArrow: true,
          gradient: ['#F87171', '#FCA5A5'],
          description: '支持应用发展',
        },
        {
          id: 'invite',
          title: '邀请好友',
          icon: 'share-outline',
          hasArrow: true,
          subtitle: '已邀请 3 位好友',
          gradient: ['#4ADE80', '#86EFAC'],
          description: '分享获取奖励',
        },
      ]
    },
    {
      title: '帮助与反馈',
      items: [
        {
          id: 'guide',
          title: '操作指南',
          icon: 'help-circle-outline',
          hasArrow: true,
          gradient: ['#A78BFA', '#C4B5FD'],
          description: '应用使用教程',
        },
        {
          id: 'feedback',
          title: '提交建议',
          icon: 'chatbubble-outline',
          hasArrow: true,
          gradient: ['#FB923C', '#FDBA74'],
          description: '意见反馈和建议',
        },
      ]
    },
    {
      title: '法律与隐私',
      items: [
        {
          id: 'terms',
          title: '服务条款',
          icon: 'document-text-outline',
          hasArrow: true,
          gradient: ['#94A3B8', '#CBD5E1'],
          description: '查看服务条款',
        },
        {
          id: 'privacy',
          title: '隐私政策',
          icon: 'lock-closed-outline',
          hasArrow: true,
          gradient: ['#6B7280', '#9CA3AF'],
          description: '隐私保护政策',
        },
      ]
    },
    {
      title: '',
      items: [
        {
          id: 'logout',
          title: '退出登录',
          icon: 'log-out-outline',
          hasArrow: false,
          isDestructive: true,
          gradient: ['#F87171', '#FCA5A5'],
          description: '退出当前账号',
        },
      ]
    },
  ];

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'account':
        Alert.alert('我的账号', '手机号、微信、QQ绑定管理');
        break;
      case 'membership':
        Alert.alert('会员中心', '购买会员享受更多权益');
        break;
      case 'notifications':
        navigation.navigate('NotificationSettings');
        break;
      case 'language':
        Alert.alert('选择语言', '可选择：English、简体中文、繁體中文等');
        break;
      case 'bluetooth':
        navigation.navigate('BluetoothDebug');
        break;
      case 'bletest':
        navigation.navigate('BleTest');
        break;
      case 'orders':
        Alert.alert('订单信息', '查看购买历史和订单详情');
        break;
      case 'guide':
        Alert.alert('操作指南', '查看应用使用教程');
        break;
      case 'feedback':
        Alert.alert('提交建议', '向我们提供宝贵的意见和建议');
        break;
      case 'support':
        Alert.alert('打赏应用', '支持应用开发，感谢您的支持');
        break;
      case 'invite':
        Alert.alert('邀请好友', '分享邀请码，获得奖励');
        break;
      case 'terms':
        Alert.alert('服务条款', '查看应用服务条款');
        break;
      case 'privacy':
        Alert.alert('隐私政策', '查看隐私保护政策');
        break;
      case 'logout':
        Alert.alert(
          '退出登录',
          '确定要退出当前账号吗？',
          [
            { text: '取消', style: 'cancel' },
            { text: '确定', style: 'destructive', onPress: () => console.log('Logout') },
          ]
        );
        break;
      default:
        break;
    }
  };

  const handleAvatarPress = () => {
    Alert.alert('更换头像', '选择头像来源', [
      { text: '取消', style: 'cancel' },
      { text: '相册', onPress: () => console.log('Select from gallery') },
      { text: '拍照', onPress: () => console.log('Take photo') },
    ]);
  };

  const handleNicknamePress = () => {
    Alert.prompt(
      '修改昵称',
      '请输入新的昵称',
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
        <Text style={styles.headerTitle}>我的</Text>
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
            <Text style={styles.userDescription}>健康管理专家 · 会员用户</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>21</Text>
            <Text style={styles.statLabel}>记录天数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>85</Text>
            <Text style={styles.statLabel}>健康评分</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>已邀请</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Profile Sections */}
      {profileSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionContainer}>
          {section.title ? (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          ) : null}
          
          <View style={[
            styles.itemsContainer,
            section.title === '' && styles.destructiveSection
          ]}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.profileItem,
                  itemIndex === 0 && styles.firstItem,
                  itemIndex === section.items.length - 1 && styles.lastItem,
                  item.isDestructive && styles.destructiveItem,
                ]}
                onPress={() => handleItemPress(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.itemLeft}>
                  <View style={[
                    styles.iconGradientContainer,
                    item.isDestructive ? styles.destructiveIcon : styles.normalIcon
                  ]}>
                    <Icon
                      name={item.icon}
                      size={18}
                      color={theme.colors.surface}
                    />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={[
                      styles.itemTitle,
                      item.isDestructive && styles.destructiveText
                    ]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.itemRight}>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Icon name="diamond" size={10} color={theme.colors.surface} />
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {item.hasArrow && (
                    <View style={styles.arrowContainer}>
                      <Icon
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>BrainCare v1.0.0</Text>
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
});

export default ProfileScreen;
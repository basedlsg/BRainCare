import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';

interface CustomerServiceProps {
  visible: boolean;
  onClose: () => void;
}

const CustomerService: React.FC<CustomerServiceProps> = ({ visible, onClose }) => {
  const [showContactInfo, setShowContactInfo] = useState(false);

  const handleAIAssistant = () => {
    onClose();
    // 这里可以导航到AI助手页面或打开AI聊天
    Alert.alert('AI助手', '正在为您启动智能客服...');
  };

  const handleManualSupport = () => {
    setShowContactInfo(true);
  };

  const handleCall = () => {
    const phoneNumber = '400-123-4567';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('提示', '无法拨打电话，请手动拨打：' + phoneNumber);
    });
  };

  const handleWechat = () => {
    Alert.alert('客服微信', '请添加微信号：BrainCare_Service', [
      { text: '取消', style: 'cancel' },
      { text: '复制微信号', onPress: () => console.log('Copy WeChat ID') },
    ]);
  };

  const ContactInfoModal = () => (
    <Modal
      visible={showContactInfo}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowContactInfo(false)}
    >
      <View style={styles.contactModalOverlay}>
        <View style={styles.contactModalContent}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactTitle}>人工客服</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowContactInfo(false)}
            >
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactItemHeader}>
              <Icon name="call-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.contactItemTitle}>客服电话</Text>
            </View>
            <Text style={styles.contactItemValue}>400-123-4567</Text>
            <TouchableOpacity style={styles.contactAction} onPress={handleCall}>
              <Text style={styles.contactActionText}>立即拨打</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactItemHeader}>
              <Icon name="chatbubbles-outline" size={20} color={theme.colors.success} />
              <Text style={styles.contactItemTitle}>商务微信</Text>
            </View>
            <Text style={styles.contactItemValue}>BrainCare_Service</Text>
            <TouchableOpacity style={styles.contactAction} onPress={handleWechat}>
              <Text style={styles.contactActionText}>添加微信</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.workingHours}>
            <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.workingHoursText}>
              工作时间：周一至周五 9:00-18:00
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAIAssistant}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.iconContainer}>
                  <Icon name="chatbubbles" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>智能客服</Text>
                  <Text style={styles.menuSubtitle}>AI助手为您解答问题</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleManualSupport}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.iconContainer}>
                  <Icon name="person" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>转人工</Text>
                  <Text style={styles.menuSubtitle}>联系专业客服人员</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ContactInfoModal />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  menuItem: {
    padding: theme.spacing.lg,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  contactModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactModalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    width: '85%',
    ...theme.shadows.heavy,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  contactItem: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  contactItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  contactItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  contactItemValue: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.md,
  },
  contactAction: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  contactActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.medium,
  },
  workingHours: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  workingHoursText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
});

export default CustomerService;
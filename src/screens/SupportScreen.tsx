import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface SupportScreenProps {
    navigation: any;
}

const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
    const { t } = useLanguage();

    const supportItems = [
        {
            key: 'guide',
            title: t('item_guide'),
            icon: 'help-circle-outline',
            color: theme.colors.primary,
            description: t('item_guide_desc'),
        },
        {
            key: 'feedback',
            title: t('item_feedback'),
            icon: 'chatbubble-outline',
            color: theme.colors.success,
            description: t('item_feedback_desc'),
        },
        {
            key: 'faq',
            title: t('support_faq'),
            icon: 'document-text-outline',
            color: theme.colors.info,
            description: t('support_faq_desc'),
        },
        {
            key: 'contact',
            title: t('support_contact'),
            icon: 'mail-outline',
            color: theme.colors.warning,
            description: t('support_contact_desc'),
        },
    ];

    const handleItemPress = (key: string) => {
        switch (key) {
            case 'guide':
                // Open user guide
                break;
            case 'feedback':
                // Open feedback form
                break;
            case 'faq':
                // Open FAQ page
                break;
            case 'contact':
                Linking.openURL('mailto:support@braincare.app');
                break;
        }
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
                <Text style={styles.headerTitle}>{t('item_support')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <Icon name="heart" size={32} color={theme.colors.surface} />
                    </View>
                    <Text style={styles.heroTitle}>{t('support_hero_title')}</Text>
                    <Text style={styles.heroSubtitle}>{t('support_hero_subtitle')}</Text>
                </View>

                {/* Support Items */}
                <View style={styles.itemsContainer}>
                    {supportItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.itemRow,
                                index === supportItems.length - 1 && styles.itemRowLast,
                            ]}
                            onPress={() => handleItemPress(item.key)}
                        >
                            <View style={[styles.itemIcon, { backgroundColor: item.color + '15' }]}>
                                <Icon name={item.icon} size={22} color={item.color} />
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickButton}>
                        <Icon name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.quickButtonText}>{t('support_live_chat')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickButton}>
                        <Icon name="call-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.quickButtonText}>{t('support_call')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.xs,
    },
    backButton: {
        padding: theme.spacing.xs,
    },
    headerTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    headerSpacer: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    heroCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.colored,
    },
    heroIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    heroTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.surface,
        marginBottom: theme.spacing.xs,
    },
    heroSubtitle: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    itemsContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
        overflow: 'hidden',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    itemRowLast: {
        borderBottomWidth: 0,
    },
    itemIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    itemDescription: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    quickButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    quickButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.primary,
    },
});

export default SupportScreen;

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface AccountScreenProps {
    navigation: any;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
    const { t } = useLanguage();

    const accountItems = [
        {
            key: 'orders',
            title: t('item_orders'),
            icon: 'receipt-outline',
            color: theme.colors.primary,
            subtitle: t('item_orders_desc'),
        },
        {
            key: 'referrals',
            title: t('item_invite'),
            icon: 'share-social-outline',
            color: theme.colors.success,
            subtitle: t('item_invite_desc'),
            badge: '3',
        },
        {
            key: 'billing',
            title: t('account_billing'),
            icon: 'card-outline',
            color: theme.colors.warning,
            subtitle: t('account_billing_desc'),
        },
    ];

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
                <Text style={styles.headerTitle}>{t('item_account')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Icon name="person" size={32} color={theme.colors.surface} />
                        </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{t('user_nickname')}</Text>
                        <Text style={styles.userEmail}>user@example.com</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Icon name="pencil-outline" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Account Items */}
                <View style={styles.itemsContainer}>
                    {accountItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.itemRow,
                                index === accountItems.length - 1 && styles.itemRowLast,
                            ]}
                        >
                            <View style={[styles.itemIcon, { backgroundColor: item.color + '15' }]}>
                                <Icon name={item.icon} size={22} color={item.color} />
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                            </View>
                            {item.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerZone}>
                    <TouchableOpacity style={styles.dangerButton}>
                        <Icon name="log-out-outline" size={20} color={theme.colors.error} />
                        <Text style={styles.dangerButtonText}>{t('item_logout')}</Text>
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
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    avatarContainer: {
        marginRight: theme.spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    userEmail: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    editButton: {
        padding: theme.spacing.sm,
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
    itemSubtitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    badge: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.pill,
        marginRight: theme.spacing.sm,
    },
    badgeText: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.surface,
    },
    dangerZone: {
        marginTop: theme.spacing.xl,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error + '10',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.sm,
    },
    dangerButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.error,
    },
});

export default AccountScreen;

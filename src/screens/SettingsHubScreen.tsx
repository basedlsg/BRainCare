import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface SettingsHubScreenProps {
    navigation: any;
}

const SettingsHubScreen: React.FC<SettingsHubScreenProps> = ({ navigation }) => {
    const { t, language, toggleLanguage } = useLanguage();
    const [devModeCounter, setDevModeCounter] = useState(0);
    const [devModeEnabled, setDevModeEnabled] = useState(false);

    const APP_VERSION = '3.0.0';

    // Status chip data (at-a-glance info)
    const statusChips = [
        { key: 'reminders', label: t('reminders'), value: t('status_on'), icon: 'notifications' },
        { key: 'device', label: t('eeg_device'), value: t('status_connected'), icon: 'bluetooth' },
        { key: 'language', label: t('item_language'), value: language.toUpperCase(), icon: 'language' },
    ];

    // Settings Home: 6 rows max (hard rule)
    const settingsRows = [
        {
            key: 'reminders',
            title: t('settings_reminders'),
            icon: 'alarm-outline',
            color: theme.colors.warning,
            onPress: () => navigation.navigate('ReminderSettings'),
        },
        {
            key: 'sound',
            title: t('settings_sound'),
            icon: 'volume-high-outline',
            color: theme.colors.primary,
            onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
            key: 'notifications',
            title: t('settings_notifications'),
            icon: 'notifications-outline',
            color: theme.colors.info,
            onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
            key: 'device',
            title: t('settings_device'),
            icon: 'hardware-chip-outline',
            color: theme.colors.success,
            onPress: () => navigation.navigate('BluetoothDebug'),
        },
        {
            key: 'privacy',
            title: t('settings_privacy'),
            icon: 'shield-checkmark-outline',
            color: theme.colors.healthPurple,
            onPress: () => Alert.alert(t('settings_privacy'), 'Coming soon'),
        },
        {
            key: 'about',
            title: t('settings_about'),
            icon: 'information-circle-outline',
            color: theme.colors.textSecondary,
            onPress: () => navigation.navigate('About'),
            showVersion: true,
        },
    ];

    // Developer tools (hidden until enabled)
    const developerTools = [
        {
            key: 'ble_test',
            title: t('ble_scan_test'),
            icon: 'bluetooth-outline',
            onPress: () => navigation.navigate('BleTest'),
        },
        {
            key: 'raw_eeg',
            title: t('raw_eeg_toggle'),
            icon: 'pulse-outline',
            onPress: () => Alert.alert(t('raw_eeg_toggle'), 'Coming soon'),
        },
        {
            key: 'bluetooth_debug',
            title: t('bluetooth_debug'),
            icon: 'bug-outline',
            onPress: () => navigation.navigate('BluetoothDebug'),
        },
    ];

    const handleAboutTap = () => {
        const newCount = devModeCounter + 1;
        setDevModeCounter(newCount);

        if (newCount >= 7 && !devModeEnabled) {
            setDevModeEnabled(true);
            Alert.alert(t('developer_mode'), t('developer_mode_enabled'));
        } else if (newCount >= 4 && newCount < 7 && !devModeEnabled) {
            // Show hint after 4 taps
            console.log(`${7 - newCount} more taps to enable developer mode`);
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
                <Text style={styles.headerTitle}>{t('settings')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Chips (at-a-glance) */}
                <View style={styles.statusChipsContainer}>
                    {statusChips.map((chip) => (
                        <View key={chip.key} style={styles.statusChip}>
                            <Icon name={chip.icon} size={14} color={theme.colors.primary} />
                            <Text style={styles.statusChipLabel}>{chip.label}:</Text>
                            <Text style={styles.statusChipValue}>{chip.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Language Toggle */}
                <TouchableOpacity style={styles.languageRow} onPress={toggleLanguage}>
                    <View style={styles.languageLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Icon name="language-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.settingLabel}>{t('item_language')}</Text>
                    </View>
                    <View style={styles.languageToggle}>
                        <Text style={[styles.langOption, language === 'zh' && styles.langOptionActive]}>中</Text>
                        <Text style={styles.langSeparator}>/</Text>
                        <Text style={[styles.langOption, language === 'en' && styles.langOptionActive]}>En</Text>
                    </View>
                </TouchableOpacity>

                {/* Settings Rows (6 max) */}
                <View style={styles.settingsGroup}>
                    {settingsRows.map((item, index) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.settingRow,
                                index === settingsRows.length - 1 && styles.settingRowLast,
                            ]}
                            onPress={item.key === 'about' ? handleAboutTap : item.onPress}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.settingIcon, { backgroundColor: item.color + '15' }]}>
                                    <Icon name={item.icon} size={22} color={item.color} />
                                </View>
                                <Text style={styles.settingLabel}>{item.title}</Text>
                            </View>
                            {item.showVersion ? (
                                <View style={styles.versionBadge}>
                                    <Text style={styles.versionText}>v{APP_VERSION}</Text>
                                </View>
                            ) : (
                                <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Developer Tools (Hidden until enabled) */}
                {devModeEnabled && (
                    <View style={styles.settingsGroup}>
                        <View style={styles.devModeHeader}>
                            <Icon name="code-slash" size={16} color={theme.colors.warning} />
                            <Text style={styles.devModeTitle}>{t('developer_tools')}</Text>
                        </View>
                        {developerTools.map((item, index) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.settingRow,
                                    index === developerTools.length - 1 && styles.settingRowLast,
                                ]}
                                onPress={item.onPress}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                                        <Icon name={item.icon} size={22} color={theme.colors.warning} />
                                    </View>
                                    <Text style={styles.settingLabel}>{item.title}</Text>
                                </View>
                                <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Hidden hint */}
                {!devModeEnabled && (
                    <Text style={styles.devModeHint}>{t('developer_mode_hint')}</Text>
                )}
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

    // Status Chips
    statusChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.pill,
        gap: theme.spacing.xs,
        ...theme.shadows.xs,
    },
    statusChipLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    statusChipValue: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },

    // Language Row
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    languageLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    languageToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.pill,
    },
    langOption: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.textSecondary,
        paddingHorizontal: theme.spacing.sm,
    },
    langOptionActive: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    langSeparator: {
        color: theme.colors.textLight,
    },

    // Settings Group
    settingsGroup: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    settingRowLast: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
    },
    versionBadge: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.pill,
    },
    versionText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },

    // Developer Mode
    devModeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    devModeTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.warning,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    devModeHint: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: theme.spacing.xl,
    },
});

export default SettingsHubScreen;

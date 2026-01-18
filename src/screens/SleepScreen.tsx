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

interface SleepScreenProps {
    navigation: any;
}

const SleepScreen: React.FC<SleepScreenProps> = ({ navigation }) => {
    const { t, language } = useLanguage();

    // Mock sleep data - will be replaced with real data later
    const sleepData = {
        duration: '7h 12m',
        quality: 'good',
        bedtime: '23:15',
        wakeTime: '06:27',
        deepSleep: '1h 45m',
        lightSleep: '4h 32m',
        remSleep: '55m',
    };

    // Mock weekly trend data
    const weeklyData = [
        { day: t('mon'), hours: 6.5 },
        { day: t('tue'), hours: 7.2 },
        { day: t('wed'), hours: 6.8 },
        { day: t('thu'), hours: 7.5 },
        { day: t('fri'), hours: 7.0 },
        { day: t('sat'), hours: 8.2 },
        { day: t('sun'), hours: 7.1 },
    ];

    const getQualityLabel = (quality: string) => {
        switch (quality) {
            case 'good': return t('quality_good');
            case 'fair': return t('quality_fair');
            case 'poor': return t('quality_poor');
            default: return quality;
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'good': return theme.colors.success;
            case 'fair': return theme.colors.warning;
            case 'poor': return theme.colors.error;
            default: return theme.colors.textSecondary;
        }
    };

    const maxHours = Math.max(...weeklyData.map(d => d.hours));

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
                <Text style={styles.headerTitle}>{t('sleep_screen_title')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Last Night Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.sectionLabel}>{t('last_night')}</Text>

                    <View style={styles.mainMetric}>
                        <Text style={styles.durationText}>{sleepData.duration}</Text>
                        <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(sleepData.quality) + '20' }]}>
                            <Text style={[styles.qualityText, { color: getQualityColor(sleepData.quality) }]}>
                                {getQualityLabel(sleepData.quality)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                            <Icon name="moon-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.timeLabel}>{t('bedtime')}</Text>
                            <Text style={styles.timeValue}>{sleepData.bedtime}</Text>
                        </View>
                        <View style={styles.timeDivider} />
                        <View style={styles.timeItem}>
                            <Icon name="sunny-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.timeLabel}>{t('wake_time')}</Text>
                            <Text style={styles.timeValue}>{sleepData.wakeTime}</Text>
                        </View>
                    </View>

                    {/* Sleep Stages */}
                    <View style={styles.stagesContainer}>
                        <View style={styles.stageItem}>
                            <View style={[styles.stageDot, { backgroundColor: '#6366F1' }]} />
                            <Text style={styles.stageLabel}>{t('deep_sleep')}</Text>
                            <Text style={styles.stageValue}>{sleepData.deepSleep}</Text>
                        </View>
                        <View style={styles.stageItem}>
                            <View style={[styles.stageDot, { backgroundColor: '#8B5CF6' }]} />
                            <Text style={styles.stageLabel}>{t('light_sleep')}</Text>
                            <Text style={styles.stageValue}>{sleepData.lightSleep}</Text>
                        </View>
                        <View style={styles.stageItem}>
                            <View style={[styles.stageDot, { backgroundColor: '#EC4899' }]} />
                            <Text style={styles.stageLabel}>{t('sleep_rem')}</Text>
                            <Text style={styles.stageValue}>{sleepData.remSleep}</Text>
                        </View>
                    </View>
                </View>

                {/* Weekly Trend */}
                <View style={styles.trendCard}>
                    <Text style={styles.sectionTitle}>{t('weekly_trend')}</Text>

                    <View style={styles.chartContainer}>
                        {weeklyData.map((item, index) => (
                            <View key={index} style={styles.barContainer}>
                                <View style={styles.barWrapper}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.hours / maxHours) * 100}%`,
                                                backgroundColor: index === weeklyData.length - 1
                                                    ? theme.colors.primary
                                                    : theme.colors.primaryLight,
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Tonight Suggestions */}
                <View style={styles.suggestionsCard}>
                    <Text style={styles.sectionTitle}>{t('tonight_suggestions')}</Text>

                    <View style={styles.suggestionItem}>
                        <View style={styles.suggestionIcon}>
                            <Icon name="time-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionTitle}>{t('suggestion_bedtime')}</Text>
                            <Text style={styles.suggestionValue}>22:30</Text>
                        </View>
                    </View>

                    <View style={styles.suggestionItem}>
                        <View style={styles.suggestionIcon}>
                            <Icon name="phone-portrait-outline" size={20} color={theme.colors.warning} />
                        </View>
                        <Text style={styles.suggestionText}>{t('suggestion_avoid_screens')}</Text>
                    </View>

                    <View style={styles.suggestionItem}>
                        <View style={styles.suggestionIcon}>
                            <Icon name="leaf-outline" size={20} color={theme.colors.success} />
                        </View>
                        <Text style={styles.suggestionText}>{t('suggestion_wind_down')}</Text>
                    </View>
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
    summaryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    sectionLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    mainMetric: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    durationText: {
        fontSize: 48,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginRight: theme.spacing.md,
    },
    qualityBadge: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.pill,
    },
    qualityText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    timeItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    timeDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.lg,
    },
    timeLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    timeValue: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    stagesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stageItem: {
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    stageDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stageLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    stageValue: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    trendCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    sectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 120,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barWrapper: {
        flex: 1,
        width: 24,
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderRadius: theme.borderRadius.sm,
        minHeight: 8,
    },
    barLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    suggestionsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xxxl,
        ...theme.shadows.sm,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    suggestionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    suggestionValue: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    suggestionText: {
        flex: 1,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
    },
});

export default SleepScreen;

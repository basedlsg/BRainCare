import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

const { width } = Dimensions.get('window');

interface Props {
    relaxation: number;
    focus: number;
    fatigue: number;
}

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={styles.progressContainer}>
        <View style={styles.labelRow}>
            <Text style={styles.progressLabel}>{label}</Text>
            <Text style={styles.progressValue}>{value}/100</Text>
        </View>
        <View style={styles.track}>
            <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
        </View>
    </View>
);

const ConsumerModeScreen: React.FC<Props> = ({ relaxation, focus, fatigue }) => {
    const { t } = useLanguage();

    // Calculate main score (Average for now)
    const mainScore = Math.round((relaxation + focus + (100 - fatigue)) / 3);

    const getStatusText = (score: number) => {
        if (score > 80) return t('status_optimal');
        if (score > 50) return t('status_balanced');
        return t('status_needs_rest');
    };

    return (
        <View style={styles.container}>
            {/* Main Circular Score Mockup */}
            <View style={styles.circleContainer}>
                <View style={styles.circle}>
                    <Text style={styles.scoreText}>{mainScore}</Text>
                    <Text style={styles.scoreLabel}>{t('wellness_score')}</Text>
                </View>
                <Text style={styles.statusText}>{getStatusText(mainScore)}</Text>
            </View>

            {/* Metrics */}
            <View style={styles.metricsContainer}>
                <ProgressBar
                    label={t('metric_relax')}
                    value={relaxation}
                    color="#4CD964"
                />
                <ProgressBar
                    label={t('metric_focus')}
                    value={focus}
                    color="#5AC8FA"
                />
                <ProgressBar
                    label={t('metric_fatigue')}
                    value={fatigue}
                    color="#FF9500"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    circleContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 10,
        borderColor: '#EBF4FF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    scoreText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#333',
    },
    scoreLabel: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
    },
    statusText: {
        marginTop: 20,
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
    },
    metricsContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    progressContainer: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
    },
    progressValue: {
        fontSize: 14,
        color: '#888',
    },
    track: {
        height: 12,
        backgroundColor: '#F0F0F0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 6,
    },
});

export default ConsumerModeScreen;

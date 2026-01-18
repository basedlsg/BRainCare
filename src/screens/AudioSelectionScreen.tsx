import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
// import TrackPlayer from 'react-native-track-player';

const AudioSelectionScreen = () => {
    const { t } = useLanguage();
    const [activeTrack, setActiveTrack] = useState<string | null>(null);

    const AUDIO_TRACKS = [
        { id: '1', titleKey: 'audio_white_noise', url: 'https://example.com/white-noise.mp3' },
        { id: '2', titleKey: 'audio_rain', url: 'https://example.com/rain.mp3' },
        { id: '3', titleKey: 'audio_binaural', url: 'https://example.com/binaural.mp3' },
    ];

    const playTrack = async (track: any) => {
        console.log('Playing:', track.titleKey);
        setActiveTrack(track.id);
        // await TrackPlayer.reset();
        // await TrackPlayer.add({ url: track.url, title: t(track.titleKey), artist: 'BrainCare' });
        // await TrackPlayer.play();
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.trackItem, activeTrack === item.id && styles.activeItem]}
            onPress={() => playTrack(item)}
        >
            <View style={styles.iconPlaceholder} />
            <View>
                <Text style={styles.trackTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.trackStatus}>{activeTrack === item.id ? t('audio_playing') : ''}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{t('audio_adaptive')}</Text>
            <FlatList
                data={AUDIO_TRACKS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    list: {
        gap: 12,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeItem: {
        borderColor: '#4A90E2',
        backgroundColor: '#EBF4FF',
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginRight: 16,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    trackStatus: {
        fontSize: 12,
        color: '#4A90E2',
        marginTop: 4,
    },
});

export default AudioSelectionScreen;

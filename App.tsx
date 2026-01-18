/**
 * BrainCare App
 * 脑电理疗健康应用
 */

import React from 'react';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/styles/theme';

function App() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <LanguageProvider>
        <SettingsProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SettingsProvider>
      </LanguageProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;

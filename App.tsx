/**
 * BrainCare App
 * 脑电理疗健康应用
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/styles/theme';

function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;

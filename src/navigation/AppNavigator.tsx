import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';

// Settings screens
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import ReminderSettingsScreen from '../screens/ReminderSettingsScreen';
import SettingsHubScreen from '../screens/SettingsHubScreen';

// Profile screens
import AccountScreen from '../screens/AccountScreen';
import SupportScreen from '../screens/SupportScreen';

// Today tab screens
import SleepScreen from '../screens/SleepScreen';

// Debug screens (hidden in production)
import CalendarTestScreen from '../screens/CalendarTestScreen';
import BluetoothDebugScreen from '../screens/BluetoothDebugScreen';
import BleTestScreen from '../screens/BleTestScreen';

import { useLanguage } from '../i18n/LanguageContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { t } = useLanguage();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />

      {/* Today Tab Screens */}
      <Stack.Screen name="Sleep" component={SleepScreen} />

      {/* Settings Screens */}
      <Stack.Screen name="SettingsHub" component={SettingsHubScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />

      {/* Profile Screens */}
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />

      {/* Debug/Dev Screens */}
      <Stack.Screen name="CalendarTest" component={CalendarTestScreen} />
      <Stack.Screen
        name="BluetoothDebug"
        component={BluetoothDebugScreen}
        options={{
          headerShown: true,
          title: t('title_bluetooth_debug'),
        }}
      />
      <Stack.Screen
        name="BleTest"
        component={BleTestScreen}
        options={{
          headerShown: true,
          title: t('title_ble_test'),
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
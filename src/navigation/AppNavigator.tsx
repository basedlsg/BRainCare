import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import CalendarTestScreen from '../screens/CalendarTestScreen';
import ReminderSettingsScreen from '../screens/ReminderSettingsScreen';
import BluetoothDebugScreen from '../screens/BluetoothDebugScreen';
import BleTestScreen from '../screens/BleTestScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="CalendarTest" component={CalendarTestScreen} />
      <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />
      <Stack.Screen
        name="BluetoothDebug"
        component={BluetoothDebugScreen}
        options={{
          headerShown: true,
          title: '蓝牙调试',
        }}
      />
      <Stack.Screen
        name="BleTest"
        component={BleTestScreen}
        options={{
          headerShown: true,
          title: 'BLE 扫描测试',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
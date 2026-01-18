import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

// Screen imports (will be renamed/refactored)
import HomeScreen from '../screens/HomeScreen'; // Will become TodayScreen
import WellnessScreen from '../screens/WellnessScreen'; // Will become TherapiesScreen
import RecordsScreen from '../screens/RecordsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          // New 4-tab navigation icons
          if (route.name === 'Today') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Therapies') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Records') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActiveTint,
        tabBarInactiveTintColor: theme.colors.tabBarInactiveTint,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.sm,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Today"
        component={HomeScreen}
        options={{ tabBarLabel: t('tab_today') }}
      />
      <Tab.Screen
        name="Therapies"
        component={WellnessScreen}
        options={{ tabBarLabel: t('tab_therapies') }}
      />
      <Tab.Screen
        name="Records"
        component={RecordsScreen}
        options={{ tabBarLabel: t('tab_records') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('tab_profile') }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrainCare is a React Native health application focused on EEG therapy and monitoring. The main application is located in the `BrainCare/` directory, with a secondary Expo project in `BrainCareExpo/`.

## Development Commands

### Primary React Native App (BrainCare/)
```bash
# Development
npm start                    # Start Metro bundler
npm run android             # Run on Android device/emulator
npm run ios                 # Run on iOS device/simulator

# Code Quality
npm run lint                # Run ESLint
npm test                    # Run Jest tests

# iOS Setup (first time or after native dependency changes)
cd ios && pod install && cd ..

# First time setup only
bundle install                # Install Ruby bundler for CocoaPods
```

### Working Directory
Always work from `/Users/sichaohe/Documents/GitHub/bibt-frontend/BrainCare/` for the main React Native application.

## Architecture Overview

### Core Structure
- **Entry Point**: `App.tsx` - Sets up NavigationContainer with StatusBar and AppNavigator
- **Navigation**: `src/navigation/AppNavigator.tsx` - Stack navigator wrapping TabNavigator
- **Theme System**: `src/styles/theme.ts` - Centralized design tokens (colors, spacing, typography, shadows)

### Navigation Architecture
- **Root Navigator**: `src/navigation/AppNavigator.tsx` - Stack navigator handling modal/screen navigation
- **Main Navigation**: `src/navigation/TabNavigator.tsx` - Bottom tab navigation using React Navigation
- **Additional Screens**: NotificationSettings, CalendarTest, ReminderSettings accessible via stack navigation

### Screen Architecture
The app follows a tab-based navigation pattern with 5 main screens using Chinese tab names:
- `HomeScreen.tsx` (首页) - Dynamic greetings, todo management, favorites
- `AssessmentScreen.tsx` (评估) - Real-time EEG/ECG monitoring, health assessments (GAD-7, PHQ-9)
- `WellnessScreen.tsx` (理疗) - Therapy plans, courses, audio content, AI assistant
- `RecordsScreen.tsx` (记录) - Health metrics visualization with time-based filtering
- `ProfileScreen.tsx` (我的) - User settings, account management, app preferences

### Component Organization
- **Reusable Components**: `src/components/` (e.g., CustomerService.tsx for global customer support, CustomCalendar, CustomDatePicker)
- **Screen-Specific Logic**: Each screen handles its own state management using React hooks
- **Styling**: Consistent theme-based styling using the centralized theme system

### Key Dependencies
- React Native 0.80.2 with React 19.1.0
- React Navigation 7.x for navigation (both stack and bottom tabs)
- React Native Vector Icons for iconography
- TypeScript for type safety
- Jest for testing
- @react-native-community/datetimepicker for date/time selection
- react-native-calendars for calendar functionality
- react-native-linear-gradient for gradient support

### Design Patterns
- Theme-based styling with consistent design tokens
- Hook-based state management (no external state library)
- Component composition over inheritance
- Centralized navigation configuration

## Development Notes

### Environment Requirements
- Node.js 18+ (required by engines field in package.json)
- Ruby 2.6.10+ (for iOS CocoaPods)
- React Native CLI
- iOS: Xcode 14+
- Android: Android Studio, JDK 17+

### iOS Development
- Uses Ruby bundle for gem management with specific version constraints to avoid build issues
- CocoaPods version locked to avoid compatibility problems
- Run `bundle install` before `pod install` for first-time setup
- Uses Swift for native iOS code in `ios/BrainCare/`
- Standard Podfile configuration with React Native integration

### Android Development
- Standard React Native Android setup
- Uses Gradle build system
- **Environment Variables Required**:
  - `ANDROID_HOME=/Users/username/Library/Android/sdk`
  - `ANDROID_SDK_ROOT=/Users/username/Library/Android/sdk`
  - Add to PATH: `$ANDROID_HOME/platform-tools`, `$ANDROID_HOME/emulator`, `$ANDROID_HOME/tools`
- **Common issues**:
  - ADB not found means Android SDK PATH not configured properly
  - Vector icons showing as "X": Need to copy font files to `android/app/src/main/assets/fonts/`
    ```bash
    # Copy Ionicons font (required for TabNavigator)
    cp node_modules/react-native-vector-icons/Fonts/Ionicons.ttf android/app/src/main/assets/fonts/
    # Then rebuild: cd android && gradlew assembleDebug
    ```

### Font Configuration
The app uses custom fonts configured in `react-native.config.js`. Font assets should be placed in `assets/fonts/` directory.

### Testing
- Jest configuration in `jest.config.js` with React Native preset
- Test files in `__tests__/` directory
- ESLint configuration extends @react-native/eslint-config

### TypeScript
- Extends `@react-native/typescript-config`
- Strict type checking enabled for better code quality

The application focuses on health data visualization, user engagement through gamification (todo lists, favorites), and comprehensive wellness features including AI-powered recommendations.
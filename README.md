# BrainCare

## 1. Project Overview
BrainCare is a comprehensive brain health monitoring and wellness application built with React Native. It integrates real-time EEG data visualization via Bluetooth Low Energy (BLE), personalized wellness plans, and comprehensive health record tracking. The app is designed for both English and Chinese speaking users, featuring a seamless global localization system that permeates every screen and component.

## 2. Technical Architecture

### Frameworks & Libraries
- **Core**: React Native (0.76.6), TypeScript.
- **Navigation**: React Navigation 6 (Stack & Bottom Tabs) for fluid screen management.
- **BLE Integration**: `react-native-ble-plx` for robust Bluetooth device connections, scanning, and data streaming.
- **UI Components**: A custom-built component system, supplemented by `react-native-vector-icons` and `react-native-community/datetimepicker`.
- **Environment**: Configured for iOS (CocoaPods) and Android (Gradle) native builds.

### Application Flow
1.  **Entry Point**: `App.tsx` serves as the root, wrapping the application in the `LanguageProvider` to ensure translation availability appropriately before the `NavigationContainer` initializes.
2.  **Navigation Layer**: 
    - `AppNavigator`: Manages the application stack, including full-screen modals like `NotificationSettings` and debug tools.
    - `TabNavigator`: Controls the primary main interface (Home, Assessment, Wellness, Records, Profile).
3.  **State Management**: 
    - **Local**: React hooks (`useState`, `useEffect`) manage transient screen state.
    - **Global**: Context API (`LanguageContext`) manages app-wide preferences like the active locale.

## 3. Intricacies & Key Features

### Global Localization (i18n)
The application eschews heavy external i18n libraries in favor of a lightweight, type-safe manual implementation:
- **Architecture**: A `LanguageContext` wraps the app, providing a `useLanguage` hook.
- **Usage**: Components consume `const { t, language } = useLanguage();`.
- **Dictionary**: `src/i18n/translations.ts` acts as the single source of truth, enforcing type consistency between English (`en`) and Chinese (`zh`) keys.
- **Scope**: Covers everything from static labels to dynamic content in complex settings screens.

### Bluetooth Low Energy (BLE) Pipeline
BrainCare features a sophisticated BLE implementation designed for medical-grade data handling:
- **Singleton Management**: `BleManager` is instantiated efficiently to handle lifecycle events.
- **Dedicated Debugging**: 
    - `BluetoothDebugScreen`: A developer-centric tool allowing raw RSSI monitoring, service discovery, and UUID inspection. It supports manual subscription to Nordic UART Service (NUS) characteristics for raw data stream debugging.
    - `BleTestScreen`: A simplified scanner to verify hardware availability and permission states (Android 12+ permissions handled explicitly).
- **Real-time Visualization**: The `AssessmentScreen` directly consumes high-frequency BLE packets to render smooth EEG waveforms alongside connection quality indicators.

### Custom Design System
The UI is built on a centralized theme engine (`src/styles/theme.ts`) that standardizes:
- **Color Palette**: A modern, calming palette with primary Teals and warm Secondary accents.
- **Typography & Spacing**: A consistent 8px-based grid system (`spacing.unit`) ensuring pixel-perfect alignment.
- **Shadows & Elevation**: detailed shadow definitions for Android elevation and iOS layer shadows.

### Advanced Business Logic
- **Ebbinghaus Memory Algorithm**: The `ReminderSettingsScreen` implements the Ebbinghaus Forgetting Curve logic to automatically calculate optimal review intervals (1, 2, 4, 7, 15 days) for memory training tasks.
- **Data Visualization**: `RecordsScreen` and `AssessmentScreen` feature custom-drawn charts to visualize anxiety levels, sleep patterns, and raw brainwave data.

## 4. Project Structure
```
src/
├── components/   # Reusable UI atoms (Cards, Charts, Buttons, Badges)
├── hooks/        # Custom React hooks (useLanguage, specialized logic)
├── i18n/         # Internationalization core (Context & Translations)
├── navigation/   # Navigator definitions (Stack & Tab configurations)
├── screens/      # Feature-specific screens (Assessment, Home, Debug tools)
├── services/     # Business logic, API connectors, and BLE services
├── styles/       # Centralized theme, colors, and global styles
└── types/        # TypeScript interfaces and type definitions
```

## 5. Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Step 1: Start Metro

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

```sh
bundle install
bundle exec pod install
```

Then:

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

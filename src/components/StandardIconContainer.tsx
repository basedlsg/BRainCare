import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../styles/theme';

interface StandardIconContainerProps {
  iconName: string;
  iconColor?: string;
  iconSize?: number;
  backgroundColor?: string;
  size?: number;
}

const StandardIconContainer: React.FC<StandardIconContainerProps> = ({
  iconName,
  iconColor = theme.colors.primary,
  iconSize = 20,
  backgroundColor = theme.components.iconContainer.backgroundColor,
  size = theme.components.iconContainer.size,
}) => {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  };

  return (
    <View style={[
      styles.container,
      containerStyle,
      theme.components.iconContainer.shadowStyle,
    ]}>
      <Icon 
        name={iconName} 
        size={iconSize} 
        color={iconColor} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StandardIconContainer;
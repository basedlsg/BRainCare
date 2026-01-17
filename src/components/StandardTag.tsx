import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export type TagType = 
  | 'lifestyle' 
  | 'schedule' 
  | 'sleep' 
  | 'vip' 
  | 'paid' 
  | 'psychology' 
  | 'cognitive' 
  | 'emotion' 
  | 'brainwave' 
  | 'sleep_audio';

interface StandardTagProps {
  type: TagType;
  text: string;
}

const StandardTag: React.FC<StandardTagProps> = ({ type, text }) => {
  const tagStyle = theme.components.tag[type];
  
  return (
    <View style={[
      styles.tagContainer,
      { backgroundColor: tagStyle.background }
    ]}>
      <Text style={[
        styles.tagText,
        { color: tagStyle.text }
      ]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    letterSpacing: 0.3,
  },
});

export default StandardTag;
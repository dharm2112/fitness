import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, rounded } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', style }: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity 
      style={[styles.btn, isPrimary && styles.primary, isOutline && styles.outline, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isPrimary && styles.primaryText, isOutline && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { height: 56, borderRadius: rounded.full, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, width: '100%' },
  primary: { backgroundColor: colors.primaryContainer, shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outlineVariant },
  text: { ...typography.labelLg },
  primaryText: { color: colors.onPrimary },
  outlineText: { color: colors.textMain }
});

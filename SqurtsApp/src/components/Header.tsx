import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const Header = ({ title = 'Squrts', showBack = false, onBack }: { title?: string, showBack?: boolean, onBack?: () => void }) => (
  <View style={styles.header}>
    {showBack ? (
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>⚡</Text>
      </View>
    )}
    <Text style={styles.title}>{title}</Text>
    <View style={{ width: 40 }} />
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surfaceContainerLowest },
  logoBadge: { width: 40, height: 40, borderRadius: rounded.md, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center' },
  logoIcon: { color: '#fff', fontSize: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: colors.textMain },
  title: { ...typography.headlineSm, color: colors.primary, flex: 1, textAlign: 'center' },
});

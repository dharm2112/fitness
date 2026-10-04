import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, rounded } from '../theme/theme';

export type TabName = 'Home' | 'Alarms' | 'Progress' | 'Profile';

interface Props {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export const BottomNavigation = ({ currentTab, onTabPress }: Props) => {
  const tabs: TabName[] = ['Home', 'Alarms', 'Progress', 'Profile'];
  
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = currentTab === tab;
        return (
          <TouchableOpacity key={tab} style={styles.tab} onPress={() => onTabPress(tab)}>
            <View style={[styles.iconPlaceholder, isActive && styles.iconActive]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingBottom: 24, paddingTop: 12 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconPlaceholder: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.textMuted, marginBottom: 4 },
  iconActive: { backgroundColor: colors.primaryContainer },
  label: { ...typography.labelSm, color: colors.textMuted },
  labelActive: { color: colors.textMain, fontWeight: '700' }
});

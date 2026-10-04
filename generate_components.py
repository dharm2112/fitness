import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

components_dir = "SqurtsApp/src/components"
screens_dir = "SqurtsApp/src/screens"

# 1. Button.tsx
write_file(f"{components_dir}/Button.tsx", """import React from 'react';
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
""")

# 2. Header.tsx
write_file(f"{components_dir}/Header.tsx", """import React from 'react';
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
""")

# 3. BottomNavigation.tsx
write_file(f"{components_dir}/BottomNavigation.tsx", """import React from 'react';
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
""")

print("Components generated.")

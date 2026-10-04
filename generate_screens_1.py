import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

screens_dir = "SqurtsApp/src/screens"

# 1. LandingScreen.tsx
write_file(f"{screens_dir}/LandingScreen.tsx", """import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const LandingScreen = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>INTELLIGENT MOVEMENT ALARM</Text>
        </View>
        <Text style={styles.title}>Your alarm won't stop until you move.</Text>
        <Text style={styles.subtitle}>Turn waking up into a simple movement challenge. Complete your squats and start your day with energy and purpose.</Text>
        
        <View style={styles.flowPill}>
          <Text style={styles.flowText}>ALARM → MOVE → COMPLETE</Text>
        </View>

        <Button title="Get Started" onPress={onGetStarted} style={{ marginBottom: 16 }} />
        <Button title="See How It Works" variant="outline" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: 'center', paddingTop: 60 },
  hero: { alignItems: 'center', width: '100%' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: rounded.full, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 24 },
  badgeText: { ...typography.labelSm, color: colors.primary, fontWeight: 'bold' },
  title: { ...typography.headlineLg, color: colors.textMain, textAlign: 'center', marginBottom: 16 },
  subtitle: { ...typography.bodyLg, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  flowPill: { padding: 12, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.full, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 32 },
  flowText: { ...typography.labelMd, color: colors.primaryContainer }
});
""")

# 2. HomeScreen.tsx
write_file(f"{screens_dir}/HomeScreen.tsx", """import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const HomeScreen = ({ onCreateAlarm }: { onCreateAlarm: () => void }) => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Alarm</Text>
          <Text style={styles.time}>7:00 AM</Text>
          <Text style={styles.target}>Target: 10 Squats</Text>
        </View>
        <Button title="Set New Alarm" onPress={onCreateAlarm} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  card: { backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: spacing.xl, alignItems: 'center' },
  cardTitle: { ...typography.labelMd, color: colors.textMuted, marginBottom: 8 },
  time: { ...typography.headlineLg, color: colors.textMain, fontSize: 48, marginBottom: 8 },
  target: { ...typography.bodyMd, color: colors.primaryContainer, fontWeight: 'bold' }
});
""")

print("Screens generated part 1.")

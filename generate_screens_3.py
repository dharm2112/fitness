import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

screens_dir = "SqurtsApp/src/screens"

# 6. ChallengeCompleteScreen.tsx
write_file(f"{screens_dir}/ChallengeCompleteScreen.tsx", """import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ChallengeCompleteScreen = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🎉</Text>
          </View>
          <Text style={styles.subtitle}>10 / 10 CHALLENGE COMPLETE</Text>
          <Text style={styles.title}>Alarm stopped. You're up.</Text>
          <Text style={styles.desc}>Your body has engaged major muscle groups, flooding your system with morning clarity. Let's make today count.</Text>
        </View>

        <Text style={styles.sectionTitle}>One alarm. More ways to move.</Text>
        <View style={styles.grid}>
          <View style={[styles.gridItem, styles.activeItem]}>
            <Text style={styles.itemTitle}>Squats</Text>
            <View style={styles.liveTag}><Text style={styles.liveText}>LIVE</Text></View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.itemTitle}>Push-ups</Text>
            <Text style={styles.soonText}>SOON</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Start My Day" onPress={onFinish} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 60 },
  banner: { backgroundColor: colors.surfaceContainer, padding: spacing.lg, borderRadius: rounded.xl, alignItems: 'center', marginBottom: spacing.xl },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.secondaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  iconText: { fontSize: 32 },
  subtitle: { ...typography.labelSm, color: colors.secondary, marginBottom: 8 },
  title: { ...typography.headlineMd, color: colors.textMain, textAlign: 'center', marginBottom: 16 },
  desc: { ...typography.bodyMd, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: { ...typography.headlineSm, color: colors.textMain, marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1, padding: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, opacity: 0.8 },
  activeItem: { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.primaryContainer, borderWidth: 2, opacity: 1 },
  itemTitle: { ...typography.labelMd, color: colors.textMain, marginBottom: 8 },
  liveTag: { alignSelf: 'flex-start', backgroundColor: colors.primaryContainer + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: rounded.full },
  liveText: { fontSize: 10, color: colors.primaryContainer, fontWeight: 'bold' },
  soonText: { fontSize: 10, color: colors.textMuted, fontWeight: 'bold' },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl }
});
""")

# 7. ProgressScreen.tsx
write_file(f"{screens_dir}/ProgressScreen.tsx", """import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Progress" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>140</Text>
            <Text style={styles.statLabel}>Total Squats</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weekCard}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={styles.dayCol}>
              <View style={[styles.barBg]}>
                <View style={[styles.barFill, { height: i < 5 ? '80%' : '0%' }]} />
              </View>
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  statRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  statValue: { ...typography.headlineLg, color: colors.primaryContainer, marginBottom: 4 },
  statLabel: { ...typography.labelMd, color: colors.textMuted },
  sectionTitle: { ...typography.headlineSm, color: colors.textMain, marginBottom: 16 },
  weekCard: { backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, flexDirection: 'row', justifyContent: 'space-between', height: 200, alignItems: 'flex-end' },
  dayCol: { alignItems: 'center', width: 30 },
  barBg: { width: 12, height: 120, backgroundColor: colors.surfaceContainerHigh, borderRadius: 6, marginBottom: 8, justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: colors.primaryContainer, borderRadius: 6 },
  dayLabel: { ...typography.labelSm, color: colors.textMuted }
});
""")

# 8. ProfileScreen.tsx
write_file(f"{screens_dir}/ProfileScreen.tsx", """import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
          <Text style={styles.name}>Dharm Gabani</Text>
          <Text style={styles.email}>dharm@example.com</Text>
        </View>
        <Button title="Settings" variant="outline" onPress={() => {}} style={{ marginBottom: 16 }} />
        <Button title="Log Out" variant="outline" onPress={() => {}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  avatarContainer: { alignItems: 'center', marginVertical: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceContainer, marginBottom: 16 },
  name: { ...typography.headlineSm, color: colors.textMain },
  email: { ...typography.bodyMd, color: colors.textMuted }
});
""")

print("Screens generated part 3.")

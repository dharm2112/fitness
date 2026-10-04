import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ProgressScreen = () => {
  const { completedChallenges } = useAppContext();

  const totalSquats = completedChallenges.reduce((sum, c) => sum + c.reps, 0);

  // Compute streak: count consecutive days from today backwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const daySet = new Set(completedChallenges.map(c => c.date.split('T')[0]));
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (daySet.has(key)) streak++;
    else if (i > 0) break;
  }

  // Weekly activity: last 7 days
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const label = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    const completed = daySet.has(key);
    return { label, completed };
  });

  return (
    <View style={styles.container}>
      <Header title="Progress" />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSquats}</Text>
            <Text style={styles.statLabel}>Total Squats</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
        </View>

        {/* Weekly bar chart */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weekCard}>
          {week.map((day, i) => (
            <View key={i} style={styles.dayCol}>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { height: day.completed ? '100%' : '0%' }]} />
              </View>
              <Text style={[styles.dayLabel, day.completed && styles.dayLabelActive]}>{day.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent challenges */}
        {completedChallenges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent</Text>
            {[...completedChallenges].reverse().slice(0, 5).map(c => (
              <View key={c.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{c.date.split('T')[0]}</Text>
                <Text style={styles.historyReps}>{c.reps} squats ✓</Text>
                <Text style={styles.historyTime}>{c.alarmTime}</Text>
              </View>
            ))}
          </>
        )}

        {completedChallenges.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyBody}>Complete your first alarm challenge to see your progress here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.md, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  statValue: { ...typography.headlineMd, color: colors.primaryContainer },
  statLabel: { ...typography.labelSm, color: colors.textMuted, textAlign: 'center' },

  sectionTitle: { ...typography.headlineSm, color: colors.textMain },

  weekCard: { backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  dayCol: { alignItems: 'center', flex: 1 },
  barBg: { width: 12, height: 100, backgroundColor: colors.surfaceContainerHigh, borderRadius: 6, marginBottom: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: colors.primaryContainer, borderRadius: 6 },
  dayLabel: { ...typography.labelSm, color: colors.textMuted },
  dayLabelActive: { color: colors.primaryContainer, fontWeight: '700' },

  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, padding: spacing.md, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant },
  historyDate: { ...typography.bodySm, color: colors.textMuted },
  historyReps: { ...typography.labelMd, color: colors.secondary },
  historyTime: { ...typography.bodySm, color: colors.textMuted },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.headlineSm, color: colors.textMain, marginBottom: 8 },
  emptyBody: { ...typography.bodyMd, color: colors.textMuted, textAlign: 'center' },
});

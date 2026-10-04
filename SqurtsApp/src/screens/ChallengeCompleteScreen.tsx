import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { CompletedChallenge } from '../types/types';

interface Props {
  completedChallenge?: CompletedChallenge | null;
  onFinish: () => void;
}

export const ChallengeCompleteScreen = ({ completedChallenge, onFinish }: Props) => {
  const reps = completedChallenge?.reps ?? 10;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Celebration banner */}
        <View style={styles.banner}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🎉</Text>
          </View>
          <Text style={styles.completedTag}>{reps} / {reps} CHALLENGE COMPLETE</Text>
          <Text style={styles.title}>Alarm stopped. You're up.</Text>
          <Text style={styles.desc}>
            Your body has engaged major muscle groups, flooding your system with morning clarity.
            Let's make today count.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reps}</Text>
            <Text style={styles.statLabel}>Squats done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedChallenge?.alarmTime ?? '--'}</Text>
            <Text style={styles.statLabel}>Wake-up time</Text>
          </View>
        </View>

        {/* Exercise grid */}
        <Text style={styles.sectionTitle}>One alarm. More ways to move.</Text>
        <View style={styles.grid}>
          <View style={[styles.gridItem, styles.gridItemActive]}>
            <Text style={styles.gridItemTitle}>Squats</Text>
            <View style={styles.liveTag}><Text style={styles.liveText}>LIVE ✓</Text></View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridItemTitle}>Push-ups</Text>
            <Text style={styles.soonText}>SOON</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridItemTitle}>Planks</Text>
            <Text style={styles.soonText}>SOON</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridItemTitle}>Jumping Jacks</Text>
            <Text style={styles.soonText}>SOON</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start My Day  →" onPress={onFinish} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 48, paddingBottom: 100, gap: spacing.md },

  banner: { backgroundColor: colors.surfaceContainer, padding: spacing.lg, borderRadius: rounded.xl, alignItems: 'center', gap: 10 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 36 },
  completedTag: { ...typography.labelSm, color: colors.secondary, fontWeight: '700', letterSpacing: 1 },
  title: { ...typography.headlineMd, color: colors.textMain, textAlign: 'center' },
  desc: { ...typography.bodyMd, color: colors.textMuted, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.md, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  statValue: { ...typography.headlineMd, color: colors.primaryContainer },
  statLabel: { ...typography.labelSm, color: colors.textMuted },

  sectionTitle: { ...typography.headlineSm, color: colors.textMain },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47%', padding: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, opacity: 0.7 },
  gridItemActive: { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.primaryContainer, borderWidth: 2, opacity: 1 },
  gridItemTitle: { ...typography.labelMd, color: colors.textMain, marginBottom: 6 },
  liveTag: { alignSelf: 'flex-start', backgroundColor: colors.primaryContainer + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: rounded.full },
  liveText: { fontSize: 10, color: colors.primaryContainer, fontWeight: '700' },
  soonText: { fontSize: 10, color: colors.textMuted, fontWeight: '700' },

  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});

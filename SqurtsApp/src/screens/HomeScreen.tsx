import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { Alarm } from '../types/types';

interface Props {
  onCreateAlarm: () => void;
  onAlarmTrigger: (alarm: Alarm) => void;
}

export const HomeScreen = ({ onCreateAlarm, onAlarmTrigger }: Props) => {
  const { alarms } = useAppContext();

  const nextAlarm = alarms.find(a => a.enabled) ?? null;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Next Alarm Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>NEXT ALARM</Text>
          {nextAlarm ? (
            <>
              <Text style={styles.time}>{nextAlarm.time} {nextAlarm.ampm}</Text>
              <Text style={styles.target}>Target: {nextAlarm.targetReps} Squats</Text>
              <Text style={styles.repeatDays}>{nextAlarm.repeatDays.join(', ') || 'Once'}</Text>
              <TouchableOpacity style={styles.triggerBtn} onPress={() => onAlarmTrigger(nextAlarm)}>
                <Text style={styles.triggerBtnText}>▶  Simulate Alarm</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.noAlarmText}>No alarm set</Text>
              <Text style={styles.noAlarmSub}>Tap below to create your morning challenge.</Text>
            </>
          )}
        </View>

        <Button title="Set New Alarm  +" onPress={onCreateAlarm} />

        {/* Stats row */}
        {alarms.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{alarms.length}</Text>
              <Text style={styles.statLabel}>Alarms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{alarms.filter(a => a.enabled).length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        )}

        {/* Brand tagline */}
        <View style={styles.taglineCard}>
          <Text style={styles.tagline}>⚡ Your alarm won't stop until you move.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },

  card: { backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  cardLabel: { ...typography.labelSm, color: colors.textMuted, marginBottom: 8, letterSpacing: 1 },
  time: { fontSize: 52, fontWeight: '800', color: colors.textMain, marginBottom: 6 },
  target: { ...typography.labelLg, color: colors.primaryContainer, marginBottom: 4 },
  repeatDays: { ...typography.bodySm, color: colors.textMuted, marginBottom: 16 },
  triggerBtn: { backgroundColor: colors.primaryContainer, paddingHorizontal: 24, paddingVertical: 10, borderRadius: rounded.full },
  triggerBtnText: { ...typography.labelMd, color: colors.onPrimary },

  noAlarmText: { ...typography.headlineSm, color: colors.textMain, marginBottom: 6 },
  noAlarmSub: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.md, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  statValue: { ...typography.headlineMd, color: colors.primaryContainer },
  statLabel: { ...typography.labelSm, color: colors.textMuted },

  taglineCard: { backgroundColor: colors.surfaceContainer, padding: spacing.md, borderRadius: rounded.lg, alignItems: 'center' },
  tagline: { ...typography.bodyMd, color: colors.primary, fontWeight: '600', textAlign: 'center' },
});

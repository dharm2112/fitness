import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { Alarm, AlarmMode, DayKey } from '../types/types';
import { scheduleAlarm, cancelAlarm } from '../services/alarmService';

const ALL_DAYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS: Record<DayKey, string> = {
  Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S',
};

interface Props {
  existingAlarm?: Alarm | null;
  onSave: () => void;
  onBack: () => void;
}

export const CreateAlarmScreen = ({ existingAlarm, onSave, onBack }: Props) => {
  const { addAlarm, updateAlarm } = useAppContext();
  const isEdit = !!existingAlarm;

  const [hour, setHour] = useState<number>(
    existingAlarm ? parseInt(existingAlarm.time.split(':')[0], 10) : 7,
  );
  const [minute, setMinute] = useState<number>(
    existingAlarm ? parseInt(existingAlarm.time.split(':')[1], 10) : 0,
  );
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(existingAlarm?.ampm ?? 'AM');
  const [repeatDays, setRepeatDays] = useState<DayKey[]>(
    existingAlarm?.repeatDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  );
  const [targetReps, setTargetReps] = useState<number>(existingAlarm?.targetReps ?? 10);
  const [label, setLabel] = useState<string>(existingAlarm?.label ?? '');
  const [soundEnabled, setSoundEnabled] = useState(existingAlarm?.soundEnabled ?? true);
  const [vibrationEnabled, setVibrationEnabled] = useState(existingAlarm?.vibrationEnabled ?? true);
  const [alarmMode, setAlarmMode] = useState<AlarmMode>(existingAlarm?.alarmMode ?? 'challenge');
  const [wakeScreen, setWakeScreen] = useState<boolean>(existingAlarm?.wakeScreen ?? true);

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const toggleDay = (day: DayKey) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    const alarm: Alarm = {
      id: existingAlarm?.id ?? Date.now().toString(),
      time: timeStr,
      ampm,
      repeatDays,
      exercise: 'squat',
      targetReps,
      label,
      enabled: true,
      soundEnabled,
      vibrationEnabled,
      alarmMode,
      wakeScreen: alarmMode === 'challenge' ? wakeScreen : false,
    };
    if (isEdit) {
      await cancelAlarm(alarm.id);
      updateAlarm(alarm);
    } else {
      addAlarm(alarm);
    }
    await scheduleAlarm(alarm);
    onSave();
  };

  const Row = ({ label: l, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{l}</Text>
      {children}
    </View>
  );

  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
    />
  );

  return (
    <View style={styles.container}>
      <Header title={isEdit ? 'Edit Alarm' : 'Create Alarm'} showBack onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Time Picker ── */}
        <View style={styles.timePicker}>
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => setHour(h => (h % 12) + 1)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeDigit}>{String(hour).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => setHour(h => h === 1 ? 12 : h - 1)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▼</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSep}>:</Text>

          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => setMinute(m => (m + 5) % 60)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeDigit}>{String(minute).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => setMinute(m => (m - 5 + 60) % 60)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ampmCol}>
            <TouchableOpacity
              style={[styles.ampmBtn, ampm === 'AM' && styles.ampmActive]}
              onPress={() => setAmpm('AM')}
            >
              <Text style={[styles.ampmText, ampm === 'AM' && styles.ampmActiveText]}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ampmBtn, ampm === 'PM' && styles.ampmActive]}
              onPress={() => setAmpm('PM')}
            >
              <Text style={[styles.ampmText, ampm === 'PM' && styles.ampmActiveText]}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Alarm Mode Selector ── */}
        <Text style={styles.sectionTitle}>Alarm Type</Text>
        <View style={styles.modeContainer}>

          {/* Normal Mode Card */}
          <TouchableOpacity
            style={[styles.modeCard, alarmMode === 'normal' && styles.modeCardActive]}
            onPress={() => setAlarmMode('normal')}
            activeOpacity={0.8}
          >
            <View style={styles.modeIconRow}>
              <Text style={styles.modeEmoji}>😴</Text>
              {alarmMode === 'normal' && (
                <View style={styles.modeCheck}><Text style={styles.modeCheckText}>✓</Text></View>
              )}
            </View>
            <Text style={[styles.modeTitle, alarmMode === 'normal' && styles.modeTitleActive]}>
              Normal Alarm
            </Text>
            <Text style={styles.modeDesc}>
              Snooze or stop the alarm anytime. No squats required.
            </Text>
            <View style={styles.modeTagRow}>
              <View style={styles.modeTag}><Text style={styles.modeTagText}>⏰ Snooze</Text></View>
              <View style={styles.modeTag}><Text style={styles.modeTagText}>✕ Stop</Text></View>
            </View>
          </TouchableOpacity>

          {/* Challenge Mode Card */}
          <TouchableOpacity
            style={[styles.modeCard, styles.modeCardChallenge, alarmMode === 'challenge' && styles.modeCardChallengeActive]}
            onPress={() => setAlarmMode('challenge')}
            activeOpacity={0.8}
          >
            <View style={styles.modeIconRow}>
              <Text style={styles.modeEmoji}>💪</Text>
              {alarmMode === 'challenge' && (
                <View style={[styles.modeCheck, styles.modeCheckChallenge]}>
                  <Text style={styles.modeCheckText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.modeTitle, alarmMode === 'challenge' && styles.modeTitleChallenge]}>
              Squat Challenge
            </Text>
            <Text style={styles.modeDesc}>
              The ONLY way to stop the alarm is to complete your squats. App opens automatically.
            </Text>
            <View style={styles.modeTagRow}>
              <View style={[styles.modeTag, styles.modeTagChallenge]}>
                <Text style={[styles.modeTagText, styles.modeTagTextChallenge]}>🏋️ Must Complete</Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        {/* Challenge info box + wake screen toggle */}
        {alarmMode === 'challenge' && (
          <View style={styles.challengeInfoBlock}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeInfoIcon}>⚡</Text>
              <Text style={styles.challengeInfoText}>
                When the alarm fires, the app will open directly to the squat counter.
                Complete <Text style={{ fontWeight: '800' }}>{targetReps} squats</Text> to dismiss it.
                No snooze allowed!
              </Text>
            </View>

            {/* Wake Screen Toggle */}
            <View style={styles.wakeRow}>
              <View style={styles.wakeLeft}>
                <Text style={styles.wakeTitle}>📱 Wake screen when locked</Text>
                <Text style={styles.wakeDesc}>
                  {wakeScreen
                    ? 'Phone turns on automatically & challenge opens.'
                    : 'Notification only — you must unlock & open manually.'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setWakeScreen(v => !v)}
                style={[styles.toggle, wakeScreen ? styles.toggleChallenge : styles.toggleOff]}
              />
            </View>
          </View>
        )}

        {/* ── Repeat Days ── */}
        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.daysContainer}>
          {ALL_DAYS.map(day => {
            const active = repeatDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                style={[styles.dayCircle, active && styles.dayActive]}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>
                  {DAY_LABELS[day]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Challenge Target ── */}
        <Text style={styles.sectionTitle}>Squat Target</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Reps to complete</Text>
          <View style={styles.repRow}>
            <TouchableOpacity onPress={() => setTargetReps(r => Math.max(1, r - 1))} style={styles.repBtn}>
              <Text style={styles.repBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.repValue}>{targetReps}</Text>
            <TouchableOpacity onPress={() => setTargetReps(r => r + 1)} style={styles.repBtn}>
              <Text style={styles.repBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Settings ── */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <Row label="🔊 Sound"><Toggle value={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} /></Row>
        <Row label="📳 Vibration"><Toggle value={vibrationEnabled} onToggle={() => setVibrationEnabled(v => !v)} /></Row>

      </ScrollView>
      <View style={styles.footer}>
        <Button title={isEdit ? 'Update Alarm' : 'Save Alarm'} onPress={handleSave} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120 },

  // Time picker
  timePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.outlineVariant },
  timeColumn: { alignItems: 'center' },
  timeSep: { fontSize: 48, fontWeight: '700', color: colors.textMain, marginHorizontal: 8 },
  timeDigit: { fontSize: 56, fontWeight: '800', color: colors.textMain, minWidth: 70, textAlign: 'center' },
  timeBtn: { padding: 8 },
  timeBtnText: { fontSize: 18, color: colors.primaryContainer, fontWeight: '700' },
  ampmCol: { marginLeft: 16, gap: 8 },
  ampmBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: rounded.md, backgroundColor: colors.surfaceContainer },
  ampmActive: { backgroundColor: colors.primaryContainer },
  ampmText: { ...typography.labelMd, color: colors.textMuted },
  ampmActiveText: { color: colors.onPrimary },

  sectionTitle: { ...typography.labelLg, color: colors.textMain, marginBottom: 12, marginTop: 20 },

  // ── Mode selector ──────────────────────────────────────────────────────────
  modeContainer: { flexDirection: 'row', gap: spacing.sm },

  modeCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
  },
  modeCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryContainer + '33',
  },
  modeCardChallenge: {
    // base style same but accent colour different
  },
  modeCardChallengeActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer + '18',
  },

  modeIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modeEmoji: { fontSize: 28 },
  modeCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  modeCheckChallenge: { backgroundColor: colors.primaryContainer },
  modeCheckText: { fontSize: 12, color: '#fff', fontWeight: '800' },

  modeTitle: { ...typography.labelLg, color: colors.textMuted, marginBottom: 6 },
  modeTitleActive: { color: colors.secondary },
  modeTitleChallenge: { color: colors.primaryContainer },

  modeDesc: { ...typography.labelSm, color: colors.textMuted, lineHeight: 16, marginBottom: 10 },

  modeTagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  modeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: rounded.full, backgroundColor: colors.surfaceContainerHigh },
  modeTagText: { ...typography.labelSm, color: colors.textMuted, fontSize: 10 },
  modeTagChallenge: { backgroundColor: colors.primaryContainer + '22' },
  modeTagTextChallenge: { color: colors.primaryContainer },

  // Challenge info
  challengeInfoBlock: {
    gap: spacing.sm,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryContainer + '15',
    borderRadius: rounded.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryContainer + '40',
    gap: 10,
  },
  challengeInfoIcon: { fontSize: 20 },
  challengeInfoText: { ...typography.bodySm, color: colors.textMain, flex: 1, lineHeight: 18 },

  // Wake screen row
  wakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: 12,
  },
  wakeLeft: { flex: 1 },
  wakeTitle: { ...typography.labelMd, color: colors.textMain, marginBottom: 2 },
  wakeDesc: { ...typography.labelSm, color: colors.textMuted, lineHeight: 16 },
  toggleChallenge: { backgroundColor: colors.primaryContainer },

  // Days
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  dayActive: { backgroundColor: colors.primaryContainer },
  dayText: { ...typography.labelMd, color: colors.textMuted },
  dayTextActive: { color: colors.onPrimary },

  // Card
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 8 },
  cardLabel: { ...typography.bodyMd, color: colors.textMain },

  // Rep stepper
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  repBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center' },
  repBtnText: { fontSize: 18, color: colors.onPrimary, fontWeight: '700' },
  repValue: { ...typography.headlineSm, color: colors.textMain, minWidth: 30, textAlign: 'center' },

  // Settings row
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 8 },
  rowLabel: { ...typography.bodyMd, color: colors.textMain },
  toggle: { width: 48, height: 26, borderRadius: 13 },
  toggleOn: { backgroundColor: colors.primaryContainer },
  toggleOff: { backgroundColor: colors.surfaceVariant },

  footer: { padding: spacing.lg, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { Alarm, DayKey } from '../types/types';

const ALL_DAYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS: Record<DayKey, string> = {
  Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S',
};

interface Props {
  existingAlarm?: Alarm | null;   // null = create mode
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

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const toggleDay = (day: DayKey) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleSave = () => {
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
    };
    if (isEdit) {
      updateAlarm(alarm);
    } else {
      addAlarm(alarm);
    }
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

        {/* ── Challenge ── */}
        <Text style={styles.sectionTitle}>Challenge</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Exercise</Text>
          <Text style={styles.cardValue}>Squats</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Target Reps</Text>
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

  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  dayActive: { backgroundColor: colors.primaryContainer },
  dayText: { ...typography.labelMd, color: colors.textMuted },
  dayTextActive: { color: colors.onPrimary },

  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 8 },
  cardLabel: { ...typography.bodyMd, color: colors.textMain },
  cardValue: { ...typography.labelLg, color: colors.primaryContainer },

  repRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  repBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center' },
  repBtnText: { fontSize: 18, color: colors.onPrimary, fontWeight: '700' },
  repValue: { ...typography.headlineSm, color: colors.textMain, minWidth: 30, textAlign: 'center' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 8 },
  rowLabel: { ...typography.bodyMd, color: colors.textMain },
  toggle: { width: 48, height: 26, borderRadius: 13 },
  toggleOn: { backgroundColor: colors.primaryContainer },
  toggleOff: { backgroundColor: colors.surfaceVariant },

  footer: { padding: spacing.lg, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

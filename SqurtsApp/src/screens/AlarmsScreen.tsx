import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { Alarm } from '../types/types';

interface Props {
  onCreateAlarm: () => void;
  onEditAlarm: (alarm: Alarm) => void;
  onAlarmTrigger: (alarm: Alarm) => void;
}

export const AlarmsScreen = ({ onCreateAlarm, onEditAlarm, onAlarmTrigger }: Props) => {
  const { alarms, updateAlarm, deleteAlarm } = useAppContext();

  const toggleAlarm = (alarm: Alarm) => {
    updateAlarm({ ...alarm, enabled: !alarm.enabled });
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Alarm', 'Remove this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Alarms" />
      <ScrollView contentContainerStyle={styles.content}>
        {alarms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No alarms yet</Text>
            <Text style={styles.emptyBody}>Tap "Add Alarm" to create your first morning challenge.</Text>
          </View>
        )}

        {alarms.map(alarm => (
          <TouchableOpacity
            key={alarm.id}
            style={styles.alarmCard}
            onPress={() => onEditAlarm(alarm)}
            onLongPress={() => onAlarmTrigger(alarm)}
          >
            <View style={styles.alarmLeft}>
              <Text style={styles.time}>{alarm.time} {alarm.ampm}</Text>
              <Text style={styles.repeat}>
                {alarm.repeatDays.length > 0 ? alarm.repeatDays.join(', ') : 'Once'}
              </Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{alarm.targetReps} Squats</Text>
              </View>
              {alarm.label ? <Text style={styles.label}>{alarm.label}</Text> : null}
            </View>

            <View style={styles.alarmRight}>
              {/* Toggle */}
              <TouchableOpacity
                onPress={() => toggleAlarm(alarm)}
                style={[styles.toggle, alarm.enabled ? styles.toggleOn : styles.toggleOff]}
              />
              {/* Delete */}
              <TouchableOpacity onPress={() => confirmDelete(alarm.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.fabContainer}>
        <Button title="Add Alarm  +" onPress={onCreateAlarm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.headlineSm, color: colors.textMain, marginBottom: 8 },
  emptyBody: { ...typography.bodyMd, color: colors.textMuted, textAlign: 'center' },

  alarmCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: spacing.md },
  alarmLeft: { flex: 1 },
  alarmRight: { alignItems: 'center', gap: 12 },

  time: { ...typography.headlineMd, color: colors.textMain, marginBottom: 4 },
  repeat: { ...typography.bodySm, color: colors.textMuted, marginBottom: 8 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: rounded.full, backgroundColor: colors.primaryContainer + '22', marginBottom: 4 },
  tagText: { ...typography.labelSm, color: colors.primaryContainer },
  label: { ...typography.bodySm, color: colors.textMuted, fontStyle: 'italic' },

  toggle: { width: 48, height: 26, borderRadius: 13 },
  toggleOn: { backgroundColor: colors.primaryContainer },
  toggleOff: { backgroundColor: colors.surfaceVariant },

  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.errorContainer, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 12, color: colors.error, fontWeight: '700' },

  fabContainer: { position: 'absolute', bottom: 24, left: 24, right: 24 },
});

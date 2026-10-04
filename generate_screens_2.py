import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

screens_dir = "SqurtsApp/src/screens"

# 3. AlarmsScreen.tsx
write_file(f"{screens_dir}/AlarmsScreen.tsx", """import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const AlarmsScreen = ({ onCreateAlarm, onAlarmPress }: { onCreateAlarm: () => void, onAlarmPress?: () => void }) => {
  return (
    <View style={styles.container}>
      <Header title="Alarms" />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.alarmCard} onPress={onAlarmPress}>
          <View>
            <Text style={styles.time}>7:00 AM</Text>
            <Text style={styles.repeat}>Mon, Tue, Wed, Thu, Fri</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>10 Squats</Text>
            </View>
          </View>
          <View style={styles.toggleActive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.alarmCard, { opacity: 0.5 }]}>
          <View>
            <Text style={styles.time}>8:30 AM</Text>
            <Text style={styles.repeat}>Weekends</Text>
            <View style={[styles.tag, { backgroundColor: colors.surfaceContainer }]}>
              <Text style={[styles.tagText, { color: colors.textMuted }]}>20 Squats</Text>
            </View>
          </View>
          <View style={styles.toggleInactive} />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.fabContainer}>
        <Button title="Add Alarm" onPress={onCreateAlarm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  alarmCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderRadius: rounded.xl, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: spacing.md },
  time: { ...typography.headlineMd, color: colors.textMain, marginBottom: 4 },
  repeat: { ...typography.bodySm, color: colors.textMuted, marginBottom: 12 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: rounded.full, backgroundColor: colors.primaryContainer + '20' },
  tagText: { ...typography.labelSm, color: colors.primaryContainer },
  toggleActive: { width: 48, height: 24, borderRadius: 12, backgroundColor: colors.primaryContainer },
  toggleInactive: { width: 48, height: 24, borderRadius: 12, backgroundColor: colors.surfaceVariant },
  fabContainer: { position: 'absolute', bottom: 24, left: 24, right: 24 }
});
""")

# 4. CreateAlarmScreen.tsx
write_file(f"{screens_dir}/CreateAlarmScreen.tsx", """import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const CreateAlarmScreen = ({ onSave, onBack }: { onSave: () => void, onBack: () => void }) => {
  return (
    <View style={styles.container}>
      <Header title="Create Alarm" showBack onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>07:00</Text>
          <Text style={styles.ampm}>AM</Text>
        </View>

        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.daysContainer}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={[styles.dayCircle, i < 5 ? styles.dayActive : {}]}>
              <Text style={[styles.dayText, i < 5 ? styles.dayTextActive : {}]}>{day}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Challenge</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Exercise</Text>
          <Text style={styles.cardValue}>Squats</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Target Reps</Text>
          <Text style={styles.cardValue}>10</Text>
        </View>

      </ScrollView>
      <View style={styles.footer}>
        <Button title="Save Alarm" onPress={onSave} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  timeContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginVertical: spacing.xl },
  timeText: { fontSize: 64, fontWeight: 'bold', color: colors.textMain },
  ampm: { fontSize: 24, fontWeight: 'bold', color: colors.textMain, marginLeft: 8 },
  sectionTitle: { ...typography.labelLg, color: colors.textMain, marginBottom: 12, marginTop: 24 },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  dayActive: { backgroundColor: colors.primaryContainer },
  dayText: { ...typography.labelMd, color: colors.textMuted },
  dayTextActive: { color: colors.onPrimary },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 8 },
  cardLabel: { ...typography.bodyMd, color: colors.textMain },
  cardValue: { ...typography.bodyMd, color: colors.primaryContainer, fontWeight: 'bold' },
  footer: { padding: spacing.lg, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: colors.outlineVariant }
});
""")

# 5. ActiveAlarmScreen.tsx
write_file(f"{screens_dir}/ActiveAlarmScreen.tsx", """import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ActiveAlarmScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [reps, setReps] = useState(0);
  const target = 10;

  // Fake interaction for testing
  const simulateRep = () => {
    if (reps + 1 >= target) {
      onComplete();
    } else {
      setReps(r => r + 1);
    }
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={simulateRep}>
      <View style={styles.header}>
        <Text style={styles.time}>07:00</Text>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>ALARM ACTIVE</Text>
        </View>
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.greeting}>GOOD MORNING</Text>
        <Text style={styles.task}>Complete {target} squats</Text>
        <Text style={styles.subtask}>to silence the alarm</Text>
      </View>

      <View style={styles.cameraFrame}>
        <View style={styles.skeletonCenter} />
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingText}>CAMERA TRACKING</Text>
        </View>
        <View style={styles.depthBadge}>
          <Text style={styles.depthText}>DEPTH DETECTED</Text>
          <Text style={styles.depthValue}>91°</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Squats count</Text>
          <Text style={styles.progressValue}>{String(reps).padStart(2, '0')} <Text style={styles.progressTarget}>/ {target}</Text></Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(reps / target) * 100}%` }]} />
        </View>
        <View style={styles.helperMsg}>
          <Text style={styles.helperText}>Keep going! {target - reps} more to silence alarm.</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  time: { ...typography.labelLg, color: colors.textMain },
  banner: { backgroundColor: colors.errorContainer, paddingHorizontal: 12, paddingVertical: 4, borderRadius: rounded.full },
  bannerText: { ...typography.labelSm, color: colors.error },
  titleContainer: { alignItems: 'center', marginVertical: spacing.md },
  greeting: { ...typography.labelSm, color: colors.textMuted, marginBottom: 4 },
  task: { ...typography.headlineSm, color: colors.textMain, fontWeight: '800' },
  subtask: { ...typography.bodySm, color: colors.textMuted },
  cameraFrame: { flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: rounded.xl, marginVertical: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  skeletonCenter: { position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.secondaryContainer, marginLeft: -10, marginTop: -10, borderWidth: 2, borderColor: colors.secondary },
  trackingBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.inverseSurface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  trackingText: { fontSize: 10, color: colors.surfaceContainerLowest, fontWeight: 'bold' },
  depthBadge: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: colors.secondary, padding: 12, borderRadius: rounded.lg, flexDirection: 'row', justifyContent: 'space-between' },
  depthText: { ...typography.labelSm, color: colors.surfaceContainerLowest },
  depthValue: { ...typography.labelSm, color: colors.surfaceContainerLowest },
  progressContainer: { marginBottom: spacing.xl },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  progressLabel: { ...typography.labelMd, color: colors.textMuted },
  progressValue: { ...typography.headlineMd, color: colors.primaryContainer },
  progressTarget: { ...typography.bodyMd, color: colors.textMuted },
  progressBarBg: { height: 12, backgroundColor: colors.surfaceContainerHigh, borderRadius: rounded.full, marginBottom: 16 },
  progressBarFill: { height: '100%', backgroundColor: colors.primaryContainer, borderRadius: rounded.full },
  helperMsg: { backgroundColor: colors.surfaceContainer, padding: 12, borderRadius: rounded.md, alignItems: 'center' },
  helperText: { ...typography.labelSm, color: colors.primaryContainer }
});
""")

print("Screens generated part 2.")

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { checkBackendHealth, getSquatResult, pushAlarmSettings } from '../services/api';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { SquatResult } from '../types/types';

interface Props {
  targetReps: number;
  onComplete: () => void;
}

type ConnectionStatus = 'checking' | 'connected' | 'unavailable';

export const ActiveAlarmScreen = ({ targetReps, onComplete }: Props) => {
  const [reps, setReps] = useState(0);
  const [squatState, setSquatState] = useState<string>('STANDING');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [validRep, setValidRep] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // On mount: push alarm settings to backend, start polling
  useEffect(() => {
    completedRef.current = false;

    const init = async () => {
      await pushAlarmSettings(targetReps);
      const healthy = await checkBackendHealth();
      setConnectionStatus(healthy ? 'connected' : 'unavailable');
    };
    init();

    // Poll backend every 500ms for real squat results
    pollRef.current = setInterval(async () => {
      const result: SquatResult | null = await getSquatResult();
      if (result && !completedRef.current) {
        setReps(result.reps);
        setSquatState(result.state);
        setValidRep(result.valid_rep);

        if (result.reps >= targetReps) {
          completedRef.current = true;
          clearInterval(pollRef.current!);
          onComplete();
        }
      }
    }, 500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const progress = Math.min(reps / targetReps, 1);
  const remaining = targetReps - reps;

  const stateColor: Record<string, string> = {
    STANDING: colors.textMuted,
    DESCENDING: colors.secondary,
    BOTTOM: colors.primaryContainer,
    ASCENDING: colors.secondary,
  };

  return (
    <View style={styles.container}>

      {/* Connection badge */}
      <View style={styles.topRow}>
        <Text style={styles.alarmTime}>🔔 ALARM ACTIVE</Text>
        <View style={[styles.connBadge, connectionStatus === 'connected' ? styles.connOk : styles.connErr]}>
          <Text style={styles.connText}>
            {connectionStatus === 'checking' ? '⏳ Connecting…'
              : connectionStatus === 'connected' ? '✓ AI Connected'
                : '⚠ No AI'}
          </Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.greeting}>GOOD MORNING</Text>
        <Text style={styles.task}>Complete {targetReps} squats</Text>
        <Text style={styles.subtask}>to silence the alarm</Text>
      </View>

      {/* Camera frame placeholder */}
      <View style={styles.cameraFrame}>
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingText}>CAMERA TRACKING</Text>
        </View>

        {/* State indicator in centre */}
        <View style={styles.stateCenter}>
          <Text style={[styles.stateText, { color: stateColor[squatState] ?? colors.textMuted }]}>
            {squatState}
          </Text>
          {validRep && <Text style={styles.validRepText}>✓ Valid Rep</Text>}
        </View>

        <View style={styles.depthBadge}>
          <Text style={styles.depthText}>
            {connectionStatus === 'unavailable'
              ? '⚠ Make sure Squrts AI is running on your PC'
              : 'AI Pose Tracking Active'}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Squats count</Text>
          <Text style={styles.progressValue}>
            {String(reps).padStart(2, '0')}
            <Text style={styles.progressTarget}> / {targetReps}</Text>
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
        </View>

        <View style={styles.helperMsg}>
          <Text style={styles.helperText}>
            {remaining > 0
              ? `Keep going! ${remaining} more to silence alarm.`
              : '🎉 Challenge complete!'}
          </Text>
        </View>

        {/* Retry if backend is down */}
        {connectionStatus === 'unavailable' && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => {
            setConnectionStatus('checking');
            checkBackendHealth().then(ok => setConnectionStatus(ok ? 'connected' : 'unavailable'));
          }}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, justifyContent: 'space-between' },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  alarmTime: { ...typography.labelLg, color: colors.error },
  connBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: rounded.full },
  connOk: { backgroundColor: colors.secondaryContainer },
  connErr: { backgroundColor: colors.errorContainer },
  connText: { ...typography.labelSm, color: colors.textMain },

  titleBlock: { alignItems: 'center' },
  greeting: { ...typography.labelSm, color: colors.textMuted, letterSpacing: 2, marginBottom: 4 },
  task: { ...typography.headlineSm, color: colors.textMain, fontWeight: '800' },
  subtask: { ...typography.bodySm, color: colors.textMuted },

  cameraFrame: { flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: rounded.xl, marginVertical: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  trackingBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.inverseSurface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  trackingText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  stateCenter: { alignItems: 'center' },
  stateText: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  validRepText: { ...typography.labelMd, color: colors.secondary, marginTop: 4 },
  depthBadge: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: colors.secondary + 'dd', padding: 10, borderRadius: rounded.lg },
  depthText: { ...typography.labelSm, color: '#fff', textAlign: 'center' },

  progressBlock: { marginBottom: spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { ...typography.labelMd, color: colors.textMuted },
  progressValue: { ...typography.headlineMd, color: colors.primaryContainer },
  progressTarget: { ...typography.bodyMd, color: colors.textMuted },
  progressBarBg: { height: 12, backgroundColor: colors.surfaceContainerHigh, borderRadius: rounded.full, marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: colors.primaryContainer, borderRadius: rounded.full },
  helperMsg: { backgroundColor: colors.surfaceContainer, padding: 12, borderRadius: rounded.md, alignItems: 'center' },
  helperText: { ...typography.labelSm, color: colors.primaryContainer },

  retryBtn: { marginTop: 12, padding: 12, borderRadius: rounded.md, backgroundColor: colors.errorContainer, alignItems: 'center' },
  retryText: { ...typography.labelMd, color: colors.error },
});

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { checkBackendHealth, getSquatResult, pushAlarmSettings } from '../services/api';
import { cancelAlarm } from '../services/alarmService';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { Alarm, SquatResult } from '../types/types';

interface Props {
  alarm: Alarm;
  onComplete: () => void;
}

type ConnectionStatus = 'checking' | 'connected' | 'unavailable';

export const ActiveAlarmScreen = ({ alarm, onComplete }: Props) => {
  const { targetReps, alarmMode, id: alarmId } = alarm;
  const isChallenge = alarmMode === 'challenge';

  const [reps, setReps] = useState(0);
  const [squatState, setSquatState] = useState<string>('STANDING');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [validRep, setValidRep] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // On mount: push alarm settings to backend, start polling, block back button
  useEffect(() => {
    completedRef.current = false;

    const init = async () => {
      if (isChallenge) {
        await pushAlarmSettings(targetReps);
      }
      const healthy = await checkBackendHealth();
      setConnectionStatus(healthy ? 'connected' : 'unavailable');
    };
    init();

    // ── Block hardware back button during challenge ────────────────────────
    let backSub: ReturnType<typeof BackHandler.addEventListener> | null = null;
    if (isChallenge) {
      backSub = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert(
          '🔒 Challenge Locked',
          `You cannot exit until you complete ${targetReps} squats!`,
          [{ text: "Let's Go! 💪", style: 'cancel' }],
        );
        return true; // prevents default back action
      });
    }

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
      if (backSub) backSub.remove();
    };
  }, []);

  // ── Normal mode: manual stop/snooze ──────────────────────────────────────
  const handleStop = async () => {
    if (isChallenge) {
      Alert.alert(
        '⚡ Challenge Alarm',
        `You must complete ${targetReps} squats to stop this alarm!`,
        [{ text: 'OK, Let\'s Go!' }],
      );
      return;
    }
    await cancelAlarm(alarmId);
    onComplete();
  };

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

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.alarmBadge}>
          <Text style={isChallenge ? styles.alarmTimeBadgeChallenge : styles.alarmTimeBadgeNormal}>
            {isChallenge ? '💪 CHALLENGE ALARM' : '🔔 ALARM ACTIVE'}
          </Text>
        </View>
        <View style={[styles.connBadge, connectionStatus === 'connected' ? styles.connOk : styles.connErr]}>
          <Text style={styles.connText}>
            {connectionStatus === 'checking' ? '⏳ Connecting…'
              : connectionStatus === 'connected' ? '✓ AI Connected'
                : '⚠ No AI'}
          </Text>
        </View>
      </View>

      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={styles.greeting}>GOOD MORNING</Text>
        {isChallenge ? (
          <>
            <Text style={styles.task}>Complete {targetReps} squats</Text>
            <Text style={styles.subtask}>to silence this alarm — no snooze!</Text>
          </>
        ) : (
          <>
            <Text style={styles.task}>Your alarm is ringing</Text>
            <Text style={styles.subtask}>Optionally do squats, or stop below</Text>
          </>
        )}
      </View>

      {/* Camera / state frame */}
      <View style={[styles.cameraFrame, isChallenge && styles.cameraFrameChallenge]}>
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingText}>CAMERA TRACKING</Text>
        </View>

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

      {/* Progress bar */}
      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Squats</Text>
          <Text style={styles.progressValue}>
            {String(reps).padStart(2, '0')}
            <Text style={styles.progressTarget}> / {targetReps}</Text>
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }, isChallenge && styles.progressBarChallenge]} />
        </View>

        <View style={styles.helperMsg}>
          <Text style={styles.helperText}>
            {remaining > 0
              ? `${isChallenge ? '🔥 Keep going! ' : ''}${remaining} more to ${isChallenge ? 'silence alarm' : 'finish'}.`
              : '🎉 Challenge complete!'}
          </Text>
        </View>

        {connectionStatus === 'unavailable' && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => {
            setConnectionStatus('checking');
            checkBackendHealth().then(ok => setConnectionStatus(ok ? 'connected' : 'unavailable'));
          }}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {!isChallenge && (
          <TouchableOpacity style={styles.snoozeBtn} onPress={handleStop}>
            <Text style={styles.snoozeBtnText}>⏰ Snooze 5 min</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.stopBtn, isChallenge && styles.stopBtnLocked]}
          onPress={handleStop}
        >
          <Text style={styles.stopBtnText}>
            {isChallenge ? '🔒 Complete Squats to Stop' : '✕ Stop Alarm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, justifyContent: 'space-between' },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  alarmBadge: {},
  alarmTimeBadgeNormal: { ...typography.labelLg, color: colors.secondary },
  alarmTimeBadgeChallenge: { ...typography.labelLg, color: colors.primaryContainer },
  connBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: rounded.full },
  connOk: { backgroundColor: colors.secondaryContainer },
  connErr: { backgroundColor: colors.errorContainer },
  connText: { ...typography.labelSm, color: colors.textMain },

  titleBlock: { alignItems: 'center' },
  greeting: { ...typography.labelSm, color: colors.textMuted, letterSpacing: 2, marginBottom: 4 },
  task: { ...typography.headlineSm, color: colors.textMain, fontWeight: '800' },
  subtask: { ...typography.bodySm, color: colors.textMuted },

  cameraFrame: { flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: rounded.xl, marginVertical: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  cameraFrameChallenge: { borderColor: colors.primaryContainer, borderWidth: 2 },
  trackingBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.inverseSurface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  trackingText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  stateCenter: { alignItems: 'center' },
  stateText: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  validRepText: { ...typography.labelMd, color: colors.secondary, marginTop: 4 },
  depthBadge: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: colors.secondary + 'dd', padding: 10, borderRadius: rounded.lg },
  depthText: { ...typography.labelSm, color: '#fff', textAlign: 'center' },

  progressBlock: { marginBottom: spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { ...typography.labelMd, color: colors.textMuted },
  progressValue: { ...typography.headlineMd, color: colors.primaryContainer },
  progressTarget: { ...typography.bodyMd, color: colors.textMuted },
  progressBarBg: { height: 12, backgroundColor: colors.surfaceContainerHigh, borderRadius: rounded.full, marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: rounded.full },
  progressBarChallenge: { backgroundColor: colors.primaryContainer },
  helperMsg: { backgroundColor: colors.surfaceContainer, padding: 12, borderRadius: rounded.md, alignItems: 'center' },
  helperText: { ...typography.labelSm, color: colors.primaryContainer },

  retryBtn: { marginTop: 12, padding: 12, borderRadius: rounded.md, backgroundColor: colors.errorContainer, alignItems: 'center' },
  retryText: { ...typography.labelMd, color: colors.error },

  // Action buttons
  actionsRow: { flexDirection: 'column', gap: spacing.sm, paddingBottom: spacing.sm },
  snoozeBtn: { padding: spacing.md, borderRadius: rounded.xl, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  snoozeBtnText: { ...typography.labelMd, color: colors.textMain },
  stopBtn: { padding: spacing.md, borderRadius: rounded.xl, backgroundColor: colors.errorContainer, alignItems: 'center' },
  stopBtnLocked: { backgroundColor: colors.surfaceContainerHigh },
  stopBtnText: { ...typography.labelMd, color: colors.error },
});

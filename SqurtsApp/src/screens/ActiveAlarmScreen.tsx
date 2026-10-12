import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  Linking,
  Platform,
  Vibration,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
  useAsyncRunner,
} from 'react-native-vision-camera';
import {
  nitroPoseExercises,
  type ExerciseConfig,
  type ExercisePhase,
  type RepData,
  type FormFeedback,
} from 'react-native-nitro-pose-exercises';
import { cancelAlarm } from '../services/alarmService';
import { colors, typography, rounded, spacing } from '../theme/theme';
import { Alarm } from '../types/types';

interface Props {
  alarm: Alarm;
  onComplete: () => void;
}

type EngineStatus = 'initializing' | 'active' | 'error';

/**
 * Bilateral squat configuration tuned specifically for on-device mobile camera tracking.
 * Checks both left and right knee angles so users can face the camera naturally or at an angle.
 * Down threshold relaxed to 110° for morning wake-up mobility.
 */
const SQURTS_SQUAT_CONFIG: ExerciseConfig = {
  name: 'Squat',
  type: 'rep',
  postureFamily: 'standingUpright',
  visibilityThreshold: 0.2,
  cameraAngle: 'front',
  angles: [
    { name: 'leftKnee', landmarkA: 23, landmarkB: 25, landmarkC: 27 },
    { name: 'rightKnee', landmarkA: 24, landmarkB: 26, landmarkC: 28 },
    { name: 'leftHip', landmarkA: 11, landmarkB: 23, landmarkC: 25 },
    { name: 'rightHip', landmarkA: 12, landmarkB: 24, landmarkC: 26 },
  ],
  phases: [
    // Bottom depth phase (relaxed to 110° for morning responsiveness)
    { phase: 'down', angleName: 'leftKnee', minAngle: 50, maxAngle: 110 },
    { phase: 'down', angleName: 'rightKnee', minAngle: 50, maxAngle: 110 },
    // Full standing phase (>=150°)
    { phase: 'up', angleName: 'leftKnee', minAngle: 150, maxAngle: 180 },
    { phase: 'up', angleName: 'rightKnee', minAngle: 150, maxAngle: 180 },
  ],
  repSequence: ['up', 'down', 'up'],
  formRules: [
    {
      name: 'kneesCaving',
      message: 'Push your knees out over your toes',
      severity: 'warning',
      angleName: 'leftKnee',
      minAngle: 40,
      maxAngle: 180,
    },
    {
      name: 'leaningForward',
      message: 'Keep your torso upright',
      severity: 'warning',
      angleName: 'leftHip',
      minAngle: 65,
      maxAngle: 180,
    },
  ],
  holdDurationMs: 0,
};

export const ActiveAlarmScreen = ({ alarm, onComplete }: Props) => {
  const { targetReps, alarmMode, id: alarmId } = alarm;
  const isChallenge = alarmMode === 'challenge';

  const [reps, setReps] = useState(0);
  const [squatPhase, setSquatPhase] = useState<string>('STANDING');
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('initializing');
  const [inPosture, setInPosture] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState('Position your phone and step into view');
  const [validRep, setValidRep] = useState(false);

  const completedRef = useRef(false);

  // Camera permissions & device selection
  const { hasPermission, requestPermission } = useCameraPermission();
  const frontDevice = useCameraDevice('front');
  const backDevice = useCameraDevice('back');
  const device = frontDevice ?? backDevice;

  // VisionCamera v5 worklet async runner
  const asyncRunner = useAsyncRunner();
  const isAndroid = Platform.OS === 'android';

  const frameOutput = useFrameOutput({
    pixelFormat: 'rgb',
    onFrame(frame) {
      'worklet';
      const accepted = asyncRunner.runAsync(() => {
        'worklet';
        try {
          if (isAndroid) {
            nitroPoseExercises.processFrameAndroid(frame);
          } else {
            nitroPoseExercises.processFrameIOS(frame);
          }
        } catch {
          // Frame dropped or busy
        } finally {
          frame.dispose();
        }
      });
      if (!accepted) {
        frame.dispose();
      }
    },
  });

  // Request camera permission on mount if not already granted
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Block hardware back button during active challenge
  useEffect(() => {
    let backSub: ReturnType<typeof BackHandler.addEventListener> | null = null;
    if (isChallenge) {
      backSub = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert(
          '🔒 Challenge Locked',
          `You must complete ${targetReps} squats to stop this alarm!`,
          [{ text: "Let's Go! 💪", style: 'cancel' }],
        );
        return true;
      });
    }
    return () => {
      if (backSub) backSub.remove();
    };
  }, [isChallenge, targetReps]);

  // Standalone on-device pose estimation lifecycle
  useEffect(() => {
    let isMounted = true;
    completedRef.current = false;

    const setupOnDeviceAI = async () => {
      try {
        setEngineStatus('initializing');
        setGuidanceMessage('Loading on-device AI pose model…');

        await nitroPoseExercises.initialize('');
        nitroPoseExercises.loadExercise(SQURTS_SQUAT_CONFIG);

        // Rep completed callback
        nitroPoseExercises.onRepComplete = (data: RepData) => {
          if (!isMounted || completedRef.current) return;

          const currentRep = Math.round(data.repNumber);
          setReps(currentRep);
          setValidRep(true);
          setGuidanceMessage(`✓ Rep ${currentRep} registered! Keep moving!`);

          // Tactile haptic feedback on each valid rep
          try {
            Vibration.vibrate(100);
          } catch {
            // vibration not supported
          }

          setTimeout(() => {
            if (isMounted) setValidRep(false);
          }, 900);

          if (currentRep >= targetReps) {
            completedRef.current = true;
            try {
              Vibration.vibrate([0, 150, 100, 250]);
              nitroPoseExercises.stopSession();
            } catch {
              // ignore
            }
            onComplete();
          }
        };

        // Phase change callback (up, down, etc.)
        nitroPoseExercises.onPhaseChange = (phase: ExercisePhase) => {
          if (!isMounted) return;
          if (phase === 'up') {
            setSquatPhase('STANDING');
            setGuidanceMessage('Squat down with proper depth');
          } else if (phase === 'down') {
            setSquatPhase('BOTTOM');
            setGuidanceMessage('Great depth! Now stand all the way up');
          } else if (phase === 'transition') {
            setSquatPhase('MOVING');
          }
        };

        // Posture guidance callbacks
        nitroPoseExercises.onPostureLost = () => {
          if (!isMounted) return;
          setInPosture(false);
          setGuidanceMessage('🧍 Stand back: ensure shoulders, hips, and knees are visible');
        };

        nitroPoseExercises.onPostureRegained = () => {
          if (!isMounted) return;
          setInPosture(true);
          setGuidanceMessage('Ready! Squat to start counting reps');
        };

        nitroPoseExercises.onPoseLost = () => {
          if (!isMounted) return;
          setInPosture(false);
          setGuidanceMessage('👤 No person detected. Step in front of the camera');
        };

        nitroPoseExercises.onPoseRegained = () => {
          if (!isMounted) return;
          setInPosture(true);
        };

        // Form feedback
        nitroPoseExercises.onFormFeedback = (feedback: FormFeedback) => {
          if (!isMounted) return;
          if (feedback.severity !== 'info') {
            setGuidanceMessage(`💡 ${feedback.message}`);
          }
        };

        // Session completion hook
        nitroPoseExercises.onSessionComplete = () => {
          if (!isMounted || completedRef.current) return;
          completedRef.current = true;
          try {
            Vibration.vibrate([0, 150, 100, 250]);
            nitroPoseExercises.stopSession();
          } catch {
            // ignore
          }
          onComplete();
        };

        // Start session immediately (0s countdown for morning alarm urgency)
        nitroPoseExercises.startSession(targetReps, 0);

        if (isMounted) {
          setEngineStatus('active');
          setInPosture(true);
          setGuidanceMessage('⚡ On-Device AI Active! Step in view & squat');
        }
      } catch (err) {
        console.error('[ActiveAlarm] Failed to initialize on-device pose engine:', err);
        if (isMounted) {
          setEngineStatus('error');
          setGuidanceMessage('AI initialization error. Please check camera permissions.');
        }
      }
    };

    setupOnDeviceAI();

    return () => {
      isMounted = false;
      try {
        nitroPoseExercises.onRepComplete = undefined;
        nitroPoseExercises.onPhaseChange = undefined;
        nitroPoseExercises.onPostureLost = undefined;
        nitroPoseExercises.onPostureRegained = undefined;
        nitroPoseExercises.onPoseLost = undefined;
        nitroPoseExercises.onPoseRegained = undefined;
        nitroPoseExercises.onFormFeedback = undefined;
        nitroPoseExercises.onSessionComplete = undefined;
        nitroPoseExercises.stopSession();
        nitroPoseExercises.release();
      } catch {
        // cleanup safety
      }
    };
  }, [targetReps, onComplete]);

  // Handle normal mode stop / snooze
  const handleStop = async () => {
    if (isChallenge) {
      Alert.alert(
        '⚡ Challenge Alarm',
        `Complete ${targetReps} squats to stop this alarm!`,
        [{ text: "Let's Go!" }],
      );
      return;
    }
    await cancelAlarm(alarmId);
    onComplete();
  };

  const progress = Math.min(reps / targetReps, 1);
  const remaining = targetReps - reps;

  const phaseColor: Record<string, string> = {
    STANDING: colors.secondary,
    MOVING: colors.primaryContainer,
    BOTTOM: '#00c853',
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.alarmBadge}>
          <Text style={isChallenge ? styles.alarmTimeBadgeChallenge : styles.alarmTimeBadgeNormal}>
            {isChallenge ? '💪 CHALLENGE ALARM' : '🔔 ALARM ACTIVE'}
          </Text>
        </View>

        <View
          style={[
            styles.connBadge,
            engineStatus === 'active' && inPosture
              ? styles.connOk
              : engineStatus === 'error'
              ? styles.connErr
              : styles.connWarn,
          ]}
        >
          <Text style={styles.connText}>
            {engineStatus === 'initializing'
              ? '⏳ Initializing AI…'
              : engineStatus === 'error'
              ? '⚠ Engine Error'
              : inPosture
              ? '⚡ On-Device AI Active'
              : '👁️ Step Into View'}
          </Text>
        </View>
      </View>

      {/* Greeting & Challenge Title */}
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

      {/* Live Camera View with Real-time Pose HUD */}
      <View style={[styles.cameraFrame, isChallenge && styles.cameraFrameChallenge]}>
        {!hasPermission ? (
          <View style={styles.cameraError}>
            <Text style={styles.cameraErrorText}>Camera permission is required for the challenge.</Text>
            <TouchableOpacity onPress={() => Linking.openSettings()} style={styles.settingsBtn}>
              <Text style={styles.settingsBtnText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        ) : !device ? (
          <View style={styles.cameraError}>
            <Text style={styles.cameraErrorText}>No camera device found on this phone.</Text>
          </View>
        ) : (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            outputs={[frameOutput]}
          />
        )}

        {/* Top Camera HUD Tag */}
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingText}>FRONT CAMERA • NATIVE AI</Text>
        </View>

        {/* Center Rep / Phase Indicator */}
        <View style={styles.stateCenter}>
          <Text style={[styles.stateText, { color: phaseColor[squatPhase] ?? colors.textMain }]}>
            {squatPhase}
          </Text>
          {validRep && <Text style={styles.validRepText}>✓ Rep Counted!</Text>}
        </View>

        {/* Real-time Guidance / Feedback Banner */}
        <View style={[styles.depthBadge, !inPosture && styles.depthBadgeAlert]}>
          <Text style={styles.depthText}>{guidanceMessage}</Text>
        </View>
      </View>

      {/* Progress & Rep Counters */}
      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Squats</Text>
          <Text style={styles.progressValue}>
            {String(reps).padStart(2, '0')}
            <Text style={styles.progressTarget}> / {targetReps}</Text>
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%` as any },
              isChallenge && styles.progressBarChallenge,
            ]}
          />
        </View>

        <View style={styles.helperMsg}>
          <Text style={styles.helperText}>
            {remaining > 0
              ? `${isChallenge ? '🔥 Keep moving! ' : ''}${remaining} more to ${
                  isChallenge ? 'silence alarm' : 'finish'
                }.`
              : '🎉 Challenge complete!'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
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
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  alarmBadge: {},
  alarmTimeBadgeNormal: { ...typography.labelLg, color: colors.secondary },
  alarmTimeBadgeChallenge: { ...typography.labelLg, color: colors.primaryContainer },
  connBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: rounded.full,
  },
  connOk: { backgroundColor: colors.secondaryContainer },
  connWarn: { backgroundColor: '#ffe082' },
  connErr: { backgroundColor: colors.errorContainer },
  connText: { ...typography.labelSm, color: colors.textMain, fontWeight: '700' },

  titleBlock: { alignItems: 'center' },
  greeting: {
    ...typography.labelSm,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  task: { ...typography.headlineSm, color: colors.textMain, fontWeight: '800' },
  subtask: { ...typography.bodySm, color: colors.textMuted },

  cameraFrame: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: rounded.xl,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrameChallenge: {
    borderColor: colors.primaryContainer,
    borderWidth: 2,
  },
  cameraError: { alignItems: 'center', padding: spacing.md },
  cameraErrorText: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  settingsBtn: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  settingsBtnText: { ...typography.labelMd, color: colors.textMain },

  trackingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  trackingText: { fontSize: 10, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },

  stateCenter: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: rounded.lg,
  },
  stateText: { fontSize: 32, fontWeight: '900', letterSpacing: 2, color: '#fff' },
  validRepText: {
    ...typography.labelMd,
    color: '#00e676',
    marginTop: 4,
    fontWeight: '800',
  },

  depthBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 106, 98, 0.88)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: rounded.lg,
  },
  depthBadgeAlert: {
    backgroundColor: 'rgba(186, 26, 26, 0.88)',
  },
  depthText: {
    ...typography.labelSm,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },

  progressBlock: { marginBottom: spacing.sm },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  progressLabel: { ...typography.labelMd, color: colors.textMuted },
  progressValue: { ...typography.headlineMd, color: colors.primaryContainer },
  progressTarget: { ...typography.bodyMd, color: colors.textMuted },
  progressBarBg: {
    height: 12,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: rounded.full,
  },
  progressBarChallenge: { backgroundColor: colors.primaryContainer },
  helperMsg: {
    backgroundColor: colors.surfaceContainer,
    padding: 12,
    borderRadius: rounded.md,
    alignItems: 'center',
  },
  helperText: {
    ...typography.labelSm,
    color: colors.primaryContainer,
    fontWeight: '600',
  },

  actionsRow: { flexDirection: 'column', gap: spacing.sm, paddingBottom: spacing.sm },
  snoozeBtn: {
    padding: spacing.md,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  snoozeBtnText: { ...typography.labelMd, color: colors.textMain },
  stopBtn: {
    padding: spacing.md,
    borderRadius: rounded.xl,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
  },
  stopBtnLocked: { backgroundColor: colors.surfaceContainerHigh },
  stopBtnText: { ...typography.labelMd, color: colors.error },
});

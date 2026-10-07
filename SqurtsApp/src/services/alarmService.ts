/**
 * alarmService.ts
 * Handles scheduling and cancelling alarm notifications using notifee.
 *
 * Two alarm modes:
 *  • 'normal'    → Notification has Snooze + Stop actions.
 *  • 'challenge' → Notification has only "Start Squats" action.
 *                  Opening the notification auto-navigates to ActiveAlarmScreen.
 */

import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Alarm } from '../types/types';

// ─── Constants ────────────────────────────────────────────────────────────────
export const CHANNEL_ID = 'squrts_alarm';
const CHANNEL_NAME = 'Squrts Alarm';
export const SNOOZE_MINUTES = 5;

// Notification action IDs
export const ACTION = {
  STOP: 'stop',
  SNOOZE: 'snooze',
  START_SQUATS: 'start_squats',
} as const;

// ─── Setup: call once at app start ───────────────────────────────────────────
export async function setupNotifee(): Promise<void> {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
    console.warn('[alarmService] Notification permission denied');
  }

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
    vibrationPattern: [300, 500, 300, 500],
    sound: 'default',
  });
}

// ─── Schedule an alarm ────────────────────────────────────────────────────────
export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  const isChallenge = alarm.alarmMode === 'challenge';
  const shouldWake = isChallenge && alarm.wakeScreen;

  const createTriggerForDate = async (triggerDate: Date, idSuffix: string, repeat: boolean) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      alarmManager: { allowWhileIdle: true },
      ...(repeat ? { repeatFrequency: RepeatFrequency.WEEKLY } : {}),
    };

    return await notifee.createTriggerNotification(
      {
        id: `${alarm.id}${idSuffix}`,
        title: isChallenge ? '💪 Squrts Challenge!' : '🔔 Squrts Alarm',
        body: isChallenge
          ? `Wake up! Complete ${alarm.targetReps} squats to silence this alarm.`
          : `Your alarm is ringing. Tap to open or snooze.`,
        data: {
          alarmId: alarm.id,
          alarmMode: alarm.alarmMode,
          wakeScreen: String(alarm.wakeScreen),
          targetReps: String(alarm.targetReps),
        },
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          ...(shouldWake ? { fullScreenAction: { id: 'default' } } : {}),
          pressAction: { id: 'default', launchActivity: 'default' },
          ongoing: isChallenge,
          asForegroundService: false,
          actions: isChallenge
            ? [
                {
                  title: '🏋️ Start Squats',
                  pressAction: { id: ACTION.START_SQUATS, launchActivity: 'default' },
                },
              ]
            : [
                {
                  title: '⏰ Snooze 5 min',
                  pressAction: { id: ACTION.SNOOZE },
                },
                {
                  title: '✕ Stop',
                  pressAction: { id: ACTION.STOP },
                },
              ],
          vibrationPattern: [300, 500, 300, 500],
        },
      },
      trigger,
    );
  };

  if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
    const triggerDate = buildTriggerDate(alarm.time, alarm.ampm);
    await createTriggerForDate(triggerDate, '', false);
    console.log(`[alarmService] Scheduled ${alarm.alarmMode} alarm "${alarm.id}" → ${triggerDate.toLocaleString()}`);
  } else {
    for (const day of alarm.repeatDays) {
      const triggerDate = buildNextDayTrigger(alarm.time, alarm.ampm, day);
      await createTriggerForDate(triggerDate, `-${day}`, true);
      console.log(`[alarmService] Scheduled repeating ${alarm.alarmMode} alarm "${alarm.id}-${day}" → ${triggerDate.toLocaleString()}`);
    }
  }

  return alarm.id;
}

// ─── Snooze a normal alarm ────────────────────────────────────────────────────
export async function snoozeAlarm(notificationId: string, alarmId: string, targetReps: string): Promise<void> {
  await notifee.cancelNotification(notificationId);
  const snoozeDate = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: snoozeDate.getTime(),
    alarmManager: { allowWhileIdle: true },
  };
  await notifee.createTriggerNotification(
    {
      id: `${alarmId}_snooze_${Date.now()}`,
      title: '🔔 Squrts Alarm (Snoozed)',
      body: `Snoozed for ${SNOOZE_MINUTES} minutes.`,
      data: { alarmId, alarmMode: 'normal', targetReps },
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default', launchActivity: 'default' },
        actions: [
          { title: '⏰ Snooze again', pressAction: { id: ACTION.SNOOZE } },
          { title: '✕ Stop', pressAction: { id: ACTION.STOP } },
        ],
      },
    },
    trigger,
  );
  console.log(`[alarmService] Snoozed alarm "${alarmId}" for ${SNOOZE_MINUTES} min`);
}

// ─── Cancel a specific alarm ──────────────────────────────────────────────────
export async function cancelAlarm(alarmId: string): Promise<void> {
  await notifee.cancelTriggerNotification(alarmId);
  await notifee.cancelNotification(alarmId);
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (const day of days) {
    await notifee.cancelTriggerNotification(`${alarmId}-${day}`);
    await notifee.cancelNotification(`${alarmId}-${day}`);
  }
  console.log(`[alarmService] Cancelled alarm "${alarmId}" (and any day variants)`);
}

// ─── Cancel ALL alarms ────────────────────────────────────────────────────────
export async function cancelAllAlarms(): Promise<void> {
  await notifee.cancelAllNotifications();
  console.log('[alarmService] Cancelled all alarms');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildTriggerDate(time: string, ampm: string): Date {
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hour, minute, 0, 0);

  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return trigger;
}

function buildNextDayTrigger(time: string, ampm: string, targetDayName: string): Date {
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const trigger = new Date();
  trigger.setHours(hour, minute, 0, 0);

  const jsDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const targetDayIdx = jsDays.indexOf(targetDayName);
  const now = new Date();
  
  for (let i = 0; i <= 7; i++) {
    const candidate = new Date(trigger.getTime());
    candidate.setDate(candidate.getDate() + i);
    
    if (candidate.getDay() === targetDayIdx) {
      if (i === 0 && candidate.getTime() <= now.getTime()) {
         candidate.setDate(candidate.getDate() + 7);
      }
      return candidate;
    }
  }
  return trigger;
}

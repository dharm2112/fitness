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
  const triggerDate = buildTriggerDate(alarm.time, alarm.ampm);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    alarmManager: { allowWhileIdle: true },
  };

  const isChallenge = alarm.alarmMode === 'challenge';

  const shouldWake = isChallenge && alarm.wakeScreen;

  const notificationId = await notifee.createTriggerNotification(
    {
      id: alarm.id,
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
        // fullScreenAction wakes the locked screen — only when user opted in
        ...(shouldWake ? { fullScreenAction: { id: 'default' } } : {}),
        pressAction: { id: 'default', launchActivity: 'default' },
        // Challenge alarm is ongoing (can't be swiped away) until squats are done
        ongoing: isChallenge,
        // Challenge with wake → can't be dismissed from notification shade
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

  console.log(
    `[alarmService] Scheduled ${alarm.alarmMode} alarm "${alarm.id}" → ${triggerDate.toLocaleString()}`,
  );
  return notificationId;
}

// ─── Snooze a normal alarm ────────────────────────────────────────────────────
export async function snoozeAlarm(alarm: Alarm): Promise<void> {
  await notifee.cancelNotification(alarm.id);
  const snoozeDate = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: snoozeDate.getTime(),
    alarmManager: { allowWhileIdle: true },
  };
  await notifee.createTriggerNotification(
    {
      id: `${alarm.id}_snooze`,
      title: '🔔 Squrts Alarm (Snoozed)',
      body: `Snoozed for ${SNOOZE_MINUTES} minutes.`,
      data: { alarmId: alarm.id, alarmMode: 'normal', targetReps: String(alarm.targetReps) },
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
  console.log(`[alarmService] Snoozed alarm "${alarm.id}" for ${SNOOZE_MINUTES} min`);
}

// ─── Cancel a specific alarm ──────────────────────────────────────────────────
export async function cancelAlarm(alarmId: string): Promise<void> {
  await notifee.cancelTriggerNotification(alarmId);
  await notifee.cancelNotification(alarmId);            // also dismiss if already showing
  await notifee.cancelNotification(`${alarmId}_snooze`); // cancel any snooze too
  console.log(`[alarmService] Cancelled alarm "${alarmId}"`);
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

  // If time already passed today → schedule for tomorrow
  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return trigger;
}

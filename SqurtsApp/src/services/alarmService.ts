/**
 * alarmService.ts
 * Handles scheduling and cancelling alarm notifications using notifee.
 * The alarm fires at the exact time set by the user, and the notification
 * stays active until the user completes their squat challenge.
 */

import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Alarm } from '../types/types';

// ─── Channel ID (created once) ────────────────────────────────────────────────
const CHANNEL_ID = 'squrts_alarm';
const CHANNEL_NAME = 'Squrts Alarm';

// ─── Setup: call this once at app start (e.g. in App.tsx) ────────────────────
export async function setupNotifee(): Promise<void> {
  // Request permission (Android 13+)
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
    console.warn('[alarmService] Notification permission denied');
  }

  // Create the notification channel (Android only, safe to call repeatedly)
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

// ─── Schedule an alarm notification ──────────────────────────────────────────
export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  // Build the trigger timestamp from alarm.time + alarm.ampm
  const triggerDate = buildTriggerDate(alarm.time, alarm.ampm);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    alarmManager: {
      allowWhileIdle: true, // fires even in Doze mode
    },
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: '⚡ Squrts Alarm!',
      body: `Time to do ${alarm.targetReps} squats to dismiss this alarm!`,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: 'default', // opens the app to ActiveAlarmScreen
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: '🏋️ Start Squats',
            pressAction: { id: 'start', launchActivity: 'default' },
          },
        ],
        ongoing: false,
        vibrationPattern: [300, 500, 300, 500],
      },
    },
    trigger,
  );

  console.log(`[alarmService] Scheduled alarm "${alarm.id}" for ${triggerDate.toLocaleString()}`);
  return notificationId;
}

// ─── Cancel a specific alarm ──────────────────────────────────────────────────
export async function cancelAlarm(alarmId: string): Promise<void> {
  await notifee.cancelTriggerNotification(alarmId);
  console.log(`[alarmService] Cancelled alarm "${alarmId}"`);
}

// ─── Cancel ALL alarms ────────────────────────────────────────────────────────
export async function cancelAllAlarms(): Promise<void> {
  await notifee.cancelAllNotifications();
  console.log('[alarmService] Cancelled all alarms');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildTriggerDate(time: string, ampm: string): Date {
  // time is in "HH:MM" format, ampm is "AM" or "PM"
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hour, minute, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return trigger;
}

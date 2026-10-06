// Squat state from the Python CV engine
export type SquatState = 'STANDING' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING';

export interface SquatResult {
  exercise: string;
  state: SquatState;
  reps: number;
  valid_rep: boolean;
  confidence: number | null;
  completed: boolean;
}

// Alarm data model
export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * 'normal'    — Standard alarm: user can Snooze or Stop without any exercise.
 * 'challenge' — Squat challenge: alarm only stops when the squat target is met.
 *               App auto-opens ActiveAlarmScreen when the alarm fires.
 */
export type AlarmMode = 'normal' | 'challenge';

export interface Alarm {
  id: string;
  time: string;       // "07:00"
  ampm: 'AM' | 'PM';
  repeatDays: DayKey[];
  exercise: 'squat';
  targetReps: number;
  label: string;
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  alarmMode: AlarmMode; // 'normal' | 'challenge'
  /**
   * Challenge mode only.
   * true  → phone screen turns on + challenge opens even when phone is locked.
   * false → notification only; user must manually open app.
   */
  wakeScreen: boolean;
}

// Challenge completion record
export interface CompletedChallenge {
  id: string;
  date: string;       // ISO date string
  reps: number;
  alarmTime: string;
}

// User Profile & Settings
export interface UserProfile {
  name: string;
  email: string;
  backendIp: string; // The IP address for the Python AI Backend
}

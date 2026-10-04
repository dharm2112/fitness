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
}

// Challenge completion record
export interface CompletedChallenge {
  id: string;
  date: string;       // ISO date string
  reps: number;
  alarmTime: string;
}

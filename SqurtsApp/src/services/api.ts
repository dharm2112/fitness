import { SquatResult } from '../types/types';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// For Android Emulator use: http://10.0.2.2:8080
// For physical device use your PC's local IP: http://192.168.x.x:8080
export const API_BASE_URL = 'http://10.0.2.2:8080';

const DEFAULT_TIMEOUT = 4000; // ms

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── SQUAT STATE ──────────────────────────────────────────────────────────────
export async function getSquatResult(): Promise<SquatResult | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/squat/state`);
    if (!res.ok) return null;
    const data = await res.json();
    // Empty object means no state yet
    if (!data || !data.exercise) return null;
    return data as SquatResult;
  } catch {
    return null;
  }
}

// ─── ALARM SETTINGS ───────────────────────────────────────────────────────────
export async function pushAlarmSettings(targetReps: number): Promise<void> {
  try {
    await fetchWithTimeout(`${API_BASE_URL}/alarm/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_reps: targetReps,
        active_tune: 'alarm.wav',
        is_active: true,
      }),
    });
  } catch {
    // Non-critical – Python engine may not be running
  }
}

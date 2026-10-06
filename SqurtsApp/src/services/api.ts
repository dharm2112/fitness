import { SquatResult } from '../types/types';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
export const buildApiUrl = (ip: string) => `http://${ip}:8080`;
export const buildWsUrl = (ip: string) => `ws://${ip}:8080`;

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
export async function checkBackendHealth(backendIp: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${buildApiUrl(backendIp)}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── SQUAT STATE ──────────────────────────────────────────────────────────────
// Squat state is now received in real-time via WebSocket at WS_BASE_URL + "/squat/ws"

// ─── ALARM SETTINGS ───────────────────────────────────────────────────────────
export async function pushAlarmSettings(backendIp: string, targetReps: number): Promise<void> {
  try {
    await fetchWithTimeout(`${buildApiUrl(backendIp)}/alarm/settings`, {
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

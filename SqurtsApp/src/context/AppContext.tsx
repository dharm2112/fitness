import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, CompletedChallenge } from '../types/types';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const ALARMS_KEY = '@squrts_alarms';
const CHALLENGES_KEY = '@squrts_challenges';

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AppContextValue {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  completedChallenges: CompletedChallenge[];
  addCompletedChallenge: (c: CompletedChallenge) => void;
  isLoaded: boolean; // true once storage has been read
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [alarmsRaw, challengesRaw] = await Promise.all([
          AsyncStorage.getItem(ALARMS_KEY),
          AsyncStorage.getItem(CHALLENGES_KEY),
        ]);
        if (alarmsRaw) setAlarms(JSON.parse(alarmsRaw));
        if (challengesRaw) setCompletedChallenges(JSON.parse(challengesRaw));
      } catch (e) {
        console.warn('[AppContext] Failed to load from storage:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // Persist alarms whenever they change (after first load)
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms)).catch(e =>
      console.warn('[AppContext] Failed to persist alarms:', e),
    );
  }, [alarms, isLoaded]);

  // Persist challenges whenever they change (after first load)
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(completedChallenges)).catch(e =>
      console.warn('[AppContext] Failed to persist challenges:', e),
    );
  }, [completedChallenges, isLoaded]);

  // ─── Alarm Actions ──────────────────────────────────────────────────────────
  const addAlarm = (alarm: Alarm) =>
    setAlarms(prev => [...prev, alarm]);

  const updateAlarm = (alarm: Alarm) =>
    setAlarms(prev => prev.map(a => (a.id === alarm.id ? alarm : a)));

  const deleteAlarm = (id: string) =>
    setAlarms(prev => prev.filter(a => a.id !== id));

  // ─── Challenge Actions ──────────────────────────────────────────────────────
  const addCompletedChallenge = (c: CompletedChallenge) =>
    setCompletedChallenges(prev => [...prev, c]);

  return (
    <AppContext.Provider
      value={{
        alarms,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        completedChallenges,
        addCompletedChallenge,
        isLoaded,
      }}>
      {children}
    </AppContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
};

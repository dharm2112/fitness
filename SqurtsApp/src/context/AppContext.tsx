import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, CompletedChallenge, UserProfile } from '../types/types';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const ALARMS_KEY = '@squrts_alarms';
const CHALLENGES_KEY = '@squrts_challenges';
const PROFILE_KEY = '@squrts_profile';

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AppContextValue {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  completedChallenges: CompletedChallenge[];
  addCompletedChallenge: (c: CompletedChallenge) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  isLoaded: boolean; // true once storage has been read
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Squats Hero',
    email: 'hero@squrts.app',
    backendIp: '10.0.2.2',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [alarmsRaw, challengesRaw, profileRaw] = await Promise.all([
          AsyncStorage.getItem(ALARMS_KEY),
          AsyncStorage.getItem(CHALLENGES_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);
        if (alarmsRaw) {
          // Migration: old alarms may not have alarmMode/wakeScreen — apply safe defaults
          const parsed: Alarm[] = JSON.parse(alarmsRaw);
          setAlarms(parsed.map(a => ({ alarmMode: 'challenge', wakeScreen: true, ...a })));
        }
        if (challengesRaw) setCompletedChallenges(JSON.parse(challengesRaw));
        if (profileRaw) setUserProfile(JSON.parse(profileRaw));
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

  // Persist profile whenever it changes (after first load)
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile)).catch(e =>
      console.warn('[AppContext] Failed to persist profile:', e),
    );
  }, [userProfile, isLoaded]);

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
        userProfile,
        updateUserProfile: setUserProfile,
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

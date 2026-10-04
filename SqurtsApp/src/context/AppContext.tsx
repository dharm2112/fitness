import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alarm, CompletedChallenge } from '../types/types';

interface AppContextValue {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  completedChallenges: CompletedChallenge[];
  addCompletedChallenge: (c: CompletedChallenge) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([]);

  const addAlarm = (alarm: Alarm) =>
    setAlarms(prev => [...prev, alarm]);

  const updateAlarm = (alarm: Alarm) =>
    setAlarms(prev => prev.map(a => (a.id === alarm.id ? alarm : a)));

  const deleteAlarm = (id: string) =>
    setAlarms(prev => prev.filter(a => a.id !== id));

  const addCompletedChallenge = (c: CompletedChallenge) =>
    setCompletedChallenges(prev => [...prev, c]);

  return (
    <AppContext.Provider value={{ alarms, addAlarm, updateAlarm, deleteAlarm, completedChallenges, addCompletedChallenge }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
};

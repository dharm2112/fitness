import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, BackHandler } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';

import { AppProvider, useAppContext } from './src/context/AppContext';
import { LandingScreen } from './src/screens/LandingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AlarmsScreen } from './src/screens/AlarmsScreen';
import { CreateAlarmScreen } from './src/screens/CreateAlarmScreen';
import { ActiveAlarmScreen } from './src/screens/ActiveAlarmScreen';
import { ChallengeCompleteScreen } from './src/screens/ChallengeCompleteScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomNavigation, TabName } from './src/components/BottomNavigation';
import { colors } from './src/theme/theme';
import { Alarm, CompletedChallenge } from './src/types/types';
import { setupNotifee, cancelAlarm, snoozeAlarm, ACTION } from './src/services/alarmService';

// ─── Screen names ─────────────────────────────────────────────────────────────
type ScreenName =
  | 'Landing'
  | 'Main'
  | 'CreateAlarm'
  | 'EditAlarm'
  | 'ActiveAlarm'
  | 'ChallengeComplete';

// ─── Background event handler (registered at module level) ───────────────────
// Handles notification action buttons when app is in background/killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (!notification || !pressAction) return;

  const alarmId = notification.data?.alarmId as string | undefined;
  if (!alarmId) return;

  if (pressAction.id === ACTION.STOP) {
    if (notification.id) await notifee.cancelNotification(notification.id);
  }
  if (pressAction.id === ACTION.SNOOZE) {
    const targetReps = notification.data?.targetReps as string || '10';
    if (notification.id) await snoozeAlarm(notification.id, alarmId, targetReps);
  }

// ─── Inner app (needs context) ────────────────────────────────────────────────
function InnerApp() {
  const { alarms, addCompletedChallenge } = useAppContext();

  const [screen, setScreen] = useState<ScreenName>('Landing');
  const [tab, setTab] = useState<TabName>('Home');

  // Contextual data passed between screens
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [lastChallenge, setLastChallenge] = useState<CompletedChallenge | null>(null);

  // ── Initialise notifee + request permissions once ─────────────────────────
  useEffect(() => {
    setupNotifee();
  }, []);

  // ── Foreground event handler ──────────────────────────────────────────────
  // Fires when the app is OPEN and a notification is pressed / action tapped
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      const { notification, pressAction } = detail;
      if (!notification) return;

      const alarmId = notification.data?.alarmId as string | undefined;
      const alarmMode = notification.data?.alarmMode as string | undefined;

      if (type === EventType.PRESS || pressAction?.id === ACTION.START_SQUATS) {
        // Challenge alarm tapped → navigate to squat counter
        if (alarmMode === 'challenge' && alarmId) {
          const alarm = alarms.find(a => a.id === alarmId);
          if (alarm) {
            goActiveAlarm(alarm);
          }
        }
      }

      if (pressAction?.id === ACTION.STOP && notification.id) {
        notifee.cancelNotification(notification.id);
      }
      
      if (pressAction?.id === ACTION.SNOOZE && alarmId && notification.id) {
        const targetReps = notification.data?.targetReps as string || '10';
        snoozeAlarm(notification.id, alarmId, targetReps);
      }
    });
    return unsubscribe;
  }, [alarms]);

  // ── Check if app was launched from a notification (killed state) ──────────
  useEffect(() => {
    notifee.getInitialNotification().then(initial => {
      if (!initial) return;
      const alarmId = initial.notification.data?.alarmId as string | undefined;
      const alarmMode = initial.notification.data?.alarmMode as string | undefined;
      if (alarmMode === 'challenge' && alarmId) {
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          // Skip landing, go straight to challenge
          setScreen('ActiveAlarm');
          setActiveAlarm(alarm);
        }
      }
    });
  }, [alarms]);

  // ── Back button ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onBack = () => {
      if (screen === 'CreateAlarm' || screen === 'EditAlarm' || screen === 'ChallengeComplete') {
        setScreen('Main');
        return true;
      }
      if (screen === 'Main' && tab !== 'Home') {
        setTab('Home');
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen, tab]);

  // ── Navigation helpers ───────────────────────────────────────────────────
  const goCreateAlarm = () => {
    setEditingAlarm(null);
    setScreen('CreateAlarm');
  };

  const goEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setScreen('EditAlarm');
  };

  const goActiveAlarm = (alarm: Alarm) => {
    setActiveAlarm(alarm);
    setScreen('ActiveAlarm');
  };

  const handleAlarmComplete = async () => {
    if (!activeAlarm) return;

    // Note: Do NOT call cancelAlarm here if it's a repeating alarm, 
    // but we can dismiss all current notifications for safety.
    await notifee.cancelAllNotifications();

    const challenge: CompletedChallenge = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      reps: activeAlarm.targetReps,
      alarmTime: `${activeAlarm.time} ${activeAlarm.ampm}`,
    };
    addCompletedChallenge(challenge);
    setLastChallenge(challenge);
    setScreen('ChallengeComplete');
  };

  // ── Tab rendering ────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (tab) {
      case 'Home':
        return (
          <HomeScreen
            onCreateAlarm={goCreateAlarm}
            onAlarmTrigger={goActiveAlarm}
          />
        );
      case 'Alarms':
        return (
          <AlarmsScreen
            onCreateAlarm={goCreateAlarm}
            onEditAlarm={goEditAlarm}
            onAlarmTrigger={goActiveAlarm}
          />
        );
      case 'Progress':
        return <ProgressScreen />;
      case 'Profile':
        return <ProfileScreen />;
    }
  };

  // ── Screen rendering ─────────────────────────────────────────────────────
  switch (screen) {
    case 'Landing':
      return <LandingScreen onGetStarted={() => setScreen('Main')} />;

    case 'Main':
      return (
        <View style={{ flex: 1 }}>
          {renderTab()}
          <BottomNavigation currentTab={tab} onTabPress={setTab} />
        </View>
      );

    case 'CreateAlarm':
      return (
        <CreateAlarmScreen
          existingAlarm={null}
          onSave={() => { setScreen('Main'); setTab('Alarms'); }}
          onBack={() => setScreen('Main')}
        />
      );

    case 'EditAlarm':
      return (
        <CreateAlarmScreen
          existingAlarm={editingAlarm}
          onSave={() => setScreen('Main')}
          onBack={() => setScreen('Main')}
        />
      );

    case 'ActiveAlarm':
      return (
        <ActiveAlarmScreen
          alarm={activeAlarm!}
          onComplete={handleAlarmComplete}
        />
      );

    case 'ChallengeComplete':
      return (
        <ChallengeCompleteScreen
          completedChallenge={lastChallenge}
          onFinish={() => { setScreen('Main'); setTab('Progress'); }}
        />
      );
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <InnerApp />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
});

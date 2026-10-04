/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Minimal background handler to ensure alarms are acknowledged
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.DELIVERED) {
    console.log('Alarm delivered in background!');
  }
});

AppRegistry.registerComponent(appName, () => App);

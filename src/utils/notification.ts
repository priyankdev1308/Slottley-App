// // notifications.ts
// import { Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
// import { getApp } from '@react-native-firebase/app';
// import {
//   getMessaging,
//   requestPermission as requestMessagingPermission,
//   getToken,
//   onMessage,
//   setBackgroundMessageHandler,
//   onNotificationOpenedApp,
//   getInitialNotification,
//   getAPNSToken,
//   onTokenRefresh,
// } from '@react-native-firebase/messaging';
// import notifee, {
//   EventType,
//   AndroidStyle,
//   AndroidImportance,
// } from '@notifee/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const msg = getMessaging(getApp());

// /**
//  * ✅ Request permission
//  */
// export async function requestPermission() {
//   try {
//     if (Platform.OS === 'android') {
//       let permission = 'granted';
//       if (Platform.Version >= 33) {
//         permission = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//         );
//       }
//       if (permission === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Android: Notification permission granted.');
//         await getFCMToken();
//       } else {
//         Alert.alert(
//           'Permission Required',
//           'Please enable notifications in Settings.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Open Settings', onPress: () => Linking.openSettings() },
//           ],
//         );
//       }
//     } else {
//       const authStatus = await requestMessagingPermission(msg);
//       const enabled = authStatus === 1 || authStatus === 2;
//       if (enabled) {
//         await getFCMToken();
//       } else {
//         console.log('iOS: Notification permission denied.');
//       }
//     }
//   } catch (error) {
//     console.error('Permission error:', error);
//   }
// }

// export async function createNotificationChannel() {
//   if (Platform.OS === 'android') {
//     await notifee.createChannel({
//       id: 'custom_sound_channel',
//       name: 'Trading Alerts',
//       importance: AndroidImportance.HIGH,
//       sound: 'custom_sound',
//     });
//   }
// }
// /**
//  * ✅ Get FCM token (waits for APNs on iOS)
//  */
// export async function getFCMToken() {
//   try {
//     if (Platform.OS === 'ios') {
//       let apnsToken = await getAPNSToken(msg);
//       let retries = 0;

//       // Retry every 2 seconds if APNs token isn't ready
//       while (!apnsToken && retries < 5) {
//         console.log('Waiting for APNs token...');
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         apnsToken = await getAPNSToken(msg);
//         retries++;
//       }

//       if (!apnsToken) {
//         console.warn('APNs token not available, will retry later.');
//         return;
//       }
//     }

//     const fcmToken = await getToken(msg);

//     console.log("fcmToken",fcmToken)
//     if (fcmToken) {
//       await AsyncStorage.setItem('fcmToken', fcmToken);
//     } else {
//       console.log('No FCM token yet.');
//     }
//   } catch (error) {
//     console.error('Token error:', error);
//   }
// }

// /**
//  * ✅ Listen for token refresh
//  */
// export function setupFCMRefreshListener() {
//   onTokenRefresh(msg, async token => {
//     console.log('FCM Token refreshed:', token);
//     await AsyncStorage.setItem('fcmToken', token);
//   });
// }

// /**
//  * ✅ Display notification
//  */
// async function onDisplayNotification(remoteMessage) {
//   const { notification, messageId, data } = remoteMessage;

//   await notifee.requestPermission();

//   const notificationOptions: any = {
//     title: notification?.title,
//     body: notification?.body,
//     android: {
//       channelId: 'custom_sound_channel',
//       pressAction: { id: messageId || 'default' },
//       smallIcon: 'ic_stat_notification',
//       color: '#040333',
//     },
//     ios: {
//       sound: 'custom_sound.wav', 
//       interruptionLevel: 'timeSensitive',
//     },
//   };

//   if (data?.image_url) {
//     notificationOptions.android.style = {
//       type: AndroidStyle.BIGPICTURE,
//       picture: data.image_url,
//     };
//   }

//   await notifee.displayNotification(notificationOptions);
// }

// /**
//  * ✅ Notification listener (foreground, background, quit)
//  */
// export function notificationListener() {
//   // Foreground
//   const unsubscribeOnMessage = onMessage(msg, async remoteMessage => {
//     console.log("remoteMessage",remoteMessage)
//     await onDisplayNotification(remoteMessage);
//   });

//   // Background
//   setBackgroundMessageHandler(msg, async remoteMessage => {
//     await onDisplayNotification(remoteMessage);
//   });

//   // App opened from background
//   const unsubscribeOpenedApp = onNotificationOpenedApp(msg, remoteMessage => {
//     console.log('Notification opened:', remoteMessage);
//   });

//   // App opened from quit
//   getInitialNotification(msg).then(remoteMessage => {
//     if (remoteMessage) {
//       console.log('Initial notification:', remoteMessage);
//     }
//   });

//   // Foreground events
//   const unsubscribeNotifee = notifee.onForegroundEvent(({ type }) => {
//     if (type === EventType.DISMISSED) {
//       console.log('Notification dismissed.');
//     } else if (type === EventType.PRESS) {
//       console.log('Notification pressed.');
//     }
//   });

//   return () => {
//     unsubscribeOnMessage();
//     unsubscribeOpenedApp();
//     unsubscribeNotifee();
//   };
// }

// notifications.ts
import { Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import { getApp, getApps } from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission as requestMessagingPermission,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  getAPNSToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import notifee, {
  EventType,
  AndroidStyle,
  AndroidImportance,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let msg: ReturnType<typeof getMessaging> | null = null;

// Lazily resolves the messaging instance so importing this module never
// crashes when Firebase hasn't been configured/initialized yet.
const getMessagingInstance = () => {
  if (msg) return msg;
  try {
    if (getApps().length === 0) {
      console.warn(
        'Firebase app is not initialized; push notifications are disabled.',
      );
      return null;
    }
    msg = getMessaging(getApp());
    return msg;
  } catch (error) {
    console.warn('Failed to initialize Firebase messaging:', error);
    return null;
  }
};

// Attempt eager init at module load so the background handler below can
// register immediately if Firebase is already available; safe no-op otherwise.
getMessagingInstance();

export async function requestPermission() {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return;

  try {
    if (Platform.OS === 'android') {
      let permission = 'granted';
      if (Platform.Version >= 33) {
        permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Android: Notification permission granted.');
        await getFCMToken();
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      const authStatus = await requestMessagingPermission(messagingInstance);
      const enabled = authStatus === 1 || authStatus === 2;
      if (enabled) {
        await getFCMToken();
      } else {
        console.log('iOS: Notification permission denied.');
      }
    }
  } catch (error) {
    console.error('Permission error:', error);
  }
}

export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'custom_sound_channel',
      name: 'Trading Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'custom_sound', // Make sure this matches your file name (without extension)
    });
  }
}

export async function getFCMToken() {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return null;

  try {
    if (Platform.OS === 'ios') {
      let apnsToken = await getAPNSToken(messagingInstance);
      let retries = 0;

      while (!apnsToken && retries < 5) {
        console.log('Waiting for APNs token...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        apnsToken = await getAPNSToken(messagingInstance);
        retries++;
      }

      if (!apnsToken) {
        console.warn('APNs token not available, will retry later.');
        return null;
      }
    }

    const fcmToken = await getToken(messagingInstance);

    console.log('fcmToken', fcmToken);
    if (fcmToken) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      return fcmToken;
    }
    console.log('No FCM token yet.');
    return null;
  } catch (error) {
    console.error('Token error:', error);
    return null;
  }
}

export function setupFCMRefreshListener() {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return;

  onTokenRefresh(messagingInstance, async token => {
    console.log('FCM Token refreshed:', token);
    await AsyncStorage.setItem('fcmToken', token);
  });
}

/**
 * ✅ Display notification - handles both data-only and notification messages
 */
async function onDisplayNotification(remoteMessage) {
  const { notification, data } = remoteMessage;

  await notifee.requestPermission();

  // Extract title and body from either notification or data payload
  const title = notification?.title || data?.title || 'New Notification';
  const body = notification?.body || data?.body || '';

  const notificationOptions: any = {
    title,
    body,
    android: {
      channelId: 'custom_sound_channel',
      pressAction: { id: 'default' },
      smallIcon: 'ic_stat_notification',
      color: '#040333',
      sound: 'custom_sound', // Android sound file (no extension)
    },
    ios: {
      sound: 'custom_sound.wav', // iOS needs .wav extension
      interruptionLevel: 'timeSensitive',
    },
    data: data || {}, // Preserve data for tap handling
  };

  if (data?.image_url) {
    notificationOptions.android.style = {
      type: AndroidStyle.BIGPICTURE,
      picture: data.image_url,
    };
  }

  await notifee.displayNotification(notificationOptions);
}

/**
 * ✅ Background handler - MUST be registered OUTSIDE component
 */
if (msg) {
  setBackgroundMessageHandler(msg, async remoteMessage => {
    console.log('Background message received:', remoteMessage);
    await onDisplayNotification(remoteMessage);
  });
}

/**
 * ✅ Notification listener setup
 */
export function notificationListener() {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    return () => {};
  }

  // Foreground messages
  const unsubscribeOnMessage = onMessage(messagingInstance, async remoteMessage => {
    console.log('Foreground message:', remoteMessage);
    await onDisplayNotification(remoteMessage);
  });

  // App opened from background notification
  const unsubscribeOpenedApp = onNotificationOpenedApp(messagingInstance, remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
    // Handle navigation here
  });

  // App opened from killed state notification
  getInitialNotification(messagingInstance).then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification opened from killed state:', remoteMessage);
      // Handle navigation here
    }
  });

  // Notifee foreground events
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.DISMISSED) {
      console.log('Notification dismissed');
    } else if (type === EventType.PRESS) {
      console.log('Notification pressed:', detail.notification);
      // Handle navigation here
    }
  });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOpenedApp();
    unsubscribeNotifee();
  };
}
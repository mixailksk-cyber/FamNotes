import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';

export const configureNotifications = async () => {
  // Запрос разрешения на Android
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Разрешение на уведомления',
          message: 'FamNotes нужно отправлять уведомления о напоминаниях',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Запретить',
          buttonPositive: 'Разрешить',
        }
      );
      console.log('Notification permission:', granted);
    } catch (err) {
      console.warn(err);
    }
  }
  
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      if (notification.userInteraction) {
        // Пользователь нажал на уведомление
        if (notification.userInfo && notification.userInfo.noteId) {
          // TODO: открыть заметку
        }
      }
    },
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });
};

export const scheduleReminder = (noteId, title, content, date) => {
  const notificationDate = new Date(date);
  const now = new Date();
  
  // Проверяем, что дата в будущем
  if (notificationDate <= now) {
    console.log('Cannot schedule reminder in the past');
    return;
  }
  
  console.log('Scheduling reminder for:', notificationDate);
  
  PushNotification.localNotificationSchedule({
    channelId: 'famnotes_channel',
    title: title || 'Напоминание',
    message: content || 'У вас есть заметка, требующая внимания',
    date: notificationDate,
    allowWhileIdle: true,
    userInfo: { noteId: noteId },
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
    visibility: 'public',
    // Для Android 12+ нужен exact alarm
    exact: true,
  });
};

export const cancelReminder = (noteId) => {
  PushNotification.cancelLocalNotifications({ noteId: noteId });
};

export const cancelAllReminders = () => {
  PushNotification.cancelAllLocalNotifications();
};

import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export const configureNotifications = async () => {
  // Запрос разрешения на Android 13+
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) { // Android 13 (API 33) и выше
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
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Notification permission granted');
        } else {
          console.log('❌ Notification permission denied');
          Alert.alert(
            'Уведомления отключены',
            'Для получения напоминаний включите уведомления в настройках приложения',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.warn('Permission request error:', err);
      }
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
  
  // Создаем канал уведомлений (для Android 8+)
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'famnotes_channel',
        channelName: 'FamNotes Reminders',
        channelDescription: 'Notifications for note reminders',
        importance: 5, // HIGH
        vibrate: true,
        playSound: true,
        soundName: 'default',
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }
};

export const scheduleReminder = (noteId, title, content, date) => {
  const notificationDate = new Date(date);
  const now = new Date();
  
  // Проверяем, что дата в будущем
  if (notificationDate <= now) {
    console.log('Cannot schedule reminder in the past');
    return false;
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
    exact: true,
  });
  
  return true;
};

export const cancelReminder = (noteId) => {
  PushNotification.cancelLocalNotifications({ noteId: noteId });
};

export const cancelAllReminders = () => {
  PushNotification.cancelAllLocalNotifications();
};

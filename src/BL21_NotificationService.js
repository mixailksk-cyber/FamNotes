import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export const configureNotifications = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
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
        console.warn('Permission request error:', err);
      }
    }
  }
  
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
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
  
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'famnotes_channel',
        channelName: 'FamNotes Reminders',
        channelDescription: 'Notifications for note reminders',
        importance: 5,
        vibrate: true,
        playSound: true,
        soundName: 'default',
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }
};

const getNotificationTexts = (title, content) => {
  let notificationTitle = 'Напоминание';
  let notificationMessage = '';
  
  if (title && title.trim()) {
    if (content && content.trim()) {
      notificationTitle = title.trim();
      notificationMessage = content.trim();
    } else {
      notificationTitle = 'Напоминание';
      notificationMessage = title.trim();
    }
  } else if (content && content.trim()) {
    notificationTitle = 'Напоминание';
    notificationMessage = content.trim();
  } else {
    notificationTitle = 'Напоминание';
    notificationMessage = 'У вас есть заметка, требующая внимания';
  }
  
  return { notificationTitle, notificationMessage };
};

const sendNotification = (noteId, title, content) => {
  const { notificationTitle, notificationMessage } = getNotificationTexts(title, content);
  
  PushNotification.localNotification({
    channelId: 'famnotes_channel',
    title: notificationTitle,
    message: notificationMessage,
    allowWhileIdle: true,
    userInfo: { noteId: noteId },
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
    visibility: 'public',
    autoCancel: false,
  });
};

// Планирование одного уведомления (без повторения)
export const scheduleReminder = (noteId, title, content, date, useCalendar = false) => {
  const notificationDate = new Date(date);
  const now = new Date();
  
  if (notificationDate <= now) {
    console.log('Cannot schedule reminder in the past');
    return false;
  }
  
  console.log('Scheduling reminder for:', notificationDate);
  
  // Отменяем существующее напоминание
  cancelReminder(noteId);
  
  // Планируем одно уведомление
  PushNotification.localNotificationSchedule({
    channelId: 'famnotes_channel',
    title: getNotificationTexts(title, content).notificationTitle,
    message: getNotificationTexts(title, content).notificationMessage,
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
    autoCancel: false,
  });
  
  return true;
};

// Отмена напоминания
export const cancelReminder = (noteId) => {
  PushNotification.cancelLocalNotifications({ noteId: noteId });
  console.log('❌ Cancelled reminders for note:', noteId);
};

// Отмена всех напоминаний
export const cancelAllReminders = () => {
  PushNotification.cancelAllLocalNotifications();
  console.log('❌ Cancelled all reminders');
};

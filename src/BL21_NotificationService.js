import PushNotification from 'react-native-push-notification';

export const configureNotifications = () => {
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
};

export const scheduleReminder = (noteId, title, content, date) => {
  PushNotification.localNotificationSchedule({
    channelId: 'famnotes_channel',
    title: title || 'Напоминание',
    message: content || 'У вас есть заметка, требующая внимания',
    date: new Date(date),
    allowWhileIdle: true,
    userInfo: { noteId: noteId },
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
    visibility: 'public',
  });
};

export const cancelReminder = (noteId) => {
  PushNotification.cancelLocalNotifications({ noteId: noteId });
};

export const cancelAllReminders = () => {
  PushNotification.cancelAllLocalNotifications();
};

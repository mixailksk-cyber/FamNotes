import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { addEventToCalendar, removeEventFromCalendar } from './CalendarBridge';

// Хранилище ID событий календаря
const calendarEventIds = {};

export const configureNotifications = async () => {
  // Запрос разрешения на уведомления для Android 13+
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
      // При нажатии на уведомление открываем приложение
      // Уведомление остается в шторке (autoCancel: false)
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
  
  // Создаем канал уведомлений
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

// Отправка одного уведомления
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
    autoCancel: false, // Уведомление не пропадает при нажатии
  });
};

// Планирование повторяющихся уведомлений через нативный будильник
export const scheduleReminder = async (noteId, title, content, date, useCalendar = false, onCalendarEventSaved = null) => {
  const notificationDate = new Date(date);
  const now = new Date();
  
  if (notificationDate <= now) {
    console.log('Cannot schedule reminder in the past');
    return false;
  }
  
  console.log('Scheduling reminder for:', notificationDate);
  
  // Отменяем существующие напоминания
  cancelReminder(noteId);
  
  // Добавляем в календарь если включено
  if (useCalendar && Platform.OS === 'android') {
    const eventId = await addEventToCalendar(title, content, date);
    if (eventId) {
      calendarEventIds[noteId] = eventId;
      if (onCalendarEventSaved) {
        onCalendarEventSaved(noteId, eventId);
      }
      console.log('✅ Added to calendar, eventId:', eventId);
    }
  }
  
  // Планируем первое уведомление через нативный будильник
  PushNotification.localNotificationSchedule({
    channelId: 'famnotes_channel',
    title: getNotificationTexts(title, content).notificationTitle,
    message: getNotificationTexts(title, content).notificationMessage,
    date: notificationDate,
    allowWhileIdle: true,
    userInfo: { noteId: noteId, isRepeating: true },
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
    visibility: 'public',
    autoCancel: false,
    // Повторять каждые 10 минут после первого
    repeatType: 'minute',
    repeatTime: 10,
  });
  
  console.log('✅ Scheduled notification for:', notificationDate);
  return true;
};

// Отмена напоминания
export const cancelReminder = (noteId) => {
  // Отменяем все запланированные уведомления для этой заметки
  PushNotification.cancelLocalNotifications({ noteId: noteId });
  
  // Удаляем из календаря
  if (calendarEventIds[noteId]) {
    removeEventFromCalendar(calendarEventIds[noteId]);
    delete calendarEventIds[noteId];
  }
  
  console.log('❌ Cancelled reminders for note:', noteId);
};

// Отмена всех напоминаний
export const cancelAllReminders = () => {
  PushNotification.cancelAllLocalNotifications();
  Object.keys(calendarEventIds).forEach(noteId => {
    removeEventFromCalendar(calendarEventIds[noteId]);
    delete calendarEventIds[noteId];
  });
  console.log('❌ Cancelled all reminders');
};

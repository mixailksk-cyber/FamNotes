import { addEventToCalendar, removeEventFromCalendar } from './CalendarBridge';

// Сохранение calendarEventId в заметку
let calendarEventIds = new Map(); // временное хранилище

export const scheduleReminder = async (noteId, title, content, date, useCalendar = false, saveCalendarEventId) => {
  const notificationDate = new Date(date);
  const now = new Date();
  
  if (notificationDate <= now) {
    console.log('Cannot schedule reminder in the past');
    return false;
  }
  
  console.log('Scheduling reminder for:', notificationDate);
  
  cancelReminder(noteId);
  
  // Добавляем в календарь если включено
  if (useCalendar && Platform.OS === 'android') {
    const calendarEventId = await addEventToCalendar(title, content, date);
    if (calendarEventId && saveCalendarEventId) {
      saveCalendarEventId(noteId, calendarEventId);
      calendarEventIds.set(noteId, calendarEventId);
    }
  }
  
  const delay = notificationDate.getTime() - now.getTime();
  
  activeIntervals[noteId] = setTimeout(() => {
    sendNotification(noteId, title, content);
    
    activeIntervals[noteId] = setInterval(() => {
      sendNotification(noteId, title, content);
    }, 10 * 60 * 1000);
  }, delay);
  
  return true;
};

export const cancelReminder = (noteId) => {
  if (activeIntervals[noteId]) {
    if (typeof activeIntervals[noteId] === 'number') {
      clearTimeout(activeIntervals[noteId]);
    } else {
      clearInterval(activeIntervals[noteId]);
    }
    delete activeIntervals[noteId];
  }
  
  PushNotification.cancelLocalNotifications({ noteId: noteId });
  
  // Удаляем из календаря
  const calendarEventId = calendarEventIds.get(noteId);
  if (calendarEventId) {
    removeEventFromCalendar(calendarEventId);
    calendarEventIds.delete(noteId);
  }
};

import { NativeModules, Platform, PermissionsAndroid, Alert } from 'react-native';

const { CalendarModule } = NativeModules;

export const isCalendarAvailable = () => {
  return Platform.OS === 'android' && CalendarModule !== null;
};

export const checkCalendarPermission = async () => {
  if (Platform.OS !== 'android') return false;
  if (!CalendarModule) return false;
  
  try {
    const hasPermission = await CalendarModule.checkCalendarPermission();
    return hasPermission === true;
  } catch (error) {
    console.error('Error checking calendar permission:', error);
    return false;
  }
};

export const requestCalendarPermission = async () => {
  if (Platform.OS !== 'android') return false;
  
  try {
    if (Platform.Version >= 23) {
      // Сначала запрашиваем READ_CALENDAR
      const readGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
        {
          title: 'Доступ к календарю',
          message: 'FamNotes нужно добавить напоминания в календарь',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Запретить',
          buttonPositive: 'Разрешить',
        }
      );
      
      if (readGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Доступ к календарю', 'Для добавления напоминаний в календарь нужно разрешение');
        return false;
      }
      
      // Затем запрашиваем WRITE_CALENDAR
      const writeGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
        {
          title: 'Доступ к календарю',
          message: 'FamNotes нужно добавлять напоминания в календарь',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Запретить',
          buttonPositive: 'Разрешить',
        }
      );
      
      if (writeGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Доступ к календарю', 'Для добавления напоминаний в календарь нужно разрешение на запись');
        return false;
      }
      
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error requesting calendar permission:', error);
    return false;
  }
};

export const addEventToCalendar = async (title, description, date) => {
  if (Platform.OS !== 'android' || !CalendarModule) {
    console.log('Calendar module not available');
    return null;
  }
  
  try {
    // Проверяем разрешение перед добавлением
    const hasPermission = await checkCalendarPermission();
    if (!hasPermission) {
      console.log('No calendar permission');
      return null;
    }
    
    const startTime = new Date(date).getTime();
    const endTime = startTime + 60 * 60 * 1000; // +1 час
    
    console.log('Adding to calendar:', { title, startTime, endTime });
    
    const result = await CalendarModule.addEvent(title || 'Напоминание', description || '', startTime, endTime);
    console.log('Calendar add result:', result);
    return result.eventId;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    return null;
  }
};

export const removeEventFromCalendar = async (eventId) => {
  if (Platform.OS !== 'android' || !CalendarModule || !eventId) {
    return false;
  }
  
  try {
    await CalendarModule.removeEvent(eventId);
    console.log('Removed from calendar:', eventId);
    return true;
  } catch (error) {
    console.error('Error removing event from calendar:', error);
    return false;
  }
};

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Alert, ScrollView } from 'react-native';
import { Picker } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { width, getBrandColor } from './BL02_Constants';

const NoteActionDialog = ({ 
  visible, 
  onClose, 
  folders, 
  onMove, 
  onDelete, 
  onPermanentDelete, 
  onTogglePin, 
  isPinned, 
  currentFolder, 
  settings,
  isInTrash,
  onSetReminder,
  reminderTime
}) => {
  const availableFolders = React.useMemo(() => {
    return folders
      .filter(f => {
        const n = typeof f === 'object' ? f.name : f;
        return n !== 'Корзина' && n !== currentFolder;
      })
      .map(f => typeof f === 'object' ? f.name : f);
  }, [folders, currentFolder]);
  
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  
  // Состояния для выбора даты и времени
  const now = new Date();
  const [selectedDay, setSelectedDay] = React.useState(now.getDate());
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth());
  const [selectedHour, setSelectedHour] = React.useState(0);
  const [selectedMinute, setSelectedMinute] = React.useState(0);
  
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setShowDatePicker(false);
      // Сброс на текущую дату при закрытии
      const today = new Date();
      setSelectedDay(today.getDate());
      setSelectedMonth(today.getMonth());
      setSelectedHour(0);
      setSelectedMinute(0);
    }
  }, [visible]);
  
  const brandColor = getBrandColor(settings);
  
  const formatReminderTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}`;
  };
  
  // Получить количество дней в месяце
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Генерация списка дней
  const getDaysList = () => {
    const currentYear = new Date().getFullYear();
    const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };
  
  // Генерация списка месяцев
  const monthsList = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  // Генерация списка часов (0-23)
  const hoursList = [];
  for (let i = 0; i < 24; i++) {
    hoursList.push(i.toString().padStart(2, '0'));
  }
  
  // Генерация списка минут (0-59)
  const minutesList = [];
  for (let i = 0; i < 60; i++) {
    minutesList.push(i.toString().padStart(2, '0'));
  }
  
  const handleSetReminder = () => {
    const currentYear = new Date().getFullYear();
    const selectedDate = new Date(currentYear, selectedMonth, selectedDay, selectedHour, selectedMinute);
    const now = new Date();
    
    // Проверяем, что выбранная дата не в прошлом
    if (selectedDate <= now) {
      Alert.alert('Ошибка', 'Дата и время должны быть в будущем');
      return;
    }
    
    onSetReminder(selectedDate.getTime());
    setShowDatePicker(false);
    onClose();
  };
  
  const showDateTimePicker = () => {
    // Устанавливаем текущую дату и время 00:00
    const today = new Date();
    setSelectedDay(today.getDate());
    setSelectedMonth(today.getMonth());
    setSelectedHour(0);
    setSelectedMinute(0);
    setShowDatePicker(true);
  };
  
  if (!visible) return null;
  
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        opacity: fadeAnim
      }}>
        <Animated.View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 10, 
          width: width - 40,
          maxHeight: '85%',
          transform: [{ scale: scaleAnim }]
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: brandColor }}>
            Действия с заметкой
          </Text>
          
          {/* Кнопки закрепления и напоминания (только не в корзине) */}
          {!isInTrash && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity 
                onPress={() => { onTogglePin(); onClose(); }} 
                style={{ 
                  flex: 1,
                  padding: 12, 
                  alignItems: 'center', 
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: brandColor,
                  borderRadius: 8,
                }}>
                <Icon name="push-pin" size={20} color="white" />
                <Text style={{ fontSize: 14, color: 'white', marginLeft: 6 }}>
                  {isPinned ? "Открепить" : "Закрепить"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={showDateTimePicker} 
                style={{ 
                  flex: 1,
                  padding: 12, 
                  alignItems: 'center', 
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: brandColor,
                  borderRadius: 8,
                }}>
                <Icon name="alarm" size={20} color="white" />
                <Text style={{ fontSize: 14, color: 'white', marginLeft: 6 }}>
                  {reminderTime && reminderTime > Date.now() 
                    ? formatReminderTime(reminderTime)
                    : "Напомнить"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {reminderTime && reminderTime > Date.now() && !isInTrash && (
            <TouchableOpacity 
              onPress={() => onSetReminder(null)} 
              style={{ 
                padding: 8, 
                alignItems: 'center',
                marginBottom: 8
              }}>
              <Text style={{ fontSize: 12, color: brandColor }}>Отменить напоминание</Text>
            </TouchableOpacity>
          )}
          
          {/* Перемещение в папки (для всех заметок, включая корзину) */}
          {availableFolders.length > 0 && (
            <>
              <Text style={{ marginBottom: 8, color: '#666', marginTop: 8 }}>Переместить в папку:</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {availableFolders.map((n, i) => (
                  <TouchableOpacity 
                    key={i} 
                    onPress={() => { onMove(n); onClose(); }} 
                    style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="folder" size={20} color="#666" style={{ marginRight: 12 }} />
                    <Text style={{ fontSize: 16, color: '#333' }}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          
          {/* Кнопки для обычных заметок (не в корзине) */}
          {!isInTrash && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity 
                onPress={() => { onPermanentDelete(); onClose(); }} 
                style={{ 
                  flex: 1,
                  padding: 12, 
                  backgroundColor: '#FF4444', 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  flexDirection: 'row', 
                  justifyContent: 'center' }}>
                <Icon name="delete-forever" size={20} color="white" style={{ marginRight: 6 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Безвозвратно</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => { onDelete(); onClose(); }} 
                style={{ 
                  flex: 1,
                  padding: 12, 
                  backgroundColor: '#F57C00', 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  flexDirection: 'row', 
                  justifyContent: 'center' }}>
                <Icon name="delete" size={20} color="white" style={{ marginRight: 6 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>В корзину</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Кнопка "Удалить безвозвратно" для корзины */}
          {isInTrash && (
            <TouchableOpacity 
              onPress={() => { onPermanentDelete(); onClose(); }} 
              style={{ marginTop: 16, padding: 12, backgroundColor: '#FF4444', borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <Icon name="delete-forever" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Удалить безвозвратно</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: brandColor, fontSize: 16 }}>Отмена</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      
      {/* Модальное окно для выбора даты и времени */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: width - 40 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: brandColor }}>
              Установить напоминание
            </Text>
            
            {/* Выбор дня и месяца */}
            <Text style={{ marginBottom: 8, color: '#666' }}>Дата:</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' }}>
                <Picker
                  selectedValue={selectedDay}
                  onValueChange={(itemValue) => setSelectedDay(itemValue)}
                  style={{ height: 150 }}
                >
                  {getDaysList().map(day => (
                    <Picker.Item key={day} label={day.toString()} value={day} />
                  ))}
                </Picker>
              </View>
              
              <View style={{ flex: 2, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' }}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(itemValue) => {
                    setSelectedMonth(itemValue);
                    // Корректируем день, если выбранный день больше количества дней в новом месяце
                    const currentYear = new Date().getFullYear();
                    const daysInNewMonth = getDaysInMonth(itemValue, currentYear);
                    if (selectedDay > daysInNewMonth) {
                      setSelectedDay(daysInNewMonth);
                    }
                  }}
                  style={{ height: 150 }}
                >
                  {monthsList.map((month, index) => (
                    <Picker.Item key={index} label={month} value={index} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Выбор часа и минуты */}
            <Text style={{ marginBottom: 8, color: '#666' }}>Время:</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' }}>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={(itemValue) => setSelectedHour(itemValue)}
                  style={{ height: 150 }}
                >
                  {hoursList.map(hour => (
                    <Picker.Item key={hour} label={hour} value={parseInt(hour)} />
                  ))}
                </Picker>
              </View>
              
              <View style={{ flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' }}>
                <Picker
                  selectedValue={selectedMinute}
                  onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                  style={{ height: 150 }}
                >
                  {minutesList.map(minute => (
                    <Picker.Item key={minute} label={minute} value={parseInt(minute)} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
              <TouchableOpacity 
                onPress={() => {
                  setShowDatePicker(false);
                }} 
                style={{ padding: 12 }}>
                <Text style={{ color: '#999', fontSize: 16 }}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSetReminder} 
                style={{ padding: 12 }}>
                <Text style={{ color: brandColor, fontWeight: 'bold', fontSize: 16 }}>Установить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default NoteActionDialog;

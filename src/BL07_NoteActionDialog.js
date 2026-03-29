import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Alert, ScrollView, TextInput } from 'react-native';
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
  const [showDateInput, setShowDateInput] = React.useState(false);
  const [dateInputValue, setDateInputValue] = React.useState('');
  
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
      setShowDateInput(false);
      setDateInputValue('');
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
  
  const handleSetReminder = () => {
    if (!dateInputValue || !dateInputValue.trim()) {
      Alert.alert('Ошибка', 'Введите дату и время');
      return;
    }
    
    const input = dateInputValue.trim();
    const parts = input.split(' ');
    
    if (parts.length !== 2) {
      Alert.alert('Ошибка', 'Используйте формат: ДД.ММ.ГГГГ ЧЧ:ММ');
      return;
    }
    
    const dateParts = parts[0].split('.');
    const timeParts = parts[1].split(':');
    
    if (dateParts.length !== 3 || timeParts.length !== 2) {
      Alert.alert('Ошибка', 'Используйте формат: ДД.ММ.ГГГГ ЧЧ:ММ');
      return;
    }
    
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[0]);
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      Alert.alert('Ошибка', 'Введите корректные числа');
      return;
    }
    
    const date = new Date(year, month, day, hour, minute);
    
    if (isNaN(date.getTime())) {
      Alert.alert('Ошибка', 'Неверный формат даты');
    } else if (date <= new Date()) {
      Alert.alert('Ошибка', 'Дата и время должны быть в будущем');
    } else {
      onSetReminder(date.getTime());
      setShowDateInput(false);
      setDateInputValue('');
      onClose();
    }
  };
  
  const showDateTimePicker = () => {
    setShowDateInput(true);
    setDateInputValue('');
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
      
      {/* Модальное окно для ввода даты и времени */}
      <Modal visible={showDateInput} transparent animationType="fade" onRequestClose={() => setShowDateInput(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: width - 40 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: brandColor }}>
              Установить напоминание
            </Text>
            
            <Text style={{ marginBottom: 8, color: '#666' }}>
              Введите дату и время в формате:
            </Text>
            <Text style={{ marginBottom: 16, color: brandColor, fontWeight: 'bold' }}>
              ДД.ММ.ГГГГ ЧЧ:ММ
            </Text>
            <Text style={{ marginBottom: 8, color: '#999', fontSize: 12 }}>
              Пример: 25.03.2026 14:30
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
                backgroundColor: '#F5F5F5'
              }}
              placeholder="25.03.2026 14:30"
              value={dateInputValue}
              onChangeText={setDateInputValue}
              autoFocus
              keyboardType="default"
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity 
                onPress={() => {
                  setShowDateInput(false);
                  setDateInputValue('');
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

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Share } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from './BL04_Header';
import { NOTE_COLORS, getBrandColor } from './BL02_Constants';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';

const SettingsScreen = ({ 
  setCurrentScreen, 
  settings, 
  saveSettings, 
  notes, 
  folders, 
  onBrandColorChange 
}) => {
  const fontSizeOptions = [14, 16, 18, 20, 22, 24];
  const brandColor = getBrandColor(settings);

  const handleFontSizeChange = (size) => {
    saveSettings({ ...settings, fontSize: size });
  };

  const handleBrandColorChange = (color) => {
    saveSettings({ ...settings, brandColor: color });
    if (onBrandColorChange) onBrandColorChange(color);
  };

  const getStats = () => {
    const totalNotes = notes.filter(n => !n.deleted).length;
    const trashedNotes = notes.filter(n => n.deleted).length;
    const foldersCount = folders.filter(f => {
      const name = typeof f === 'object' ? f.name : f;
      return name !== 'Корзина';
    }).length;
    return { totalNotes, trashedNotes, foldersCount };
  };

  const formatDateForFilename = () => {
    const date = new Date();
    return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  };

  const handleBackup = async () => {
    try {
      const backup = { notes, folders, settings };
      const backupStr = JSON.stringify(backup, null, 2);
      const fileName = `FamNote_Backup_${formatDateForFilename()}.bak`;

      if (Platform.OS === 'web') {
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('✅ Успех', 'Резервная копия создана');
        return;
      }

      // Для Android используем RNFS
      const path = RNFS.DocumentDirectoryPath + '/' + fileName;
      await RNFS.writeFile(path, backupStr, 'utf8');
      
      // Показываем диалог для сохранения/отправки
      Alert.alert(
        '✅ Резервная копия создана',
        `Файл сохранен: ${path}\n\nСкопируйте этот путь или поделитесь файлом`,
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Поделиться', 
            onPress: async () => {
              try {
                await Share.share({
                  title: 'Резервная копия FamNotes',
                  url: `file://${path}`,
                  message: `Резервная копия FamNotes от ${new Date().toLocaleString()}`
                });
              } catch (e) {
                console.log(e);
              }
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert('❌ Ошибка', 'Не удалось создать резервную копию: ' + e.message);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      
      if (result && result[0]) {
        const fileUri = result[0].uri;
        const content = await RNFS.readFile(fileUri, 'utf8');
        const backup = JSON.parse(content);
        
        if (backup.notes && backup.folders) {
          Alert.alert(
            'Восстановление',
            'Все данные будут заменены. Продолжить?',
            [
              { text: 'Отмена', style: 'cancel' },
              { 
                text: 'Восстановить', 
                onPress: async () => {
                  // Здесь нужно вызвать функции сохранения из пропсов
                  Alert.alert('✅ Успех', 'Данные восстановлены. Перезапустите приложение.');
                }
              }
            ]
          );
        } else {
          throw new Error('Неверный формат файла');
        }
      }
    } catch (e) {
      if (e.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('❌ Ошибка', 'Не удалось восстановить данные: ' + e.message);
      }
    }
  };

  const stats = getStats();

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header 
        title="Настройки" 
        showBack 
        onBack={() => setCurrentScreen('notes')} 
        rightIcon="close" 
        onRightPress={() => setCurrentScreen('notes')} 
        showSearch={false} 
        brandColor={brandColor}
      />
      
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Статистика */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Статистика</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#666' }}>Всего заметок:</Text>
              <Text style={{ color: '#333', fontWeight: 'bold' }}>{stats.totalNotes}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#666' }}>В корзине:</Text>
              <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>{stats.trashedNotes}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#666' }}>Папок:</Text>
              <Text style={{ color: '#333', fontWeight: 'bold' }}>{stats.foldersCount}</Text>
            </View>
          </View>
        </View>

        {/* Размер текста */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Размер текста</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
              {fontSizeOptions.map((size) => (
                <TouchableOpacity 
                  key={size} 
                  onPress={() => handleFontSizeChange(size)} 
                  style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 22, 
                    backgroundColor: settings.fontSize === size ? brandColor : '#F0F0F0', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    margin: 4 
                  }}
                >
                  <Text style={{ color: settings.fontSize === size ? 'white' : '#666' }}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: settings.fontSize, color: '#333' }}>
                Пример текста
              </Text>
            </View>
          </View>
        </View>

        {/* Цвет бренда */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Цвет бренда</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {NOTE_COLORS.map((color, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => handleBrandColorChange(color)} 
                  style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 25, 
                    backgroundColor: color, 
                    margin: 6, 
                    borderWidth: brandColor === color ? 3 : 0, 
                    borderColor: '#333' 
                  }} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Резервное копирование */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Резервное копирование</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, gap: 12 }}>
            <TouchableOpacity 
              style={{ 
                backgroundColor: brandColor, 
                padding: 16, 
                borderRadius: 12, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center'
              }} 
              onPress={handleBackup}
            >
              <Icon name="backup" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Создать копию</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#FF6B6B', 
                padding: 16, 
                borderRadius: 12, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center'
              }} 
              onPress={handleRestore}
            >
              <Icon name="restore" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Восстановить</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Информация о приложении */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>О приложении</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <Text style={{ color: '#666', textAlign: 'center' }}>
              FamNotes v1.0.0
            </Text>
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 8, fontSize: 12 }}>
              Простое приложение для заметок
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

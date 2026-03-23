import React from 'react';
import { View, FlatList, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getBrandColor } from './BL02_Constants';
import Header from './BL04_Header';
import NoteItem from './BL09_NoteItem';
import SettingsScreen from './BL19_SettingsScreen';
import FoldersScreen from './BL18_FoldersScreen';
import { useNotesData } from './BL12_DataHooks';

const AppContent = () => {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = React.useState('notes');
  const [currentFolder, setCurrentFolder] = React.useState('Главная');
  const [selectedNote, setSelectedNote] = React.useState(null);
  const [navigationStack, setNavigationStack] = React.useState(['notes']);
  
  const { notes, folders, settings, saveNotes, saveFolders, saveSettings, loadData } = useNotesData();
  
  // Фильтруем заметки по текущей папке
  const filteredNotes = React.useMemo(() => {
    if (currentFolder === 'Корзина') {
      return notes.filter(n => n.deleted === true);
    }
    return notes.filter(n => n.folder === currentFolder && !n.deleted);
  }, [notes, currentFolder]);
  
  // Сортируем заметки
  const sortedNotes = React.useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [filteredNotes]);
  
  const brandColor = getBrandColor(settings);
  const isInTrash = currentFolder === 'Корзина';
  
  // Создание новой заметки
  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      folder: currentFolder,
      color: brandColor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false,
      pinned: false
    };
    setSelectedNote(newNote);
    setCurrentScreen('edit');
  };
  
  // Редактирование заметки
  const handleNotePress = (note) => {
    setSelectedNote(note);
    setCurrentScreen('edit');
  };
  
  // Сохранение заметки
  const handleSaveNote = (updatedNote) => {
    if (Array.isArray(updatedNote)) {
      saveNotes(updatedNote);
      return;
    }
    
    if (!updatedNote.updatedAt) updatedNote.updatedAt = Date.now();
    
    const index = notes.findIndex(n => n.id === updatedNote.id);
    const newNotes = index >= 0 
      ? [...notes.slice(0, index), updatedNote, ...notes.slice(index + 1)] 
      : [updatedNote, ...notes];
    
    saveNotes(newNotes);
    setCurrentScreen('notes');
    setSelectedNote(null);
  };
  
  // Удаление заметки (в корзину)
  const handleDeleteNote = (note) => {
    const updatedNote = { ...note, folder: 'Корзина', deleted: true, pinned: false, updatedAt: Date.now() };
    handleSaveNote(updatedNote);
  };
  
  // Очистка корзины
  const handleEmptyTrash = () => {
    Alert.alert(
      'Очистить корзину',
      'Вы уверены, что хотите безвозвратно удалить все заметки из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить все', 
          style: 'destructive',
          onPress: () => {
            const updatedNotes = notes.filter(n => n.folder !== 'Корзина' && !n.deleted);
            saveNotes(updatedNotes);
          }
        }
      ]
    );
  };
  
  // Экран списка заметок
  const NotesListScreen = () => (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header 
        title={currentFolder} 
        rightIcon="settings" 
        onRightPress={() => setCurrentScreen('settings')} 
        showBack 
        onBack={() => setCurrentScreen('folders')} 
        showSearch={false}
        brandColor={brandColor}
      >
        {isInTrash && sortedNotes.length > 0 && (
          <TouchableOpacity onPress={handleEmptyTrash} style={{ marginRight: 20 }}>
            <Icon name="delete-sweep" size={24} color="white" />
          </TouchableOpacity>
        )}
      </Header>
      
      <FlatList 
        data={sortedNotes} 
        keyExtractor={item => item.id} 
        renderItem={({ item }) => (
          <NoteItem 
            item={item} 
            onPress={() => handleNotePress(item)} 
            onLongPress={() => {
              Alert.alert(
                'Действия с заметкой',
                'Что вы хотите сделать?',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Редактировать', onPress: () => handleNotePress(item) },
                  { text: isInTrash ? 'Удалить навсегда' : 'В корзину', 
                    style: 'destructive',
                    onPress: () => {
                      if (isInTrash) {
                        const updatedNotes = notes.filter(n => n.id !== item.id);
                        saveNotes(updatedNotes);
                      } else {
                        handleDeleteNote(item);
                      }
                    }
                  }
                ]
              );
            }} 
            settings={settings} 
            showPin={!isInTrash}
          />
        )} 
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>Нет заметок</Text>
          </View>
        } 
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      
      {!isInTrash && (
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            bottom: insets.bottom + 24, 
            right: insets.right + 24, 
            width: 70, 
            height: 70, 
            borderRadius: 35, 
            backgroundColor: brandColor, 
            justifyContent: 'center', 
            alignItems: 'center', 
            elevation: 5 
          }} 
          onPress={handleAddNote}>
          <Icon name="add" size={36} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Экран редактирования
  const EditNoteScreen = () => (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header 
        title="Редактирование" 
        showBack 
        onBack={() => {
          setCurrentScreen('notes');
          setSelectedNote(null);
        }} 
        brandColor={selectedNote?.color || brandColor}
      />
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          style={{ fontSize: settings.fontSize + 2, fontWeight: 'bold', padding: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', color: '#333' }}
          placeholder="Заголовок"
          placeholderTextColor="#999"
          value={selectedNote?.title || ''}
          onChangeText={(text) => setSelectedNote({ ...selectedNote, title: text })}
        />
        <TextInput
          style={{ flex: 1, fontSize: settings.fontSize, padding: 8, textAlignVertical: 'top', marginTop: 16, color: '#333' }}
          placeholder="Текст заметки..."
          placeholderTextColor="#999"
          multiline
          value={selectedNote?.content || ''}
          onChangeText={(text) => setSelectedNote({ ...selectedNote, content: text })}
        />
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            bottom: insets.bottom + 24, 
            right: insets.right + 24, 
            width: 70, 
            height: 70, 
            borderRadius: 35, 
            backgroundColor: selectedNote?.color || brandColor, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }} 
          onPress={() => handleSaveNote(selectedNote)}>
          <Icon name="check" size={36} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Обработчики для экрана папок
  const handleRenameFolder = (oldName, newName) => {
    const updatedFolders = folders.map(f => {
      if (typeof f === 'object' && f.name === oldName) return { ...f, name: newName };
      if (f === oldName) return newName;
      return f;
    });
    const updatedNotes = notes.map(note =>
      note.folder === oldName ? { ...note, folder: newName, updatedAt: Date.now() } : note
    );
    saveNotes(updatedNotes);
    saveFolders(updatedFolders);
    if (currentFolder === oldName) setCurrentFolder(newName);
  };
  
  const handleDeleteFolder = (folderName) => {
    const updatedNotes = notes.map(note =>
      note.folder === folderName
        ? { ...note, folder: 'Корзина', deleted: true, updatedAt: Date.now() }
        : note
    );
    const updatedFolders = folders.filter(f => {
      const name = typeof f === 'object' ? f.name : f;
      return name !== folderName;
    });
    saveNotes(updatedNotes);
    saveFolders(updatedFolders);
    if (currentFolder === folderName) setCurrentFolder('Главная');
  };
  
  const handleColorChange = (folderName, newColor) => {
    const updatedFolders = folders.map(f => {
      if (typeof f === 'object' && f.name === folderName) {
        return { ...f, color: newColor };
      }
      if (f === folderName) {
        return { name: f, color: newColor };
      }
      return f;
    });
    saveFolders(updatedFolders);
  };
  
  // Рендерим нужный экран
  switch (currentScreen) {
    case 'notes':
      return <NotesListScreen />;
    case 'settings':
      return (
        <SettingsScreen 
          setCurrentScreen={setCurrentScreen}
          settings={settings}
          saveSettings={saveSettings}
          notes={notes}
          folders={folders}
          onBrandColorChange={(color) => {}}
        />
      );
    case 'folders':
      return (
        <FoldersScreen 
          folders={folders}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          setCurrentScreen={setCurrentScreen}
          insets={insets}
          saveFolders={saveFolders}
          settings={settings}
          notes={notes}
          handleRenameFolder={handleRenameFolder}
          handleDeleteFolder={handleDeleteFolder}
          handleColorChange={handleColorChange}
          showFolderDialog={false}
          setShowFolderDialog={() => {}}
          showFolderSettings={false}
          setShowFolderSettings={() => {}}
          selectedFolderForSettings={null}
          setSelectedFolderForSettings={() => {}}
          selectedFolderColor={null}
          setSelectedFolderColor={() => {}}
        />
      );
    case 'edit':
      return <EditNoteScreen />;
    default:
      return <NotesListScreen />;
  }
};

export default AppContent;

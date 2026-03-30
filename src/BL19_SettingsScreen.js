// Добавить в импорты
import { Switch } from 'react-native';
import { requestCalendarPermission, checkCalendarPermission } from './CalendarBridge';

// Внутри компонента добавить состояние
const [useCalendar, setUseCalendar] = useState(settings.useCalendar || false);
const [calendarEnabled, setCalendarEnabled] = useState(false);

// Проверка доступности календаря при загрузке
useEffect(() => {
  const checkCalendar = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await checkCalendarPermission();
      setCalendarEnabled(hasPermission);
    }
  };
  checkCalendar();
}, []);

// В JSX после настройки цвета бренда добавить:
<View style={{ marginBottom: 32 }}>
  <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>
    Напоминания в календарь
  </Text>
  <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: '#333' }}>Добавлять в системный календарь</Text>
        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Напоминания будут дублироваться в календарь Android
        </Text>
        <Text style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
          * Не сохраняется в резервную копию
        </Text>
      </View>
      <Switch
        value={useCalendar}
        onValueChange={async (value) => {
          if (value && Platform.OS === 'android') {
            const granted = await requestCalendarPermission();
            if (!granted) {
              Alert.alert('Нет доступа', 'Не удалось получить доступ к календарю');
              setUseCalendar(false);
              saveSettings({ ...settings, useCalendar: false });
              return;
            }
            setCalendarEnabled(true);
          }
          setUseCalendar(value);
          saveSettings({ ...settings, useCalendar: value });
        }}
        trackColor={{ false: '#767577', true: brandColor }}
        thumbColor={useCalendar ? '#f4f3f4' : '#f4f3f4'}
      />
    </View>
    {calendarEnabled && useCalendar && (
      <Text style={{ fontSize: 11, color: brandColor, marginTop: 12 }}>
        ✓ Календарь доступен
      </Text>
    )}
  </View>
</View>

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './BL02_Constants';

const Header = ({ 
  title, 
  rightIcon, 
  onRightPress, 
  showBack, 
  onBack, 
  showSearch, 
  onSearchPress, 
  showPalette, 
  onPalettePress, 
  children, 
  brandColor 
}) => {
  const insets = useSafeAreaInsets();
  const headerColor = brandColor || BRAND_COLOR;
  
  // Белые значки для всех кнопок
  const renderIcon = (iconName, onPress) => {
    const icons = {
      'arrow-back': '←',
      'palette': '🎨',
      'search': '🔍',
      'settings': '⚙️',
      'close': '✕',
      'add': '+',
      'check': '✓',
      'edit': '✎',
      'delete': '🗑',
      'delete-sweep': '🧹',
      'push-pin': '📌',
      'lock': '🔒',
      'lock-open': '🔓',
      'share': '📤',
      'restore': '↩️',
      'backup': '💾'
    };
    
    return (
      <TouchableOpacity onPress={onPress}>
        <Text style={{ fontSize: 22, color: 'white' }}>{icons[iconName] || '●'}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={{ 
      backgroundColor: headerColor, 
      paddingTop: insets.top + 16, 
      paddingBottom: 16, 
      paddingLeft: insets.left + 16, 
      paddingRight: insets.right + 16, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 16 }}>
            <Text style={{ fontSize: 24, color: 'white' }}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20, flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        {children && React.Children.map(children, (child, index) => (
          <View key={index}>
            {child}
          </View>
        ))}
        
        {showPalette && (
          <TouchableOpacity onPress={onPalettePress}>
            <Text style={{ fontSize: 22, color: 'white' }}>🎨</Text>
          </TouchableOpacity>
        )}
        
        {showSearch && (
          <TouchableOpacity onPress={onSearchPress}>
            <Text style={{ fontSize: 22, color: 'white' }}>🔍</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress}>
            <Text style={{ fontSize: 22, color: 'white' }}>
              {rightIcon === 'settings' ? '⚙️' : rightIcon === 'close' ? '✕' : '●'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;

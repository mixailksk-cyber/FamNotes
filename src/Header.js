import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Icon } from './imports';
import { BRAND_COLOR } from './constants';

const Header = ({ title, rightIcon, onRightPress, showBack, onBack, showSearch, onSearchPress, showPalette, onPalettePress, children, brandColor }) => {
  const headerColor = brandColor || BRAND_COLOR;
  const statusBarHeight = 44;
  
  const childrenArray = React.Children.toArray(children);
  
  return (
    <View style={{ 
      backgroundColor: headerColor, 
      paddingTop: statusBarHeight + 16, 
      paddingBottom: 16, 
      paddingLeft: 16, 
      paddingRight: 16, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 16 }}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20, flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {childrenArray.map((child, index) => (
          <View key={index} style={{ marginRight: index < childrenArray.length - 1 ? 20 : 0 }}>
            {child}
          </View>
        ))}
        
        {childrenArray.length > 0 && (showPalette || showSearch || rightIcon) && (
          <View style={{ width: 20 }} />
        )}
        
        {showPalette && (
          <TouchableOpacity onPress={onPalettePress} style={{ marginRight: showSearch || rightIcon ? 20 : 0 }}>
            <Icon name="palette" size={24} color="white" />
          </TouchableOpacity>
        )}
        {showSearch && (
          <TouchableOpacity onPress={onSearchPress} style={{ marginRight: rightIcon ? 20 : 0 }}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress}>
            <Icon name={rightIcon} size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;

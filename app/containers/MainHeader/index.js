import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {Avatar} from 'react-native-paper';

import styles from './style';
import {useTheme} from '../../theme';
import images from '../../assets/images';
import {VectorIcon} from '../VectorIcon';
import {useNavigation} from '@react-navigation/native';
import {themes} from '../../constants/colors';
import I18n from 'i18n-js';

const MainHeader = ({
  avatarImage,
  onChangeText,
  clearInput,
  ...otherInputProps
}) => {
  const {theme} = useTheme();

  const [showSearchIcon, setShowSearchIcon] = useState(true);

  const inputRef = useRef();
  const navigation = useNavigation();

  const focusInput = () => {
    setShowSearchIcon(false);
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  };

  const clearInputFocus = () => {
    inputRef.current.clear();
    setTimeout(() => {
      setShowSearchIcon(true);
      if (clearInput && typeof clearInput === 'function') {
        clearInput();
      }
    }, 100);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        {/* <VectorIcon type="MaterialCommunityIcons" name="menu" color={themes[theme].titleColor} size={24} /> */}
        <Image source={theme === 'dark' ? images.menu_item : images.menu_item_dark} style={{width: 21, height: 15}} />
      </TouchableOpacity>
      {showSearchIcon ? (
        <Pressable style={styles.searchAndInput} onPress={focusInput}>
          <VectorIcon
            type="MaterialCommunityIcons"
            name="magnify"
            color="#828282"
            size={24}
          />
          <Text style={styles.searchHereText}>{I18n.t('Start_Searching')}</Text>
        </Pressable>
      ) : (
        <>
          <TextInput
            ref={inputRef}
            style={[styles.input, {color: themes[theme].textColor}]}
            onChangeText={onChangeText}
            {...otherInputProps}
            onFocus={() => setShowSearchIcon(false)}
          />
          <VectorIcon
            type="AntDesign"
            name="close"
            color="#828282"
            style={styles.closeIcon}
            onPress={clearInputFocus}
            size={18}
          />
        </>
      )}
      <Avatar.Image
        source={avatarImage.length > 0 ? avatarImage : images.default_avatar}
        style={styles.avatarImage}
        size={32}
      />
    </View>
  );
};

export default MainHeader;

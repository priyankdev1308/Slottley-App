import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

import { TextInputProps } from '../interface/common';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import EyeIcon from './EyeIcon';

const CustomTextInput = ({
  value,
  label,
  placeholder,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  editable = true,
  maxLength,
  onBlur,
  onFocus,
  containerStyle,
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = !!secureTextEntry;
  const eyeColor = isFocused ? colors.primary : colors.subText;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.placeHolder}
          onChangeText={onChangeText}
          secureTextEntry={isPasswordField ? !isPasswordVisible : secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          maxLength={maxLength}
          style={styles.input}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={e => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />

        {isPasswordField && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(v => !v)}
          >
            <EyeIcon visible={isPasswordVisible} color={eyeColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: hp(18),
  },
  label: {
    marginBottom: hp(8),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  inputRow: {
    height: hp(52),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(12),
    paddingHorizontal: wp(16),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.textPlaceHolderColor,
  },
  inputRowFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    padding: 0,
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato400,
  },
});

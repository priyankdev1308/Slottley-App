import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { CustomButtonProps } from '../interface/common';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

const CustomButton = ({
  title,
  onPress,
  loader,
  loaderColor,
  disable,
  buttonStyle,
  textStyle,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disable || loader}
      onPress={onPress}
      style={[styles.button, buttonStyle, !!disable && styles.disabled]}
    >
      {loader ? (
        <ActivityIndicator color={loaderColor ?? colors.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    height: hp(56),
    width: '100%',
    borderRadius: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: wp(10),
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
});

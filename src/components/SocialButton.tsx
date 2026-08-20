import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface SocialButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const SocialButton = ({ label, icon, onPress }: SocialButtonProps) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.button}>
    {icon}
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

export default SocialButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(52),
    borderRadius: wp(16),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.textPlaceHolderColor,
    gap: wp(8),
  },
  label: {
    color: colors.black,
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
});

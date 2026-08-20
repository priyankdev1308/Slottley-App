import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface RegisterOptionCardProps {
  icon: React.ReactNode;
  title: string;
  selected: boolean;
  onPress: () => void;
}

const RegisterOptionCard = ({
  icon,
  title,
  selected,
  onPress,
}: RegisterOptionCardProps) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
  >
    <View style={styles.iconWrap}>{icon}</View>
    <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
  </TouchableOpacity>
);

export default RegisterOptionCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lightWhite,
    borderRadius: wp(16),
    paddingVertical: hp(18),
    backgroundColor: colors.lightGrayF5F5F5,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  iconWrap: {
    marginBottom: hp(10),
  },
  title: {
    color: colors.darkGray,
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
  titleSelected: {
    color: colors.white,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

const OrDivider = () => (
  <View style={styles.row}>
    <View style={styles.line} />
    <Text style={styles.text}>OR</Text>
    <View style={styles.line} />
  </View>
);

export default OrDivider;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(20),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightWhite,
  },
  text: {
    marginHorizontal: wp(12),
    color: colors.subText,
    fontFamily: fonts.Lato400,
    fontSize: fontSize(14),
  },
});

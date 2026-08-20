import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface AuthHeaderProps {
  heading: string;
}

const AuthHeader = ({ heading }: AuthHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image source={images.logo} style={styles.logo} />
      </View>
      <Text style={styles.wordmark}>Slottley</Text>
      <Text style={styles.heading}>{heading}</Text>
    </View>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: hp(24),
    paddingBottom: hp(48),
    paddingHorizontal: wp(24),
  },
  logoBox: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(16),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: wp(46),
    height: wp(46),
    resizeMode: 'contain',
  },
  wordmark: {
    marginTop: hp(14),
    color: colors.white,
    fontSize: fontSize(28),
    fontFamily: fonts.CormorantGaramondBold,
    fontWeight: '700'
  },
  heading: {
    marginTop: hp(10),
    color: colors.white,
    textAlign: 'center',
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
  },
});

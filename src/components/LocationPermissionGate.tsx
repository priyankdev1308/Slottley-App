import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface LocationPermissionGateProps {
  canAskAgain: boolean;
  onPress: () => void;
  message?: string;
}

const LocationPermissionGate = ({
  canAskAgain,
  onPress,
  message = 'Turn on location to see spaces near you.',
}: LocationPermissionGateProps) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
    <TouchableOpacity activeOpacity={0.85} style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{canAskAgain ? 'Allow Location' : 'Open Settings'}</Text>
    </TouchableOpacity>
  </View>
);

export default LocationPermissionGate;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(30),
    paddingHorizontal: wp(24),
  },
  message: {
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
    marginBottom: hp(14),
  },
  button: {
    paddingHorizontal: wp(24),
    paddingVertical: hp(12),
    borderRadius: wp(24),
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
});

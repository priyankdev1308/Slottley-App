import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
}

export const MastercardIcon = ({ size = 28 }: IconProps) => (
  <Svg width={size} height={size * 0.64} viewBox="0 0 32 20">
    <Circle cx="12" cy="10" r="10" fill="#EB001B" />
    <Circle cx="20" cy="10" r="10" fill="#F79E1B" fillOpacity={0.9} />
  </Svg>
);

export const VisaIcon = ({ size = 28 }: IconProps) => (
  <View style={[styles.visaWrap, { width: size * 1.7 }]}>
    <Text style={styles.visaText}>VISA</Text>
  </View>
);

const styles = StyleSheet.create({
  visaWrap: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  visaText: {
    color: '#1A1F71',
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { hp, wp } from '../helpers/responsive';

interface ProgressBarProps {
  progress: number; // 0..1
  fill: string;
  track: string;
  style?: StyleProp<ViewStyle>;
}

const ProgressBar = ({ progress, fill, track, style }: ProgressBarProps) => {
  const pct = `${Math.min(Math.max(progress, 0), 1) * 100}%` as const;
  return (
    <View style={[styles.track, { backgroundColor: track }, style]}>
      <View style={[styles.fill, { backgroundColor: fill, width: pct }]} />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  track: {
    height: hp(7),
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: wp(4),
  },
});

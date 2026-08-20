import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';

import { colors } from '../utils/colors';
import { wp } from '../helpers/responsive';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const THUMB_SIZE = wp(22);

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const RangeSlider = ({ min, max, value, onChange }: RangeSliderProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWidthRef.current = w;
    setTrackWidth(w);
  };

  const posForValue = (v: number) => {
    if (trackWidthRef.current <= 0) return 0;
    return ((v - min) / (max - min)) * trackWidthRef.current;
  };

  const valueForPos = (pos: number) => {
    const ratio = clamp(pos / trackWidthRef.current, 0, 1);
    return Math.round(min + ratio * (max - min));
  };

  const createResponder = (thumbIndex: 0 | 1) => {
    const startValue = { current: value[thumbIndex] };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startValue.current = valueRef.current[thumbIndex];
      },
      onPanResponderMove: (_, gesture) => {
        const startPos = posForValue(startValue.current);
        const newPos = clamp(startPos + gesture.dx, 0, trackWidthRef.current);
        const [minV, maxV] = valueRef.current;
        if (thumbIndex === 0) {
          onChange([clamp(valueForPos(newPos), min, maxV), maxV]);
        } else {
          onChange([minV, clamp(valueForPos(newPos), minV, max)]);
        }
      },
    });
  };

  const minResponder = useRef(createResponder(0)).current;
  const maxResponder = useRef(createResponder(1)).current;

  const minPos = posForValue(value[0]);
  const maxPos = posForValue(value[1]);

  return (
    <View style={styles.wrapper} onLayout={onTrackLayout}>
      <View style={styles.track} />
      {trackWidth > 0 && (
        <>
          <View
            style={[
              styles.activeTrack,
              { left: minPos, width: Math.max(maxPos - minPos, 0) },
            ]}
          />
          <View
            style={[styles.thumb, { left: minPos - THUMB_SIZE / 2 }]}
            {...minResponder.panHandlers}
          />
          <View
            style={[styles.thumb, { left: maxPos - THUMB_SIZE / 2 }]}
            {...maxResponder.panHandlers}
          />
        </>
      )}
    </View>
  );
};

export default RangeSlider;

const styles = StyleSheet.create({
  wrapper: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.EBEBEB,
  },
  activeTrack: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
  },
});

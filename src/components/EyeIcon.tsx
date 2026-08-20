import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface EyeIconProps {
  visible: boolean;
  size?: number;
  color?: string;
}

const EyeIcon = ({ visible, size = 20, color = '#999' }: EyeIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    {!visible && (
      <Path
        d="M3 3l18 18"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    )}
  </Svg>
);

export default EyeIcon;

import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const MastercardIcon = ({ size = 28 }: IconProps) => (
  <Svg width={size} height={size * 0.64} viewBox="0 0 28 18" fill="none">
    <Circle cx="10" cy="9" r="9" fill="#EA001B" />
    <Circle cx="18" cy="9" r="9" fill="#F79E1B" />
    <Path
      d="M14 2.7a9 9 0 010 12.6 9 9 0 010-12.6z"
      fill="#FF5F00"
    />
  </Svg>
);

export const PlusCircleIcon = ({ size = 20, color = '#153529' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const TrashIcon = ({ size = 16, color = '#D00010' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-.7 12.1a2 2 0 01-2 1.9H8.7a2 2 0 01-2-1.9L6 7h12z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="10" y1="11" x2="10" y2="16" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Line x1="14" y1="11" x2="14" y2="16" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const CloseIcon = ({ size = 16, color = '#153529' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

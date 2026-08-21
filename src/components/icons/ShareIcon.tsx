import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface ShareIconProps {
  size?: number;
  color?: string;
}

const ShareIcon = ({ size = 18, color = '#153529' }: ShareIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={2} />
    <Path d="M8.6 10.5L15.4 6.5M8.6 13.5L15.4 17.5" stroke={color} strokeWidth={2} />
  </Svg>
);

export default ShareIcon;

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface LogoProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export function Logo({
  size = 72,
  color = Colors.primary,
  accentColor = Colors.gold,
}: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx="40" cy="40" r="38" fill={color} />
      <Circle cx="40" cy="40" r="35" fill="none" stroke={accentColor} strokeWidth="1.2" />
      <Path
        d="M10,40 L20,40 L25,28 L31,52 L36,34 L41,46 L46,40 L52,24 L57,56 L62,40 L70,40"
        fill="none"
        stroke={accentColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
